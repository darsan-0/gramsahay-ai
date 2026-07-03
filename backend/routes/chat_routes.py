"""
HTTP routes for the GramSahay AI chatbot.
"""

import os
import time
import logging
from pathlib import Path
from collections import defaultdict
from dotenv import load_dotenv
from flask import Blueprint, current_app, has_app_context, jsonify, request

from services.ai_service import generate_ai_response, generate_ai_response_contextual
from services.recommendation_service import recommend_schemes_from_chat_message, build_chat_reply
from services.translation_service import attach_language_metadata
from utils.helpers import get_cached_schemes

_BACKEND_ROOT = Path(__file__).resolve().parent.parent
load_dotenv(_BACKEND_ROOT / ".env", override=False)

chat_bp = Blueprint("chat", __name__, url_prefix="/api")

# Set up structured logger
logger = logging.getLogger("gramsahay.chat")

# Memory store for rate limits: client_ip -> [timestamps]
ip_requests = defaultdict(list)


@chat_bp.before_request
def check_rate_limit():
    """
    IP-based rate limiting middleware.
    Configured via env: LIMIT_CHAT_REQUESTS (default: 15), LIMIT_CHAT_WINDOW (default: 60)
    """
    if current_app.config.get("TESTING") and not current_app.config.get("TEST_RATE_LIMIT"):
        return

    limit = int(os.environ.get("LIMIT_CHAT_REQUESTS", "15"))
    window = int(os.environ.get("LIMIT_CHAT_WINDOW", "60"))

    # Get client IP address
    ip = request.headers.get("X-Forwarded-For", request.remote_addr)
    if ip and "," in ip:
        ip = ip.split(",")[0].strip()

    now = time.time()
    ip_requests[ip] = [t for t in ip_requests[ip] if now - t < window]

    if len(ip_requests[ip]) >= limit:
        logger.warning(
            f"[RateLimit] Rate limit exceeded for IP: {ip}. Current window requests: {len(ip_requests[ip])}"
        )
        return jsonify({
            "error": "Too many requests. Please wait a moment before trying again.",
            "status": "rate_limited"
        }), 429

    ip_requests[ip].append(now)


def _load_all_schemes():
    """Read schemes array from the JSON path configured on the Flask app using memory cache."""
    path = current_app.config["SCHEMES_JSON_PATH"]
    return get_cached_schemes(path)


def _groq_api_key() -> str:
    """Prefer Flask config; fall back to process env."""
    if has_app_context():
        return (current_app.config.get("GROQ_API_KEY") or os.environ.get("GROQ_API_KEY") or "").strip()
    return os.environ.get("GROQ_API_KEY", "").strip()


def _groq_model() -> str:
    if has_app_context():
        return (current_app.config.get("GROQ_MODEL") or os.environ.get("GROQ_MODEL") or "").strip()
    return os.environ.get("GROQ_MODEL", "").strip()


def is_follow_up_query(message: str) -> bool:
    """Check if query is asking for details about the active scheme."""
    text = message.lower()
    keywords = [
        "apply", "how to", "how do i", "website", "link", "documents", "certificates", 
        "eligibility", "eligible", "qualified", "benefits", "how much", "amount", 
        "money", "last date", "deadline", "helpline", "phone", "contact", "details",
        "official", "tell me more", "explain", "about this", "portal",
        "ఎలా", "దరఖాస్తు", "పత్రాలు", "అర్హత", "లాభాలు", "వెబ్", "లింక్"
    ]
    return any(kw in text for kw in keywords)


def matches_scheme_name(message: str, scheme: dict, language: str) -> bool:
    """Check if user message explicitly mentions the scheme name or abbreviation."""
    msg = message.lower()
    lang_suffix = "_te" if language == "te" else "_en"
    name = (scheme.get(f"scheme_name{lang_suffix}") or scheme.get("scheme_name") or "").lower()

    if "kisan" in name and "kisan" in msg:
        return True
    if "rythu bharosa" in name and "rythu bharosa" in msg:
        return True
    if "rythu" in name and "rythu" in msg and "bharosa" not in msg:
        # Avoid greedy collision between Rythu and Rythu Bharosa
        return True
    if "scholarship" in name or "jvd" in name:
        if "scholarship" in msg or "jvd" in msg or "scholar" in msg or "చదువు" in msg:
            return True
    if "vaidya" in name or "ntr" in name or "seva" in name:
        if "vaidya" in msg or "seva" in msg or "health" in msg or "ఆరోగ్యం" in msg:
            return True
    if "bharosa" in name and "rythu bharosa" not in name:
        if "bharosa" in msg or "భరోసా" in msg:
            return True
    if "pension" in name:
        if "pension" in msg or "పెన్షన్" in msg:
            return True

    # Check for direct word inclusions
    clean_name = "".join(c for c in name if c.isalnum() or c.isspace())
    for word in clean_name.split():
        if len(word) > 3 and word in msg:
            return True
    return False


