"""Unit tests for incident response logic."""

from pathlib import Path

import pytest

from mythos.incident_response.playbooks import load_playbook
from mythos.incident_response.responder import IncidentResponder
from mythos.threat_detection.models import SeverityLevel, ThreatEvent

@pytest.mark.asyncio
async def test_responder_executes_playbook() -> None:
    playbook_path = Path("playbooks/ransomware_response.yaml")
    playbook = load_playbook(playbook_path)

    responder = IncidentResponder()
    event = ThreatEvent(
        source="edr", description="ransomware behavior", indicators=["a.encrypted"], score=0.9
    )
    incident = await responder.create_incident(
        event, severity=SeverityLevel.critical, reason="ransomware rule"
    )
    result = await responder.execute_playbook(incident, playbook)

    assert result.executed_actions
    assert result.incident.status == "resolved"
