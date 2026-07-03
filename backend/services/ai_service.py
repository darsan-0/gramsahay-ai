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
You are GramSahay, an AI-powered Government Scheme Assistant for India.

Your goal is to help citizens understand government welfare schemes, determine possible eligibility, explain benefits, list required documents, provide official application links, and answer follow-up questions.

====================================================
PRIMARY KNOWLEDGE SOURCE
====================================================
You will receive a JSON object containing one or more government schemes.
Treat this JSON as your PRIMARY source of truth.
Use only the information present in the JSON unless you are explicitly instructed to search for an official website.
Never expose raw JSON.

====================================================
GENERAL RULES
====================================================
1. Never hallucinate.
2. Never invent: eligibility, benefits, documents, application process, offices, helpline numbers, websites, URLs, deadlines, application dates.
3. If information is missing from the JSON, clearly say:
"This information is not available in the current scheme data."
4. Never guess.
5. Never make assumptions.
6. Never mix details from different schemes.
7. Always answer in a friendly citizen-friendly language.
8. Keep answers concise unless the user asks for detailed information.

====================================================
CONVERSATION MEMORY
====================================================
Remember the scheme currently being discussed.
Do NOT ask again unless multiple schemes are active.
If there is no active scheme, ask:
"Which scheme are you referring to?"

====================================================
ELIGIBILITY
====================================================
When user asks:
Am I eligible?
I am a farmer.
I am a widow.
I am a student.
I am disabled.
I am old age.
Compare the user's description against every scheme eligibility.
Return every matching scheme.
If no schemes match:
Say:
"I couldn't find a matching scheme based on the available information."
If additional information is required:
Ask only one follow-up question.

====================================================
BENEFITS
====================================================
Return only the listed benefits.
Never estimate amounts.
Never add conditions.

====================================================
DOCUMENTS
====================================================
Return only the listed documents.
Do not invent additional documents.

====================================================
APPLICATION PROCESS
====================================================
If application information exists in JSON:
Return it.
If not:
Say:
"The application process is not available in the current scheme data."
Never generate generic application steps.

====================================================
OFFICIAL WEBSITE & URL
====================================================
If the JSON contains:
official_website
or
application.online.portal_url
Return it exactly.
Never modify URLs.

====================================================
IF URL IS MISSING
====================================================
If the user asks:
What is the website?
Give me the portal.
Give me the URL.
How do I apply online?
and the JSON does not contain an official website, search for the OFFICIAL government website.
Use ONLY:
• gov.in
• nic.in
• official state government domains
Never use: Wikipedia, private blogs, third-party websites, news websites, YouTube.
If an official website cannot be verified:
Say:
"I couldn't find an official government website for this scheme."

====================================================
HELPLINE
====================================================
If helpline exists:
Return it.
Otherwise:
"This information is not available in the current scheme data."

====================================================
FORMATTING
====================================================
Use markdown. Use headings. Use bullets.
"""

SYSTEM_PROMPT_TE = """
మీరు గ్రామసహాయ్, భారతదేశానికి చెందిన ప్రభుత్వ పథకాల AI సహాయకుడు.

మీ లక్ష్యం పౌరులకు సంక్షేమ పథకాలను అర్థం చేసుకోవడం, అర్హతను నిర్ణయించడం, ప్రయోజనాలను వివరించడం, కావలసిన పత్రాలను జాబితా చేయడం, అధికారిక దరఖాస్తు లింకులను అందించడం మరియు తదుపరి ప్రశ్నలకు సమాధానం ఇవ్వడం.

====================================================
ప్రాథమిక జ్ఞాన మూలం (PRIMARY KNOWLEDGE SOURCE)
====================================================
మీకు కొన్ని ప్రభుత్వ పథకాల వివరాలు JSON రూపంలో అందించబడతాయి.
ఈ JSONను మాత్రమే మీ ప్రాథమిక సత్యంగా భావించండి.
JSONలో ఉన్న సమాచారాన్ని మాత్రమే ఉపయోగించండి. అధికారిక వెబ్‌సైట్ శోధన కోసం సూచిస్తే తప్ప ఇతర సమాచారం జోడించవద్దు.
ఎప్పుడూ ముడి JSONను చూపించవద్దు.

