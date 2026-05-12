"""
Translation and language utilities for GramSahay AI.

**Current scope:** local bilingual content only (English + Telugu strings stored
in JSON). No external translation APIs.

**Future:** plug Indic NLP, glossaries, or LLM post-editing here while keeping
the same `localize_scheme_record()` contract for HTTP responses.
"""

from __future__ import annotations

from typing import Any, Dict, List


def get_supported_languages() -> List[str]:
    """Languages the product intends to support (ISO-style short codes)."""
    return ["en", "te"]


def normalize_ui_language(lang: str) -> str:
    """
    Collapse client language codes to a stable UI bucket.

    Accepts "te", "te-IN", "TE", etc. Everything else maps to English.
    """
    s = (lang or "en").strip().lower()
    if s.startswith("te"):
        return "te"
    return "en"


def localize_scheme_record(raw: Dict[str, Any], lang: str) -> Dict[str, Any]:
    """
    Map one bilingual `schemes.json` row → a single-language API object.

    Expected JSON keys (when fully migrated):
        scheme_name_en / scheme_name_te
        category_en / category_te   (human labels, e.g. "Farmer" / "రైతు")
        eligibility_en / eligibility_te
        benefits_en / benefits_te
        documents_en / documents_te (lists of strings)

    Machine routing field (unchanged across languages):
        category — internal code: agriculture, education, pension, health, …

    Output shape (stable for React cards and future AI RAG):
        id, category_code, scheme_name, category, eligibility, benefits,
        documents, language_support

    Fallback: if Telugu text is missing, English strings are used so the UI
    never shows blank critical fields.
    """
    lc = normalize_ui_language(lang)
    use_te = lc == "te"

    def pick(en_key: str, te_key: str, *legacy_single: str) -> Any:
        if use_te:
            te_val = raw.get(te_key)
            if te_val is not None and str(te_val).strip() != "":
                return te_val
        en_val = raw.get(en_key)
        if en_val is not None and str(en_val).strip() != "":
            return en_val
        for lk in legacy_single:
            v = raw.get(lk)
            if v is not None and str(v).strip() != "":
                return v
        return "" if en_key != "documents_en" else []

    docs = pick("documents_en", "documents_te", "documents")
    if not isinstance(docs, list):
        docs = []

    machine_category = str(raw.get("category", "") or "")

    return {
        "id": raw.get("id", ""),
        "category_code": machine_category,
        "scheme_name": pick("scheme_name_en", "scheme_name_te", "scheme_name"),
        "category": pick("category_en", "category_te", "category"),
        "eligibility": pick("eligibility_en", "eligibility_te", "eligibility"),
        "benefits": pick("benefits_en", "benefits_te", "benefits"),
        "documents": docs,
        "language_support": raw.get("language_support") or ["en", "te"],
    }


def localize_scheme_list(schemes: List[Dict[str, Any]], lang: str) -> List[Dict[str, Any]]:
    """Localize a list of raw scheme dicts for API responses."""
    return [localize_scheme_record(s, lang) for s in schemes]


def translate_text_placeholder(text: str, target_lang: str) -> Dict[str, Any]:
    """
    Placeholder translation: echoes input and records intended target language.

    Replace body with real translation when APIs are approved.
    """
    return {
        "status": "placeholder",
        "original_text": text,
        "target_language": target_lang,
        "translated_text": text,
        "message": "Translation service not wired. Use Telugu/English APIs here.",
    }


def attach_language_metadata(payload: Dict[str, Any], lang: str) -> Dict[str, Any]:
    """Merge requested language into JSON payload for clients and logging."""
    out = dict(payload)
    out["requested_language"] = normalize_ui_language(lang)
    return out
