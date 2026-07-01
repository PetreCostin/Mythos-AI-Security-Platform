from __future__ import annotations

from typing import Any, Dict, List

from app.utils.parsers import extract_iocs


def _score_indicator(value: str) -> str:
    lowered = value.lower()
    if any(token in lowered for token in ["mimikatz", "cobalt", "powersploit", ".onion"]):
        return "malicious"
    if lowered.endswith((".ru", ".cn", ".top")):
        return "suspicious"
    return "unknown"


def enrich_iocs(content: Any) -> List[Dict[str, str]]:
    enriched = []
    for ioc in extract_iocs(content):
        enriched.append(
            {
                **ioc,
                "reputation": _score_indicator(ioc["value"]),
                "source": "mock-threat-intel",
            }
        )
    return enriched
