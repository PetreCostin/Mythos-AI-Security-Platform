"""Incident response models."""

from datetime import datetime, timezone
from enum import Enum
from typing import Any
from uuid import uuid4

from pydantic import BaseModel, Field

from mythos.threat_detection.models import SeverityLevel


class IncidentStatus(str, Enum):
    """Status of a tracked incident."""

    open = "open"
    in_progress = "in_progress"
    resolved = "resolved"


class ResponseAction(str, Enum):
    """Supported response actions."""

    isolate = "isolate"
    alert = "alert"
    remediate = "remediate"
    block = "block"
    collect = "collect"


class PlaybookStep(BaseModel):
    """One incident response playbook step."""

    action: ResponseAction
    parameters: dict[str, Any] = Field(default_factory=dict)


class Playbook(BaseModel):
    """Collection of response actions for an incident category."""

    name: str
    trigger_severity: SeverityLevel
    description: str
    steps: list[PlaybookStep]


class Incident(BaseModel):
    """Tracked incident entity."""

    incident_id: str = Field(default_factory=lambda: str(uuid4()))
    title: str
    description: str
    severity: SeverityLevel
    status: IncidentStatus = IncidentStatus.open
    threat_event_id: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    actions: list[ResponseAction] = Field(default_factory=list)
