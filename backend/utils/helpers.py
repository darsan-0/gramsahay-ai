"""
Small shared helpers used across routes and services.

Keeping JSON load/save and path logic here avoids duplication and makes it easy
to later replace file reads with a real database or cache layer.
"""

import json
import os
from typing import Any, Dict, List


def load_json_file(file_path: str) -> Any:
    """
    Read and parse a JSON file.

    Args:
        file_path: Absolute path to the JSON file.

    Returns:
        Parsed Python object (usually dict or list).

    Raises:
        FileNotFoundError: If the file does not exist.
        json.JSONDecodeError: If the file is not valid JSON.
    """
    if not os.path.isfile(file_path):
        raise FileNotFoundError(f"JSON database not found: {file_path}")

    with open(file_path, "r", encoding="utf-8") as f:
        return json.load(f)


def save_json_file(file_path: str, data: Any) -> None:
    """
    Write a Python object to a JSON file (handy for future admin tools).

    Not used by read-only APIs yet; included for scalability.
    """
    directory = os.path.dirname(file_path)
    if directory and not os.path.isdir(directory):
        os.makedirs(directory, exist_ok=True)

    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def normalize_category(category: str) -> str:
    """Lowercase and strip category for consistent filtering."""
    return (category or "").strip().lower()


def filter_schemes_by_category(schemes: List[Dict[str, Any]], category: str) -> List[Dict[str, Any]]:
    """
    Return schemes whose 'category' field matches (case-insensitive).

    Args:
        schemes: List of scheme dicts from schemes.json.
        category: URL segment or query value to match.

    Returns:
        Filtered list (may be empty).
    """
    target = normalize_category(category)
    if not target:
        return []

    result: List[Dict[str, Any]] = []
    for scheme in schemes:
        scheme_cat = normalize_category(str(scheme.get("category", "")))
        if scheme_cat == target:
            result.append(scheme)
    return result
