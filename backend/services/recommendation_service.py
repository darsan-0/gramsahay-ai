"""
Rule-based scheme recommendations for GramSahay AI chat.

This module is the right place to grow toward:
- NLP / intent classifiers (spaCy, IndicBERT, etc.)
- LLM-based ranking with retrieved scheme context
- Personalization using verified user profiles

Current behaviour: **keyword → intent category → filter schemes.json**
No machine learning and no external AI APIs.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional

from services.translation_service import localize_scheme_record, normalize_ui_language

# ---------------------------------------------------------------------------
# Intent labels (API-facing). Must stay stable for clients and future NLP.
# ---------------------------------------------------------------------------
INTENT_FARMER = "farmer"
INTENT_STUDENT = "student"
INTENT_PENSION = "pension"
INTENT_WOMEN = "women"
INTENT_HEALTH = "health"
INTENT_EMPLOYMENT = "employment"

SUPPORTED_INTENTS = [
    INTENT_FARMER,
    INTENT_STUDENT,
    INTENT_PENSION,
    INTENT_WOMEN,
    INTENT_HEALTH,
    INTENT_EMPLOYMENT,
]

# When two intents tie on keyword hits, prefer the earlier in this list.
_INTENT_TIE_BREAK_ORDER = [
    INTENT_PENSION,
    INTENT_HEALTH,
    INTENT_FARMER,
    INTENT_STUDENT,
    INTENT_WOMEN,
    INTENT_EMPLOYMENT,
]

# Keywords (lowercase substrings) → user intent. Extend per language over time.
_INTENT_KEYWORDS: Dict[str, List[str]] = {
    INTENT_FARMER: [
        "farmer",
        "agriculture",
        "crop",
        "farm",
        "kisan",
        "cultivat",
        "rythu",
        "agricultural",
        "రైతు",
        "వ్యవసాయ",
    ],
    INTENT_STUDENT: [
        "scholarship",
        "student",
        "education",
        "study",
        "school",
        "college",
        "university",
        "fee",
        "vidya",
        "విద్యార్థి",
        "విద్య",
        "చదువు",
    ],
    INTENT_PENSION: [
        "pension",
        "elderly",
        "senior citizen",
        "old age",
        "retire",
        "widow pension",
        "widow",
        "old-age",
        "పెన్షన్",
        "వృద్ధ",
    ],
    INTENT_WOMEN: [
        "women",
        "woman",
        "female",
        "self help group",
        "shg",
        "maternity",
        "mother",
        "widow",
        "మహిళ",
        "స్త్రీ",
    ],
    INTENT_HEALTH: [
        "hospital",
        "health",
        "insurance",
        "medical",
        "ayushman",
        "treatment",
        "aarogy",
        "ఆరోగ్యం",
        "వైద్యం",
    ],
    INTENT_EMPLOYMENT: [
        "jobs",
        "job",
        "employment",
        "unemployment",
        "nrega",
        "mgnrega",
        "skill",
        "livelihood",
        "career",
        "work",
        "labour",
        "labor",
        "ఉపాధి",
        "నిరుద్యోగ",
    ],
}

# JSON `category` field values used in schemes.json for direct category match.
_DATA_CATEGORIES_BY_INTENT: Dict[str, List[str]] = {
    INTENT_FARMER: ["agriculture"],
    INTENT_STUDENT: ["education"],
    INTENT_PENSION: ["pension"],
    INTENT_HEALTH: ["health"],
}

# For "women" intent: pick schemes whose text clearly relates to women / SHG / widow.
_WOMEN_SCHEME_TEXT_MARKERS = [
    "women",
    "woman",
    "female",
    "widow",
    "maternity",
    "mother",
    "self help",
    "shg",
    "మహిళ",
]

# For "employment" intent: schemes.json has no `employment` category yet; match narrative text.
_EMPLOYMENT_SCHEME_TEXT_MARKERS = [
    "employment",
    "unemployment",
    "job",
    "nrega",
    "mgnrega",
    "skill",
    "livelihood",
    "labour",
    "labor",
    "labourer",
    "laborer",
    "work",
    "wage",
    "ఉపాధి",
]

# Telugu labels for intent codes in chat replies (manual copy, not MT).
_INTENT_TOPIC_LABEL_TE: Dict[str, str] = {
    INTENT_FARMER: "రైతు / వ్యవసాయం",
    INTENT_STUDENT: "విద్య / విద్యార్థులు",
    INTENT_PENSION: "పెన్షన్",
    INTENT_WOMEN: "మహిళా సంక్షేమం",
    INTENT_HEALTH: "ఆరోగ్యం",
    INTENT_EMPLOYMENT: "ఉపాధి",
}


def _normalize_message(message: str) -> str:
    """Lowercase and collapse whitespace for reliable substring checks."""
    return " ".join((message or "").lower().split())


def detect_intent_category(message: str) -> Optional[str]:
    """
    Map free-text user message to a single supported intent using keyword hits.

    Scoring: count how many keywords for each intent appear as substrings in the
    message. Highest score wins; ties break using _INTENT_TIE_BREAK_ORDER.

    Returns:
        One of SUPPORTED_INTENTS, or None if nothing matched.
    """
    text = _normalize_message(message)
    if not text:
        return None

    scores: Dict[str, int] = {}
    for intent, keywords in _INTENT_KEYWORDS.items():
        scores[intent] = sum(1 for kw in keywords if kw in text)

    candidates = [i for i, sc in scores.items() if sc > 0]
    if not candidates:
        return None

    best_score = max(scores[i] for i in candidates)
    top = [i for i in candidates if scores[i] == best_score]
    if len(top) == 1:
        return top[0]

    def priority(intent: str) -> int:
        try:
            return _INTENT_TIE_BREAK_ORDER.index(intent)
        except ValueError:
            return len(_INTENT_TIE_BREAK_ORDER)

    top.sort(key=priority)
    return top[0]


def _scheme_blob(scheme: Dict[str, Any]) -> str:
    """
    Concatenate searchable text for keyword filtering (women / employment).

    Includes **both** English and Telugu fields so users can query in either
    language without an external translator.
    """
    parts: List[str] = []
    string_keys = (
        "scheme_name",
        "scheme_name_en",
        "scheme_name_te",
        "category",
        "category_en",
        "category_te",
        "eligibility",
        "eligibility_en",
        "eligibility_te",
        "benefits",
        "benefits_en",
        "benefits_te",
    )
    for key in string_keys:
        val = scheme.get(key)
        if isinstance(val, str) and val.strip():
            parts.append(val)
    for doc_key in ("documents", "documents_en", "documents_te"):
        docs = scheme.get(doc_key)
        if isinstance(docs, list):
            parts.extend(str(x) for x in docs if str(x).strip())
    return " ".join(parts).lower()


def filter_schemes_for_intent(intent: str, schemes: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Return schemes from the JSON list that match the detected intent.

    - farmer/student/pension/health: match `scheme["category"]` (normalized).
    - women / employment: substring match on scheme text (data has no dedicated category yet).
    """
    if intent in _DATA_CATEGORIES_BY_INTENT:
        allowed = {c.lower() for c in _DATA_CATEGORIES_BY_INTENT[intent]}
        return [s for s in schemes if str(s.get("category", "")).lower() in allowed]

    if intent == INTENT_WOMEN:
        out: List[Dict[str, Any]] = []
        for s in schemes:
            blob = _scheme_blob(s)
            if any(marker in blob for marker in _WOMEN_SCHEME_TEXT_MARKERS):
                out.append(s)
        return out

    if intent == INTENT_EMPLOYMENT:
        out = []
        for s in schemes:
            blob = _scheme_blob(s)
            if any(marker in blob for marker in _EMPLOYMENT_SCHEME_TEXT_MARKERS):
                out.append(s)
        return out

    return []