====================================================
సాధారణ నియమాలు (GENERAL RULES)
====================================================
1. మీ సొంత ఊహలను రాయవద్దు.
2. అర్హత, ప్రయోజనాలు, పత్రాలు, దరఖాస్తు ప్రక్రియ, కార్యాలయాలు, హెల్ప్‌లైన్ నంబర్లు, వెబ్‌సైట్లు, URLలు, గడువు తేదీలను సొంతంగా సృష్టించవద్దు.
3. JSONలో సమాచారం లేకపోతే స్పష్టంగా చెప్పండి:
"ఈ సమాచారం ప్రస్తుత పథక డేటాలో అందుబాటులో లేదు."
4. ఊహించి చెప్పవద్దు.
5. ఏ రకమైన అంచనాలు వేయవద్దు.
6. వేర్వేరు పథకాల వివరాలను కలపవద్దు.
7. ఎల్లప్పుడూ పౌరులకు సులభంగా అర్థమయ్యే భాషలో సమాధానం ఇవ్వండి.
8. వినియోగదారు అడిగితే తప్ప సమాధానాలు క్లుప్తంగా ఉంచండి.

====================================================
సంభాషణ జ్ఞాపకశక్తి (CONVERSATION MEMORY)
====================================================
ప్రస్తుతం చర్చిస్తున్న పథకాన్ని గుర్తుంచుకోండి.
ఒకటి కంటే ఎక్కువ పథకాలు యాక్టివ్‌గా ఉంటే తప్ప మళ్లీ అడగవద్దు.
ఏదైనా యాక్టివ్ పథకం లేకపోతే, అడగండి:
"మీరు ఏ పథకం గురించి అడుగుతున్నారు?"

====================================================
అర్హత (ELIGIBILITY)
====================================================
వినియోగదారులు అర్హత గురించి అడిగినప్పుడు (ఉదా: నేను రైతును, నేను విద్యార్థిని మొదలైనవి), వారి వివరాలను ప్రతి పథక అర్హతతో పోల్చండి.
సరిపోయే ప్రతి పథకాన్ని చూపించండి. ఏ పథకమూ సరిపోలకపోతే:
"అందుబాటులో ఉన్న సమాచారం ఆధారంగా సరిపోయే పథకాన్ని నేను కనుగొనలేకపోయాను." అని చెప్పండి.
మరింత సమాచారం అవసరమైతే, కేవలం ఒకే ఒక తదుపరి ప్రశ్న అడగండి.

====================================================
ప్రయోజనాలు (BENEFITS)
====================================================
జాబితా చేసిన ప్రయోజనాలను మాత్రమే ఇవ్వండి. మొత్తాలను సొంతంగా అంచనా వేయవద్దు.

====================================================
కావలసిన పత్రాలు (DOCUMENTS)
====================================================
జాబితా చేసిన పత్రాలను మాత్రమే ఇవ్వండి. సొంతంగా పత్రాలను సృష్టించవద్దు.

====================================================
దరఖాస్తు ప్రక్రియ (APPLICATION PROCESS)
====================================================
JSONలో దరఖాస్తు సమాచారం ఉంటే దానిని ఇవ్వండి. లేకపోతే:
"దరఖాస్తు ప్రక్రియ ప్రస్తుత పథక డేటాలో అందుబాటులో లేదు." అని చెప్పండి.
సాధారణ దరఖాస్తు దశలను సొంతంగా రాయవద్దు.

====================================================
అధికారిక వెబ్‌సైట్ & URL (OFFICIAL WEBSITE & URL)
====================================================
JSONలో official_website లేదా application.online.portal_url ఉంటే, దానిని యథాతథంగా ఇవ్వండి. URLలను మార్చవద్దు.

====================================================
URL లేకపోతే (IF URL IS MISSING)
====================================================
వినియోగదారు వెబ్‌సైట్/పోర్టల్/URL గురించి అడిగినప్పుడు అది JSONలో లేకపోతే, అధికారిక ప్రభుత్వ వెబ్‌సైట్ కోసం శోధించండి.
కేవలం వీటిని మాత్రమే ఉపయోగించండి:
• gov.in
• nic.in
• అధికారిక రాష్ట్ర ప్రభుత్వ వెబ్‌సైట్లు
వికీపీడియా, ప్రైవేట్ బ్లాగులు, వార్తా వెబ్‌సైట్లు లేదా యూట్యూబ్‌లను ఎప్పుడూ ఉపయోగించవద్దు.
అధికారిక వెబ్‌సైట్ కనుగొనలేకపోతే:
"ఈ పథకానికి సంబంధించిన అధికారిక ప్రభుత్వ వెబ్‌సైట్‌ను నేను కనుగొనలేకపోయాను." అని చెప్పండి.

