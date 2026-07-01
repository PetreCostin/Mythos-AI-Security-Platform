"""Automated incident response workflows."""

from __future__ import annotations

from dataclasses import dataclass

from mythos.incident_response.models import Incident, IncidentStatus, Playbook, ResponseAction
from mythos.threat_detection.models import SeverityLevel, ThreatEvent


@dataclass(slots=True)
class ResponderResult:
    """Result of executing an incident response playbook."""

    incident: Incident
    executed_actions: list[ResponseAction]


class IncidentResponder:
    """Automates incident lifecycle and response actions."""

    async def create_incident(
        self, event: ThreatEvent, severity: SeverityLevel, reason: str
    ) -> Incident:
        """Creates an incident from a threat event."""
        return Incident(
            title=f"Security incident from {event.source}",
            description=reason,
            severity=severity,
            threat_event_id=event.event_id,
        )

    async def execute_playbook(self, incident: Incident, playbook: Playbook) -> ResponderResult:
        """Executes playbook steps and updates the incident."""
        executed: list[ResponseAction] = []
        incident.status = IncidentStatus.in_progress
        for step in playbook.steps:
            executed.append(step.action)
            incident.actions.append(step.action)
        incident.status = IncidentStatus.resolved if executed else IncidentStatus.open
        return ResponderResult(incident=incident, executed_actions=executed)
