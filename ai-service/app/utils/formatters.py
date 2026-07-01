from __future__ import annotations

import json
from typing import Any, Dict, Iterable


def normalize_confidence(value: float) -> float:
    return max(0.0, min(1.0, round(float(value), 2)))


def severity_score(severity: str) -> int:
    mapping = {"low": 1, "medium": 2, "high": 3, "critical": 4}
    return mapping.get(severity.lower(), 2)


def format_soc_analysis(analysis: Dict[str, Any]) -> str:
    severity = analysis.get("severity", "medium").upper()
    threats = analysis.get("threats_identified", [])
    mitre = analysis.get("mitre_techniques", [])
    recommendations = analysis.get("recommendations", [])
    evidence = analysis.get("evidence", [])
    summary = analysis.get("summary", "Security analysis completed.")

    lines = [
        f"Severity: {severity}",
        f"Summary: {summary}",
        "Threats: " + (", ".join(threats) if threats else "No direct threats identified"),
        "MITRE: " + (", ".join(mitre) if mitre else "No ATT&CK mapping"),
    ]
    if evidence:
        lines.append("Evidence: " + "; ".join(evidence[:4]))
    if recommendations:
        lines.append("Recommendations: " + "; ".join(recommendations[:4]))
    return "\n".join(lines)


def sse_event(data: Dict[str, Any], event: str = "message") -> str:
    payload = json.dumps(data)
    return f"event: {event}\ndata: {payload}\n\n"


def chunk_text(text: str, chunk_size: int = 180) -> Iterable[str]:
    words = text.split()
    current: list[str] = []
    length = 0
    for word in words:
        projected = length + len(word) + (1 if current else 0)
        if projected > chunk_size and current:
            yield " ".join(current)
            current = [word]
            length = len(word)
        else:
            current.append(word)
            length = projected
    if current:
        yield " ".join(current)
