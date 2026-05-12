"""
HTTP routes for government schemes (read from JSON).

These endpoints are stable contracts for the frontend. When you add a real DB
or AI layer, keep the same URLs and response shapes where possible.

**Language:** pass `?lang=en` or `?lang=te` (default `en`) to receive localized
`scheme_name`, `category`, `eligibility`, `benefits`, and `documents` fields
while keeping `category_code` for filtering and icons.
"""

from flask import Blueprint, current_app, jsonify, request

from services.translation_service import localize_scheme_list, normalize_ui_language
from utils.helpers import filter_schemes_by_category, load_json_file

# url_prefix is applied in app.py registration: all routes live under /api/schemes
scheme_bp = Blueprint("schemes", __name__, url_prefix="/api/schemes")


def _load_schemes_list():
    """Load the schemes array from configured JSON path."""
    path = current_app.config["SCHEMES_JSON_PATH"]
    data = load_json_file(path)
    schemes = data.get("schemes", [])
    if not isinstance(schemes, list):
        return []
    return schemes


def _lang_from_request() -> str:
    """Read UI language from query string (?lang=te)."""
    return normalize_ui_language(request.args.get("lang", "en"))


@scheme_bp.route("", methods=["GET"])
def list_schemes():
    """
    GET /api/schemes?lang=en|te

    Returns every scheme with fields localized to the requested language.
    """
    try:
        lang = _lang_from_request()
        raw = _load_schemes_list()
        localized = localize_scheme_list(raw, lang)
        return jsonify({"count": len(localized), "language": lang, "schemes": localized}), 200
    except FileNotFoundError as e:
        return jsonify({"error": str(e)}), 500
    except Exception as e:  # pragma: no cover - defensive for bad JSON
        return jsonify({"error": "Failed to load schemes", "detail": str(e)}), 500


@scheme_bp.route("/category/<string:category>", methods=["GET"])
def schemes_by_category(category):
    """
    GET /api/schemes/category/<category>?lang=en|te

    Filter schemes by machine `category` field (e.g. agriculture, pension).
    Response schemes are localized for display.
    """
    try:
        lang = _lang_from_request()
        all_schemes = _load_schemes_list()
        filtered_raw = filter_schemes_by_category(all_schemes, category)
        localized = localize_scheme_list(filtered_raw, lang)
        return (
            jsonify(
                {
                    "category": category,
                    "language": lang,
                    "count": len(localized),
                    "schemes": localized,
                }
            ),
            200,
        )
    except FileNotFoundError as e:
        return jsonify({"error": str(e)}), 500
    except Exception as e:
        return jsonify({"error": "Failed to filter schemes", "detail": str(e)}), 500
