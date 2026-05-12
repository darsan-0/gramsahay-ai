"""
GramSahay AI — Flask application entry point.

Run locally (from the `backend` directory):
    pip install -r requirements.txt
    python app.py

Or with the Flask CLI:
    set FLASK_APP=app.py
    flask run
"""

import os
from typing import Optional

from flask import Flask
from flask_cors import CORS

from config import config_by_name
from routes.scheme_routes import scheme_bp
from routes.chat_routes import chat_bp


def create_app(config_name: Optional[str] = None) -> Flask:
    """
    Application factory: creates the Flask app and wires extensions + blueprints.

    Using a factory keeps tests and future workers (Celery, etc.) able to build
    the same app object without import side effects.
    """
    env = (config_name or os.environ.get("FLASK_ENV", "development")).lower()
    config_class = config_by_name.get(env, config_by_name["default"])

    app = Flask(__name__)
    app.config.from_object(config_class)

    # Enable CORS for browser-based frontends (adjust origins in production)
    CORS(
        app,
        resources={r"/api/*": {"origins": app.config.get("CORS_ORIGINS", "*")}},
        supports_credentials=False,
    )

    # Modular route registration (add more blueprints as features grow)
    app.register_blueprint(scheme_bp)
    app.register_blueprint(chat_bp)

    @app.route("/api/health", methods=["GET"])
    def health_check():
        """Simple liveness probe for load balancers or monitoring."""
        return {"service": "GramSahay AI", "status": "ok"}, 200

    return app


# WSGI servers (gunicorn, waitress) typically import `app` from app:app
app = create_app()


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=app.config.get("DEBUG", False))
