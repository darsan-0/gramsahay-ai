import unittest
import os
import sys
from unittest.mock import patch

# Add backend to sys.path to enable direct imports
_BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _BACKEND_DIR not in sys.path:
    sys.path.insert(0, _BACKEND_DIR)

from app import create_app


class ChatbotSystemTestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app("testing")
        self.app.config["TESTING"] = True
        self.app.config["SCHEMES_JSON_PATH"] = os.path.join(
            _BACKEND_DIR,
            "database",
            "schemes.json"
        )
        self.client = self.app.test_client()

        # Patch Groq API calls to avoid rate limits / network requirements
        self.patcher = patch("routes.chat_routes.generate_ai_response_contextual")
        self.mock_generate = self.patcher.start()
        self.mock_generate.return_value = "Mocked AI Response"

    def tearDown(self):
        self.patcher.stop()

    def test_invalid_request(self):
        """Test non-JSON payload returns 400."""
        response = self.client.post("/api/chat", data="not json")
        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.get_json())

    def test_english_scheme_recommendation(self):
        """Test schemes category matches in English."""
        response = self.client.post(
            "/api/chat",
            json={
                "message": "I am a student. What scholarships can I get?",
                "language": "en"
            }
        )
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data.get("category"), "education")
        self.assertGreater(len(data.get("schemes", [])), 0)
        self.assertEqual(data["schemes"][0]["id"], "jvd-003")

    def test_telugu_scheme_recommendation(self):
        """Test schemes category matches in Telugu."""
        response = self.client.post(
            "/api/chat",
            json={
                "message": "నేను ఒక రైతును, నాకు ఏ పథకాలు ఉన్నాయి?",
                "language": "te"
            }
        )
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data.get("category"), "farmer")
        self.assertGreater(len(data.get("schemes", [])), 0)
        self.assertEqual(data["schemes"][0]["id"], "pm-kisan-001")

    def test_conversation_context_followup(self):
        """Test context memory preserves active scheme on follow-up."""
        response = self.client.post(
            "/api/chat",
            json={
                "message": "How do I apply?",
                "language": "en",
                "context": {
                    "active_scheme_id": "jvd-003",
                    "history": [
                        {"role": "user", "text": "I am a student"},
                        {"role": "assistant", "text": "AP Post-Matric Scholarship"}
                    ]
                }
            }
        )
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data["active_scheme_id"], "jvd-003")
        self.assertEqual(len(data["schemes"]), 1)
        self.assertEqual(data["schemes"][0]["id"], "jvd-003")

    def test_multiple_schemes_clarification(self):
        """Test ambiguous follow-up triggers clarification request."""
        # Ensure we patch out the Groq call, so we fallback to dynamic clarifier
        self.mock_generate.return_value = None

        response = self.client.post(
            "/api/chat",
            json={
                "message": "How do I apply?",
                "language": "en",
                "context": {
                    "previous_scheme_ids": ["pm-kisan-001", "rythu-bharosa-002"],
                    "history": [
                        {"role": "user", "text": "I am a farmer"},
                        {"role": "assistant", "text": "Here are some schemes: PM-KISAN, YSR Rythu Bharosa"}
                    ]
                }
            }
        )
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn("Which scheme would you like to know about?", data.get("reply", ""))
        self.assertIn("PM-KISAN", data.get("reply", ""))
        self.assertIn("Dr. YSR Rythu Bharosa", data.get("reply", ""))
        self.assertIsNone(data.get("active_scheme_id"))

    def test_multiple_schemes_resolved_explicitly(self):
        """Test clarification is resolved if user explicitly mentions one scheme."""
        response = self.client.post(
            "/api/chat",
            json={
                "message": "Tell me about Rythu Bharosa.",
                "language": "en",
                "context": {
                    "previous_scheme_ids": ["pm-kisan-001", "rythu-bharosa-002"],
                    "history": [
                        {"role": "user", "text": "I am a farmer"},
                        {"role": "assistant", "text": "Here are some schemes: PM-KISAN, YSR Rythu Bharosa"}
                    ]
                }
            }
        )
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data.get("active_scheme_id"), "rythu-bharosa-002")

    def test_rate_limiting(self):
        """Test request rate limit blocks after exceeding limits."""
        os.environ["LIMIT_CHAT_REQUESTS"] = "2"
        os.environ["LIMIT_CHAT_WINDOW"] = "10"
        self.app.config["TEST_RATE_LIMIT"] = True

        from routes.chat_routes import ip_requests
        ip_requests.clear()

        # Request 1: Ok
        res1 = self.client.post("/api/chat", json={"message": "hello", "language": "en"})
        self.assertEqual(res1.status_code, 200)

        # Request 2: Ok
        res2 = self.client.post("/api/chat", json={"message": "hello", "language": "en"})
        self.assertEqual(res2.status_code, 200)

        # Request 3: Exceeded (should return 429)
        res3 = self.client.post("/api/chat", json={"message": "hello", "language": "en"})
        self.assertEqual(res3.status_code, 429)
        self.assertEqual(res3.get_json().get("status"), "rate_limited")

        os.environ.pop("LIMIT_CHAT_REQUESTS", None)
        os.environ.pop("LIMIT_CHAT_WINDOW", None)
        self.app.config["TEST_RATE_LIMIT"] = False


if __name__ == "__main__":
    unittest.main()
