"""Workflow orchestrator tying detection, intelligence, and response."""

from __future__ import annotations

from dataclasses import dataclass

from mythos.incident_response.playbooks import PlaybookRepository
from mythos.incident_response.responder import IncidentResponder
from mythos.threat_detection.detector import ThreatDetector
from mythos.threat_detection.models import SeverityLevel, ThreatAssessment, ThreatEvent
from mythos.threat_detection.rules_engine import RulesEngine, default_rules_engine
from mythos.threat_intelligence.ioc_manager import IOCManager


@dataclass(slots=True)
class OrchestrationResult:
    """Result for one orchestrated event."""

    assessment: ThreatAssessment
    incident_id: str | None
    matched_rules: list[str]
    matched_iocs: list[str]


class SecurityOrchestrator:
    """Coordinates threat analysis and response."""

    def __init__(
        self,
        detector: ThreatDetector | None = None,
        rules_engine: RulesEngine | None = None,
        ioc_manager: IOCManager | None = None,
        responder: IncidentResponder | None = None,
        playbook_repo: PlaybookRepository | None = None,
    ) -> None:
        self.detector = detector or ThreatDetector()
        self.rules_engine = rules_engine or default_rules_engine()
        self.ioc_manager = ioc_manager or IOCManager()
        self.responder = responder or IncidentResponder()
        self.playbook_repo = playbook_repo
        self.incidents: dict[str, str] = {}

    async def process_event(self, event: ThreatEvent) -> OrchestrationResult:
        """Runs a full detection and response pipeline for an event."""
        assessment = self.detector.analyze(event)
        matched_rules, rule_severity = self.rules_engine.evaluate(event)
        matched_iocs = await self.ioc_manager.match_indicators(event.indicators)

        severity = rule_severity or assessment.severity
        if matched_iocs and severity in {SeverityLevel.low, SeverityLevel.medium}:
            severity = SeverityLevel.high

        incident_id: str | None = None
        if assessment.is_anomaly or matched_rules or matched_iocs:
            incident = await self.responder.create_incident(
                event,
                severity=severity,
                reason="; ".join(matched_rules) if matched_rules else "AI anomaly detected",
            )
            if self.playbook_repo:
                playbooks = self.playbook_repo.choose_for_severity(severity)
                for playbook in playbooks:
                    await self.responder.execute_playbook(incident, playbook)
            incident_id = incident.incident_id
            self.incidents[incident.incident_id] = incident.model_dump_json()

        assessment.matched_rules = matched_rules
        return OrchestrationResult(
            assessment=assessment,
            incident_id=incident_id,
            matched_rules=matched_rules,
            matched_iocs=[ioc.value for ioc in matched_iocs],
        )
