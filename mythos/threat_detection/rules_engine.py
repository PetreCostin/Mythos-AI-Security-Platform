"""Rule-based threat detection engine."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Callable

from mythos.threat_detection.models import SeverityLevel, ThreatEvent


@dataclass(slots=True)
class DetectionRule:
    """A configurable detection rule."""

    name: str
    description: str
    severity: SeverityLevel
    condition: Callable[[ThreatEvent], bool]


class RulesEngine:
    """Evaluates events against a set of detection rules."""

    def __init__(self) -> None:
        self._rules: list[DetectionRule] = []

    def register_rule(self, rule: DetectionRule) -> None:
        """Registers a new rule."""
        self._rules.append(rule)

    def evaluate(self, event: ThreatEvent) -> tuple[list[str], SeverityLevel | None]:
        """Returns matched rule names and highest severity."""
        matches: list[str] = []
        highest: SeverityLevel | None = None
        level_rank = {
            SeverityLevel.low: 1,
            SeverityLevel.medium: 2,
            SeverityLevel.high: 3,
            SeverityLevel.critical: 4,
        }

        for rule in self._rules:
            if rule.condition(event):
                matches.append(rule.name)
                if highest is None or level_rank[rule.severity] > level_rank[highest]:
                    highest = rule.severity

        return matches, highest


def default_rules_engine() -> RulesEngine:
    """Creates a default rules engine with practical starter rules."""
    engine = RulesEngine()
    engine.register_rule(
        DetectionRule(
            name="multiple_failed_logins",
            description="Detect repeated authentication failures.",
            severity=SeverityLevel.medium,
            condition=lambda event: "failed login" in event.description.lower()
            and event.score >= 0.4,
        )
    )
    engine.register_rule(
        DetectionRule(
            name="ransomware_indicator",
            description="Detect possible ransomware patterns.",
            severity=SeverityLevel.critical,
            condition=lambda event: "ransom" in event.description.lower()
            or any(".encrypted" in indicator.lower() for indicator in event.indicators),
        )
    )
    engine.register_rule(
        DetectionRule(
            name="c2_traffic",
            description="Detect suspicious command and control traffic.",
            severity=SeverityLevel.high,
            condition=lambda event: "beacon" in event.description.lower()
            or "c2" in event.description.lower(),
        )
    )
    return engine
