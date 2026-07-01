"""Pydantic models for threat detection."""

from datetime import datetime, timezone
from enum import Enum
from typing import Any
from uuid import uuid4

from pydantic import BaseModel, Field


class SeverityLevel(str, Enum):
    """Supported severity levels."""

    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


class ThreatEvent(BaseModel):
    """Represents a security event sent to Mythos."""

    event_id: str = Field(default_factory=lambda: str(uuid4()))
    source: str
    description: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    indicators: list[str] = Field(default_factory=list)
    score: float = Field(default=0.0, ge=0.0, le=1.0)
    metadata: dict[str, Any] = Field(default_factory=dict)


class ThreatAssessment(BaseModel):
    """Represents AI/rule assessment for an event."""

    is_anomaly: bool
    severity: SeverityLevel
    confidence: float = Field(ge=0.0, le=1.0)
    matched_rules: list[str] = Field(default_factory=list)