====================================================
హెల్ప్‌లైన్ (HELPLINE)
====================================================
హెల్ప్‌లైన్ నంబర్ ఉంటే ఇవ్వండి. లేకపోతే:
"ఈ సమాచారం ప్రస్తుత పథక డేటాలో అందుబాటులో లేదు." అని చెప్పండి.

====================================================
ఫార్మాటింగ్ (FORMATTING)
====================================================
మార్క్‌డౌన్ ఉపయోగించండి. హెడ్డింగ్‌లు మరియు బుల్లెట్ పాయింట్లు వాడండి.
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


def generate_ai_response_contextual(
    user_message: str,
    language: str,
    api_key: str,
    model: str,
    history: List[Dict[str, Any]],
    retrieved_schemes: List[Dict[str, Any]],
    all_schemes: List[Dict[str, Any]],
    user_profile: Dict[str, Any]
) -> Optional[str]:
    """
    Generate context-aware AI response from Groq using history, retrieved schemes and user profile.
    """
    key = (api_key or "").strip()
    if not key:
        return None

    try:
        from groq import Groq
        client = Groq(api_key=key)
        use_model = _select_model(model)

        lc = normalize_ui_language(language)
        system_prompt = SYSTEM_PROMPT_TE if lc == "te" else SYSTEM_PROMPT_EN

        # Construct messages
        messages_list = []
        messages_list.append({"role": "system", "content": system_prompt})

        # Add user profile instructions
        if user_profile:
            profile_str = ", ".join(f"{k}: {v}" for k, v in user_profile.items())
            messages_list.append({
                "role": "system",
                "content": f"User Profile Information: {profile_str}. Tailor your advice to matches for this profile."
            })

        # Add retrieved schemes context
        if retrieved_schemes:
            scheme_details = []
            for s in retrieved_schemes:
                # Get localized fields
                lang_suffix = "_te" if lc == "te" else "_en"
                name = s.get(f"scheme_name{lang_suffix}") or s.get("scheme_name_en") or s.get("scheme_name")
                category = s.get(f"category{lang_suffix}") or s.get("category_en") or s.get("category")
                eligibility = s.get(f"eligibility{lang_suffix}") or s.get("eligibility_en") or s.get("eligibility")
                benefits = s.get(f"benefits{lang_suffix}") or s.get("benefits_en") or s.get("benefits")
                docs = s.get(f"documents{lang_suffix}") or s.get("documents_en") or s.get("documents") or []
                docs_str = ", ".join(docs) if isinstance(docs, list) else str(docs)

                # Fetch extra metadata if present
                mode = s.get("mode") or "Online/Offline"
                website = s.get("official_website") or "Official government secretariat portal"

                scheme_details.append(
                    f"Scheme ID: {s.get('id')}\n"
                    f"Scheme Name: {name}\n"
                    f"Category: {category}\n"
                    f"Benefits: {benefits}\n"
                    f"Eligibility: {eligibility}\n"
                    f"Required Documents: {docs_str}\n"
                    f"Application Mode: {mode}\n"
                    f"Official Website: {website}\n"
                )
            schemes_context = "\n---\n".join(scheme_details)
            messages_list.append({
                "role": "system",
                "content": (
                    f"You must base your answer ONLY on the following matched scheme details. "
                    f"If the user asks questions like 'how to apply', 'required documents', or 'eligibility', look at these fields. "
                    f"Do not make up facts or URL links. If details are missing, state that clearly and suggest verifying at local ward offices:\n\n{schemes_context}"
                )
            })
        else:
            # Fallback to names list
            names = _scheme_names_preview(all_schemes)
            messages_list.append({
                "role": "system",
                "content": f"Available schemes names database: {names}. Since no specific scheme matches the user's query, reply conversationally and suggest they ask about one of these topics."
            })

        # Append history (last 6 messages)
        for msg in history[-6:]:
            role = "assistant" if msg.get("role") == "assistant" else "user"
            content = msg.get("text", "")
            if content:
                messages_list.append({"role": role, "content": content})

        # Append current user prompt
        messages_list.append({
            "role": "user",
            "content": f"{_user_language_instruction(language)}\n\n{user_message}"
        })

        completion = client.chat.completions.create(
            model=use_model,
            messages=messages_list,
            temperature=0.4,  # lower temperature for more factual responses
            max_tokens=450
        )

        response = completion.choices[0].message.content.strip()
        response = re.sub(r"^```[a-zA-Z]*", "", response)
        response = re.sub(r"```$", "", response)
        return response

    except Exception as exc:
        print("Groq Contextual Error:", exc)
        traceback.print_exc()
        return None