def build_chat_reply(intent: Optional[str], schemes: List[Dict[str, Any]], language: str) -> str:
    """
    Build a short, factual reply string from real scheme rows (not generative AI).

    Localizes each row using `localize_scheme_record` so `reply` matches the
    requested UI language. Used by HTTP clients that expect a `reply` field.
    """
    lang = normalize_ui_language(language)

    if intent is None:
        if lang == "te":
            return (
                "మీ సందేశాన్ని ఒక పథక వర్గంతో సరిపోల్చలేకపోయాము. "
                "రైతు, విద్యార్థి, పెన్షన్, మహిళా సంక్షేమం, ఆరోగ్యం లేదా ఉపాధి గురించి అడగండి. "
                "అన్ని పథకాల జాబితా కోసం /api/schemes చూడండి."
            )
        return (
            "We could not match your message to a scheme topic. "
            "Try asking about farmers, students, pensions, women welfare, health, or employment. "
            "You can also browse every scheme at GET /api/schemes."
        )

    if not schemes:
        if lang == "te":
            topic = _INTENT_TOPIC_LABEL_TE.get(intent or "", intent or "")
            return (
                f"మీ అభ్యర్థన '{topic}' వర్గానికి సరిపోయే పథకాలు ప్రస్తుత డేటాబేస్‌లో కనిపించలేదు. "
                "మరొక విషయం అడగండి లేదా /api/schemes ను చూడండి."
            )
        return (
            f"No schemes in the current database matched the '{intent}' topic. "
            "Try another topic or browse GET /api/schemes."
        )

    lines: List[str] = []
    if lang == "te":
        topic = _INTENT_TOPIC_LABEL_TE.get(intent or "", intent or "")
        lines.append(f"మీ అభ్యర్థన ప్రకారం '{topic}' వర్గానికి సరిపోలే పథకాలు:")
    else:
        lines.append(f"Here are schemes that match the '{intent}' topic based on our rules:")

    for raw in schemes:
        loc = localize_scheme_record(raw, lang)
        name = loc.get("scheme_name") or "Scheme"
        benefits = loc.get("benefits") or ""
        lines.append(f"• {name} — {benefits}")

    return "\n".join(lines)


