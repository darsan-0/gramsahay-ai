import os
import sys

# Add backend to sys.path to enable imports
_BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _BACKEND_DIR not in sys.path:
    sys.path.insert(0, _BACKEND_DIR)

from dotenv import load_dotenv
load_dotenv(os.path.join(_BACKEND_DIR, ".env"))

from services.ai_service import generate_ai_response_contextual
from routes.chat_routes import _load_all_schemes
from flask import Flask

# Initialize minimal Flask app to load config
app = Flask(__name__)
app.config["SCHEMES_JSON_PATH"] = os.path.join(_BACKEND_DIR, "database", "schemes.json")


def run_test_query(title, message, retrieved_schemes, language="en"):
    print("=" * 60)
    print(f"TEST CASE: {title}")
    print(f"Query: \"{message}\" (Lang: {language})")
    print("-" * 60)

    api_key = os.environ.get("GROQ_API_KEY", "").strip()
    model = os.environ.get("GROQ_MODEL", "llama-3.1-8b-instant").strip()

    with app.app_context():
        all_schemes = _load_all_schemes()

    reply = generate_ai_response_contextual(
        user_message=message,
        language=language,
        api_key=api_key,
        model=model,
        history=[],
        retrieved_schemes=retrieved_schemes,
        all_schemes=all_schemes,
        user_profile={}
    )

    print("Response:")
    print(reply)
    print("=" * 60)
    print()


def main():
    with app.app_context():
        schemes = _load_all_schemes()

    # Find specific schemes
    jvd_scheme = next((s for s in schemes if s["id"] == "jvd-003"), None)
    pm_kisan_scheme = next((s for s in schemes if s["id"] == "pm-kisan-001"), None)

    # 1. Student -> website
    run_test_query(
        "Student -> website",
        "What is the official website for the AP Post-Matric Scholarship?",
        [jvd_scheme] if jvd_scheme else []
    )

    # 2. Student -> application process
    run_test_query(
        "Student -> application process",
        "How do I apply for the AP Post-Matric Scholarship?",
        [jvd_scheme] if jvd_scheme else []
    )

    # 3. Farmer -> website
    run_test_query(
        "Farmer -> website",
        "What is the official website for PM-KISAN?",
        [pm_kisan_scheme] if pm_kisan_scheme else []
    )

    # 4. Farmer -> apply
    run_test_query(
        "Farmer -> apply",
        "How do I apply for PM-KISAN?",
        [pm_kisan_scheme] if pm_kisan_scheme else []
    )

    # 5. Unknown scheme
    run_test_query(
        "Unknown scheme",
        "How do I apply for the Pradhan Mantri Awas Yojana?",
        []
    )

    # 6. Missing website (Using a mock scheme where official_website is empty)
    mock_scheme_missing_web = {
        "id": "mock-001",
        "scheme_name_en": "Mock Welfare Scheme",
        "category_en": "Welfare",
        "benefits_en": "Financial assistance of Rs. 1000.",
        "eligibility_en": "All citizens.",
        "documents_en": ["Aadhaar card"],
        "official_website": "",
        "application_mode_en": "Online",
        "application_process_en": ["Visit secretariat.", "Submit form."]
    }
    run_test_query(
        "Missing website",
        "What is the website for Mock Welfare Scheme?",
        [mock_scheme_missing_web]
    )

    # 7. Missing application process (Using a mock scheme where application_process is empty)
    mock_scheme_missing_proc = {
        "id": "mock-002",
        "scheme_name_en": "Mock Scholarship Scheme",
        "category_en": "Education",
        "benefits_en": "Scholarship of Rs. 5000.",
        "eligibility_en": "Students.",
        "documents_en": ["Aadhaar card"],
        "official_website": "https://mock.gov.in",
        "application_mode_en": "Online",
        "application_process_en": []
    }
    run_test_query(
        "Missing application process",
        "How do I apply for the Mock Scholarship Scheme?",
        [mock_scheme_missing_proc]
    )


if __name__ == "__main__":
    main()
