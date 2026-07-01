from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from typing import Any, Dict, List

import yaml

RULES_DIR = Path(__file__).resolve().parents[2] / "sigma_rules"


@lru_cache(maxsize=1)
def load_sigma_rules() -> List[Dict[str, Any]]:
    rules: List[Dict[str, Any]] = []
    for path in sorted(RULES_DIR.glob("*.yml")):
        with path.open("r", encoding="utf-8") as handle:
            rules.append(yaml.safe_load(handle) or {})
    return rules


def _value_matches(actual: Any, operator: str, expected: Any) -> bool:
    actual_text = str(actual or "")
    if operator == "contains":
        if isinstance(expected, list):
            return any(str(item).lower() in actual_text.lower() for item in expected)
        return str(expected).lower() in actual_text.lower()
    if operator == "endswith":
        return actual_text.lower().endswith(str(expected).lower())
    return actual_text.lower() == str(expected).lower()


def _selection_matches(selection: Dict[str, Any], log_entry: Dict[str, Any]) -> bool:
    for field, expected in selection.items():
        if "|" in field:
            base_field, operator = field.split("|", 1)
        else:
            base_field, operator = field, "equals"
        if not _value_matches(log_entry.get(base_field), operator, expected):
            return False
    return True


def match_sigma_rules(log_entry: Dict[str, Any]) -> List[Dict[str, Any]]:
    matches = []
    for rule in load_sigma_rules():
        detection = rule.get("detection", {})
        selection = detection.get("selection", {})
        if selection and _selection_matches(selection, log_entry):
            matches.append(
                {
                    "title": rule.get("title", "Unnamed Sigma Rule"),
                    "level": rule.get("level", "medium"),
                    "tags": rule.get("tags", []),
                    "description": rule.get("description", ""),
                }
            )
    return matches
