"""
Groq-powered conversational layer for GramSahay AI.
"""

from __future__ import annotations

import os
import re
import traceback
from pathlib import Path
from typing import Any, Dict, List, Optional

from dotenv import load_dotenv
from services.translation_service import normalize_ui_language

# Load environment variables. The first call supports normal deployments; the
# second call makes local `backend/.env` work even when the app starts from the
# project root.
load_dotenv()
load_dotenv(Path(__file__).resolve().parent.parent / ".env", override=False)

# Default Groq model
DEFAULT_GROQ_MODEL = "llama-3.1-8b-instant"
DEPRECATED_GROQ_MODELS = {
    "llama3-8b-8192": DEFAULT_GROQ_MODEL,
}

SYSTEM_PROMPT_EN = """
You are GramSahay AI — a friendly rural government assistant helping Indian villagers.

Rules:
- Use simple and easy English.
- Keep answers short and practical.
- Help users understand government schemes and digital services.
- Be respectful and supportive.
- If user asks in Telugu, respond naturally in Telugu.
"""

SYSTEM_PROMPT_TE = """
మీరు గ్రామసహాయ్ AI — భారత గ్రామీణ ప్రజలకు సహాయం చేసే స్నేహపూర్వక ప్రభుత్వ సహాయకుడు.

నియమాలు:
- సరళమైన తెలుగులో సమాధానం ఇవ్వండి.
- చిన్న మరియు ఉపయోగకరమైన సమాధానాలు ఇవ్వండి.
- ప్రభుత్వ పథకాలు మరియు డిజిటల్ సేవల గురించి సహాయం చేయండి.
- గౌరవంగా మరియు సహాయకంగా ఉండండి.
"""

def _scheme_names_preview(schemes: List[Dict[str, Any]], limit: int = 10) -> str:
    """Generate short scheme preview for AI context."""
    names = []

    for row in schemes[:limit]:
        name = (
            row.get("scheme_name_en")
            or row.get("scheme_name")
            or row.get("scheme_name_te")
        )

        if name:
            names.append(str(name))

    return ", ".join(names)


def _user_language_instruction(language: str) -> str:
    """Language preference instruction."""
    lc = normalize_ui_language(language)

    if lc == "te":
        return "Reply in Telugu."

    return "Reply in English."


def _build_messages(
    user_message: str,
    language: str,
    schemes: List[Dict[str, Any]],
) -> List[Dict[str, str]]:
    """Build Groq chat messages."""

    lc = normalize_ui_language(language)

    system_prompt = SYSTEM_PROMPT_TE if lc == "te" else SYSTEM_PROMPT_EN

    scheme_context = _scheme_names_preview(schemes)

    return [
        {
            "role": "system",
            "content": system_prompt
        },
        {
            "role": "system",
            "content": f"Available schemes include: {scheme_context}"
        },
        {
            "role": "user",
            "content": f"{_user_language_instruction(language)}\n\n{user_message}"
        }
    ]


def _select_model(model: str) -> str:
    """Choose a supported Groq model, replacing old model names when needed."""
    selected = (model or os.environ.get("GROQ_MODEL") or DEFAULT_GROQ_MODEL).strip()
    return DEPRECATED_GROQ_MODELS.get(selected, selected)


def _safe_error_message(exc: Exception, language: str) -> str:
    """Safe user-friendly error messages."""

    lc = normalize_ui_language(language)

    error_text = str(exc).lower()

    if "401" in error_text or "403" in error_text:
        if lc == "te":
            return "API కీ సమస్య ఉంది."
        return "There is an API configuration issue."

    if "429" in error_text:
        if lc == "te":
            return "సేవ ప్రస్తుతం బిజీగా ఉంది. కొద్దిసేపటి తర్వాత ప్రయత్నించండి."
        return "The AI service is busy right now. Please try again shortly."

    if lc == "te":
        return "AI సమాధానం రూపొందించలేకపోయాము."

    return "We could not generate an AI response."


def generate_conversational_reply(
    user_message: str,
    language: str,
    api_key: str,
    model: str,
    schemes: List[Dict[str, Any]],
) -> Dict[str, Any]:
    """Generate conversational Groq AI reply."""

    key = (api_key or "").strip()
    print("Groq API key loaded:", bool(key))

    if not key:
        return {
            "ok": False,
            "error_code": "missing_api_key",
            "user_message": "Missing Groq API key."
        }

    try:
        from groq import Groq

        client = Groq(api_key=key)
        print("Groq client initialized:", bool(client))

        use_model = _select_model(model)
        print("Groq selected model:", use_model)

        completion = client.chat.completions.create(
            model=use_model,
            messages=_build_messages(
                user_message,
                language,
                schemes
            ),
            temperature=0.6,
            max_tokens=400
        )

        response = (
            completion.choices[0]
            .message.content
            .strip()
        )

        response = re.sub(r"^```[a-zA-Z]*", "", response)
        response = re.sub(r"```$", "", response)

        return {
            "ok": True,
            "text": response
        }

    except Exception as exc:
        print("Groq Error:", exc)
        traceback.print_exc()

        return {
            "ok": False,
            "error_code": "groq_error",
            "user_message": _safe_error_message(exc, language)
        }


def generate_ai_response(
    user_message: str,
    language: str,
    api_key: Optional[str] = None,
    model: Optional[str] = None,
    schemes: Optional[List[Dict[str, Any]]] = None,
) -> str:
    """Public AI response function."""

    result = generate_conversational_reply(
        user_message=user_message,
        language=language,
        api_key=api_key or os.environ.get("GROQ_API_KEY", ""),
        model=model or os.environ.get("GROQ_MODEL", ""),
        schemes=schemes or [],
    )

    if result.get("ok"):
        return result["text"]

    return result.get(
        "user_message",
        "AI request failed."
    )
