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
INTENT_STUDENT = "education"
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
    "student",
]

# When two intents tie on keyword hits, prefer specific domain topics without pension bias.
_INTENT_TIE_BREAK_ORDER = [
    INTENT_STUDENT,
    INTENT_FARMER,
    INTENT_WOMEN,
    INTENT_HEALTH,
    INTENT_PENSION,
    INTENT_EMPLOYMENT,
]

# Keywords (lowercase substrings) → user intent. Extend per language over time.
_INTENT_KEYWORDS: Dict[str, List[str]] = {
    INTENT_FARMER: [
        "farmer",
        "farmers",
        "agriculture",
        "agricultural",
        "crop",
        "crops",
        "farm",
        "farming",
        "kisan",
        "cultivat",
        "rythu",
        "రైతు",
        "రైతులు",
        "వ్యవసాయ",
        "పంట",
    ],
    INTENT_STUDENT: [
        "scholarship",
        "scholarships",
        "student",
        "students",
        "education",
        "study",
        "studies",
        "school",
        "schools",
        "college",
        "colleges",
        "university",
        "fee",
        "fees",
        "tuition",
        "hostel",
        "vidya",
        "jnanabhumi",
        "jvd",
        "vidya deevena",
        "vasathi deevena",
        "post-matric",
        "post matric",
        "reimbursement",
        "విద్యార్థి",
        "విద్యార్థులు",
        "విద్యార్థిని",
        "విద్య",
        "చదువు",
        "స్కాలర్‌షిప్",
        "స్కాలర్‌షిప్‌లు",
        "ఫీజు",
        "హాస్టల్",
        "జ్ఞానభూమి",
        "విద్యా దీవెన",
        "వసతి దీవెన",
    ],
    INTENT_PENSION: [
        "pension",
        "pensions",
        "elderly",
        "senior citizen",
        "senior citizens",
        "old age",
        "retire",
        "retirement",
        "widow pension",
        "widow pensions",
        "widow",
        "widows",
        "old-age",
        "పెన్షన్",
        "పెన్షన్లు",
        "వృద్ధ",
        "వృద్ధాప్య",
        "వితంతు",
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
        "widows",
        "మహిళ",
        "మహిళలు",
        "స్త్రీ",
        "డ్వాక్రా",
    ],
    INTENT_HEALTH: [
        "hospital",
        "hospitals",
        "health",
        "healthcare",
        "insurance",
        "medical",
        "ayushman",
        "treatment",
        "aarogy",
        "ఆరోగ్యం",
        "వైద్యం",
        "ఆసుపత్రి",
        "చికిత్స",
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
        "కూలీ",
    ],
}

# JSON `category` field values used in schemes.json for direct category match.
_DATA_CATEGORIES_BY_INTENT: Dict[str, List[str]] = {
    INTENT_FARMER: ["agriculture"],
    "farmer": ["agriculture"],
    "agriculture": ["agriculture"],
    INTENT_STUDENT: ["education"],
    "student": ["education"],
    "education": ["education"],
    INTENT_PENSION: ["pension"],
    "pension": ["pension"],
    INTENT_HEALTH: ["health"],
    "health": ["health"],
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
    "farmer": "రైతు / వ్యవసాయం",
    "agriculture": "రైతు / వ్యవసాయం",
    INTENT_STUDENT: "విద్య / విద్యార్థులు",
    "student": "విద్య / విద్యార్థులు",
    "education": "విద్య / విద్యార్థులు",
    INTENT_PENSION: "పెన్షన్",
    "pension": "పెన్షన్",
    INTENT_WOMEN: "మహిళా సంక్షేమం",
    "women": "మహిళా సంక్షేమం",
    INTENT_HEALTH: "ఆరోగ్యం",
    "health": "ఆరోగ్యం",
    INTENT_EMPLOYMENT: "ఉపాధి",
    "employment": "ఉపాధి",
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


def build_scheme_application_reply(scheme: Dict[str, Any], language: str) -> str:
    """Answer a follow-up like 'how do I apply?' using the selected scheme's data."""
    lang = normalize_ui_language(language)
    loc = localize_scheme_record(scheme, lang)
    name = loc.get("scheme_name") or "Scheme"
    website = (scheme.get("official_website") or "").strip()
    mode = (scheme.get("application_mode_te") if lang == "te" else scheme.get("application_mode_en")) or scheme.get("application_mode") or "Not Available"
    process_steps = (scheme.get("application_process_te") if lang == "te" else scheme.get("application_process_en")) or scheme.get("application_process") or []
    docs = (scheme.get("documents_te") if lang == "te" else scheme.get("documents_en")) or scheme.get("documents") or []

    if lang == "te":
        lines = [f"{name} దరఖాస్తు ఎలా చేయాలి?", "", "దరఖాస్తు ప్రక్రియ:"]
        if isinstance(process_steps, list) and process_steps:
            for index, step in enumerate(process_steps, start=1):
                lines.append(f"{index}. {step}")
        else:
            lines.append("ఈ సమాచారం ప్రస్తుత పథక డేటాలో అందుబాటులో లేదు.")

        if website:
            lines.extend(["", "అధికారిక వెబ్‌సైట్:", website])
        if isinstance(docs, list) and docs:
            lines.extend(["", "అవసరమైన పత్రాలు:"])
            for doc in docs:
                lines.append(f"• {doc}")
        if mode and mode != "Not Available":
            lines.extend(["", f"దరఖాస్తు విధానం: {mode}"])
        return "\n".join(lines)

    lines = [f"How to apply for {name}?", "", "Application Process:"]
    if isinstance(process_steps, list) and process_steps:
        for index, step in enumerate(process_steps, start=1):
            lines.append(f"{index}. {step}")
    else:
        lines.append("This information is not available in the current scheme data.")

    if website:
        lines.extend(["", "Official Website:", website])
    if isinstance(docs, list) and docs:
        lines.extend(["", "Required Documents:"])
        for doc in docs:
            lines.append(f"• {doc}")
    if mode and mode != "Not Available":
        lines.extend(["", f"Application Mode: {mode}"])
    return "\n".join(lines)


def build_chat_reply(intent: Optional[str], schemes: List[Dict[str, Any]], language: str, message: Optional[str] = None) -> str:
    """
    Build a short, factual reply string from real scheme rows (not generative AI).

    Localizes each row using `localize_scheme_record` so `reply` matches the
    requested UI language. Used by HTTP clients that expect a `reply` field.
    """
    lang = normalize_ui_language(language)

    if message and any(keyword in (message or "").lower() for keyword in [
        "how do i apply",
        "how to apply",
        "apply for this",
        "apply it",
        "application process",
        "where do i apply",
        "how to register",
        "how can i apply",
    ]) and len(schemes) == 1:
        return build_scheme_application_reply(schemes[0], language)

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
    reply = build_chat_reply(intent, matched, language, message=message)
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
