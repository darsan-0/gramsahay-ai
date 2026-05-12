"""
HTTP routes for the GramSahay AI chatbot.

POST /api/chat pipeline (two stages, beginner-friendly):
    1. **Rule-based** — `recommendation_service` matches keywords → returns
       localized schemes when an intent fits (accurate, multilingual).
    2. **Groq AI** — if no intent matched (`status == "no_match"`), call
       `ai_service.generate_ai_response()` for a general reply (English / Telugu).

API keys never leave the server. See `services/ai_service.py` for prompts.
"""

import os
from pathlib import Path

from dotenv import load_dotenv
from flask import Blueprint, current_app, has_app_context, jsonify, request

from services.ai_service import generate_ai_response
from services.recommendation_service import recommend_schemes_from_chat_message
from services.translation_service import attach_language_metadata
from utils.helpers import load_json_file

# ---------------------------------------------------------------------------
# Load .env here as well as in config.py — some runners import routes before
# config runs, so this guarantees GROQ_* is visible via os.environ.
# ---------------------------------------------------------------------------
_BACKEND_ROOT = Path(__file__).resolve().parent.parent
load_dotenv(_BACKEND_ROOT / ".env", override=False)

chat_bp = Blueprint("chat", __name__, url_prefix="/api")


def _load_all_schemes():
    """Read schemes array from the JSON path configured on the Flask app."""
    path = current_app.config["SCHEMES_JSON_PATH"]
    data = load_json_file(path)
    schemes = data.get("schemes", [])
    if not isinstance(schemes, list):
        return []
    return schemes


def _groq_api_key() -> str:
    """Prefer Flask config; fall back to process env (fixes missing key on app.config)."""
    if has_app_context():
        return (current_app.config.get("GROQ_API_KEY") or os.environ.get("GROQ_API_KEY") or "").strip()
    return os.environ.get("GROQ_API_KEY", "").strip()


def _groq_model() -> str:
    if has_app_context():
        return (current_app.config.get("GROQ_MODEL") or os.environ.get("GROQ_MODEL") or "").strip()
    return os.environ.get("GROQ_MODEL", "").strip()


def _enrich_with_type(result: dict) -> dict:
    """Add response `type` for clients without breaking existing `status` field."""
    status = result.get("status")
    if status == "matched":
        result["type"] = "schemes"
    elif status == "no_schemes":
        result["type"] = "no_schemes"
    elif status == "no_match":
        result["type"] = "rules_fallback"
    elif status == "ai":
        result["type"] = "ai"
    return result


def _apply_groq_fallback(result: dict, message: str, language: str, schemes: list) -> dict:
    """
    When rules return `no_match` (no keyword intent), ask Groq for a reply.

    - Success: `status` → `ai`, `reply` + `response` set to model text.
    - Missing key / API error: keep rule-based `reply`, set `ai_error` for debugging.
    """
    if result.get("status") != "no_match":
        return result

    ai_reply = generate_ai_response(
        user_message=message,
        language=language,
        api_key=_groq_api_key(),
        model=_groq_model(),
        schemes=schemes,
    )

    result["status"] = "ai"
    result["type"] = "ai"
    result["reply"] = ai_reply
    result["response"] = ai_reply
    result["category"] = None
    result["schemes"] = []

    return result


@chat_bp.route("/chat", methods=["POST"])
def chat_recommendations():
    """
    POST /api/chat

    Body (JSON):
        message: str — user question
        language: str — optional, e.g. "en" or "te"
        context: dict — reserved for future personalization

    Returns (non-exhaustive):
        status: "matched" | "no_schemes" | "no_match" | "ai"
        type: "schemes" | "no_schemes" | "rules_fallback" | "ai"
        category, schemes, reply, engine
        When Groq succeeds: `response` (same text as `reply`) and type `ai`
        When Groq skipped/failed: optional `ai_error` { code, message }
    """
    if not request.is_json:
        return jsonify({"error": "Expected Content-Type: application/json"}), 400

    body = request.get_json(silent=True) or {}
    raw_message = body.get("message", "")
    message = raw_message if isinstance(raw_message, str) else str(raw_message)
    language = (body.get("language") or "en").strip().lower()

    try:
        schemes = _load_all_schemes()
    except FileNotFoundError as err:
        return jsonify({"error": str(err)}), 500
    except Exception as err:  # pragma: no cover - invalid JSON file
        return jsonify({"error": "Could not load schemes database", "detail": str(err)}), 500

    # 1) Rules first (multilingual scheme rows unchanged)
    result = recommend_schemes_from_chat_message(message, schemes, language=language)

    # 2) If no scheme category matched → Groq conversational fallback
    result = _apply_groq_fallback(result, message, language, schemes)

    result = _enrich_with_type(result)

    response_payload = {
        **result,
        "echo": {
            "message": message,
            "language": language,
        },
    }

    return jsonify(attach_language_metadata(response_payload, language)), 200