@chat_bp.route("/chat", methods=["POST"])
def chat_recommendations():
    """
    POST /api/chat

    Body (JSON):
        message: str — user question
        language: str — optional, e.g. "en" or "te"
        context: dict — contains history, active_scheme_id, previous_scheme_ids, user_profile
    """
    if not request.is_json:
        logger.error("[ChatAPI] Request Content-Type is not application/json")
        return jsonify({"error": "Expected Content-Type: application/json"}), 400

    body = request.get_json(silent=True) or {}
    raw_message = body.get("message", "")
    message = raw_message if isinstance(raw_message, str) else str(raw_message)
    language = (body.get("language") or "en").strip().lower()

    # Extract context memory fields
    context = body.get("context") or {}
    history = context.get("history", [])
    active_scheme_id = context.get("active_scheme_id")
    previous_scheme_ids = context.get("previous_scheme_ids") or []
    user_profile = context.get("user_profile") or {}

    logger.info(
        f"[ChatAPI] Processing message. Lang: {language}. ActiveScheme: {active_scheme_id}. PrevSchemesCount: {len(previous_scheme_ids)}"
    )

    try:
        schemes = _load_all_schemes()
    except FileNotFoundError as err:
        logger.error(f"[ChatAPI] Schemes file not found: {err}")
        return jsonify({"error": str(err)}), 500
    except Exception as err:
        logger.error(f"[ChatAPI] Error loading schemes: {err}")
        return jsonify({"error": "Could not load schemes database", "detail": str(err)}), 500

    # 1. First check if the user explicitly mentions a scheme name in the message
    explicit_scheme = None
    for s in schemes:
        if matches_scheme_name(message, s, language):
            explicit_scheme = s
            break

    is_follow_up = is_follow_up_query(message)
    is_ambiguous = False
    active_scheme = None

    if explicit_scheme:
        # Direct mention found: lock onto this specific scheme
        matched_schemes = [explicit_scheme]
        active_scheme_id = explicit_scheme.get("id")
        category = explicit_scheme.get("category")
        status = "matched"
    elif len(previous_scheme_ids) > 1 and is_follow_up:
        # No explicit mention, and we have multiple previous schemes with a follow-up query
        is_ambiguous = True
        prev_schemes = []
        for pid in previous_scheme_ids:
            for s in schemes:
                if s.get("id") == pid:
                    prev_schemes.append(s)
                    break
    else:
        # Standard follow-up or new category query
        if active_scheme_id:
            for s in schemes:
                if s.get("id") == active_scheme_id:
                    active_scheme = s
                    break

        if is_follow_up and active_scheme:
            matched_schemes = [active_scheme]
            category = active_scheme.get("category")
            status = "matched"
        else:
            rules_res = recommend_schemes_from_chat_message(message, schemes, language=language)
            status = rules_res.get("status", "no_match")
            category = rules_res.get("category")
            matched_schemes = rules_res.get("schemes") or []

            if matched_schemes and len(matched_schemes) == 1:
                active_scheme_id = matched_schemes[0].get("id")
            elif matched_schemes:
                active_scheme_id = None

    if is_ambiguous:
        # Clarify instead of choosing a default
        lines = []
        if language == "te":
            lines.append("మీరు ఏ పథకం గురించి తెలుసుకోవాలనుకుంటున్నారు?")
            for s in prev_schemes:
                name = s.get("scheme_name_te") or s.get("scheme_name")
                lines.append(f"• {name}")
        else:
            lines.append("Which scheme would you like to know about?")
            for s in prev_schemes:
                name = s.get("scheme_name_en") or s.get("scheme_name")
                lines.append(f"• {name}")

        clarification_reply = "\n".join(lines)
        response_payload = {
            "status": "matched",
            "type": "ai",
            "category": prev_schemes[0].get("category"),
            "schemes": prev_schemes,
            "reply": clarification_reply,
            "response": clarification_reply,
            "engine": "ambiguous_clarification",
            "active_scheme_id": None,
            "user_profile": user_profile,
            "echo": {
                "message": message,
                "language": language,
            },
        }
        return jsonify(attach_language_metadata(response_payload, language)), 200

    # Update profile mapping
    if category:
        user_profile["occupation"] = category

    # 4. Generate response using Groq AI
    api_key = _groq_api_key()
    model = _groq_model()
    ai_reply = None

    if api_key:
        logger.info("[ChatAPI] Calling Groq API with context schemes.")
        ai_reply = generate_ai_response_contextual(
            user_message=message,
            language=language,
            api_key=api_key,
            model=model,
            history=history,
            retrieved_schemes=matched_schemes,
            all_schemes=schemes,
            user_profile=user_profile
        )

    # 5. Fallback if API key is missing or request fails
    if not ai_reply:
        logger.warning("[ChatAPI] Groq is unavailable. Falling back to rules engine.")
        ai_reply = build_chat_reply(category, matched_schemes, language)
        engine = "keyword_rules_fallback"
        status = "matched" if matched_schemes else "no_match"
        response_type = "schemes" if matched_schemes else "rules_fallback"
    else:
        engine = "groq_conversational"
        status = "ai"
        response_type = "ai"

    response_payload = {
        "status": status,
        "type": response_type,
        "category": category,
        "schemes": matched_schemes,
        "reply": ai_reply,
        "response": ai_reply,
        "engine": engine,
        "active_scheme_id": active_scheme_id,
        "user_profile": user_profile,
        "echo": {
            "message": message,
            "language": language,
        },
    }

    return jsonify(attach_language_metadata(response_payload, language)), 200