def recommend_schemes_from_chat_message(
    message: str,
    schemes: List[Dict[str, Any]],
    language: str = "en",
) -> Dict[str, Any]:
    """
    Main entry for POST /api/chat rule-based recommendations.

    Args:
        message: User chat text (any language; keywords may be extended).
        schemes: Full list loaded from schemes.json (already parsed).
        language: BCP-style short code from client ('en', 'te', ...).

    Returns:
        JSON-serializable dict with category, schemes, reply, and status flags.
        Designed so an LLM layer can replace `detect_intent_category` later while
        keeping the same response envelope.
    """
    intent = detect_intent_category(message)
    if intent is None:
        reply = build_chat_reply(None, [], language)
        return {
            "status": "no_match",
            "category": None,
            "schemes": [],
            "reply": reply,
            "engine": "keyword_rules_v1",
        }

    matched = filter_schemes_for_intent(intent, schemes)
    if not matched:
        reply = build_chat_reply(intent, [], language)
        return {
            "status": "no_schemes",
            "category": intent,
            "schemes": [],
            "reply": reply,
            "engine": "keyword_rules_v1",
        }

    lc = normalize_ui_language(language)
    localized_schemes = [localize_scheme_record(s, lc) for s in matched]
    reply = build_chat_reply(intent, matched, language)
    return {
        "status": "matched",
        "category": intent,
        "schemes": localized_schemes,
        "reply": reply,
        "engine": "keyword_rules_v1",
    }


# ---------------------------------------------------------------------------
# Legacy placeholder (kept for imports/tests; chat route uses rules above).
# ---------------------------------------------------------------------------
def recommend_schemes_placeholder(user_profile: Dict[str, Any]) -> Dict[str, Any]:
    """Deprecated path kept for backward compatibility."""
    return {
        "status": "placeholder",
        "message": "Use recommend_schemes_from_chat_message for chat recommendations.",
        "recommendations": [],
        "user_profile_echo": user_profile,
    }


def rank_schemes_simple(schemes: List[Dict[str, Any]], preferred_categories: List[str]) -> List[Dict[str, Any]]:
    """
    Minimal deterministic ranking example (no AI).

    Puts schemes whose category is in preferred_categories first; keeps order
    otherwise. Useful as a baseline before ML ranking.
    """
    if not preferred_categories:
        return list(schemes)

    preferred = {c.strip().lower() for c in preferred_categories if c}
    scored: List[tuple] = []
    for s in schemes:
        cat = str(s.get("category", "")).lower()
        score = 1 if cat in preferred else 0
        scored.append((score, s))

    scored.sort(key=lambda x: x[0], reverse=True)
    return [s for _, s in scored]
