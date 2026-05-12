"""
Application configuration for GramSahay AI.

Central place for settings so we can swap JSON paths, add API keys later
(OpenAI, etc.), or move to environment variables without touching route code.

`python-dotenv` loads `backend/.env` here so `os.environ` is populated before
Config attributes are evaluated. Never commit real `.env` files.
"""

import os

from dotenv import load_dotenv

# Root of the backend package (directory containing this file)
BASE_DIR = os.path.abspath(os.path.dirname(__file__))

load_dotenv(os.path.join(BASE_DIR, ".env"))


class Config:
    """Default configuration. Override in tests or production via subclass."""

    # Flask
    SECRET_KEY = os.environ.get("GRAMSAHAY_SECRET_KEY", "dev-change-me-in-production")

    # Path to the JSON "database" of government schemes
    SCHEMES_JSON_PATH = os.path.join(BASE_DIR, "database", "schemes.json")

    # CORS: allow frontend dev servers; tighten in production via env
    CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "*")

    # Groq (server-side only — loaded from env / .env, never exposed to clients)
    GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "").strip()
    GROQ_MODEL = os.environ.get("GROQ_MODEL", "llama-3.1-8b-instant").strip()


class DevelopmentConfig(Config):
    """Local development defaults."""

    DEBUG = True


class ProductionConfig(Config):
    """Production-oriented defaults (no debug)."""

    DEBUG = False


# Map FLASK_ENV-style names to config classes for create_app()
config_by_name = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
    "default": DevelopmentConfig,
}
