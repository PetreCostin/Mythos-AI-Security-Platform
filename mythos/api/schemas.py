"""API request and response schemas."""

from pydantic import BaseModel, Field

from mythos.threat_detection.models import ThreatAssessment, ThreatEvent
from mythos.threat_intelligence.models import IOC, IOCType


class ThreatEventCreate(BaseModel):
    """Schema for threat event creation."""

    source: str
    description: str
    indicators: list[str] = Field(default_factory=list)
    score: float = Field(default=0.0, ge=0.0, le=1.0)


class ThreatEventResponse(BaseModel):
    """Schema returned for threat analysis."""

    event: ThreatEvent
    assessment: ThreatAssessment
    incident_id: str | None = None


class IOCCreate(BaseModel):
    """Schema for creating IOC."""

    type: IOCType
    value: str
    source: str
    confidence: float = Field(default=0.5, ge=0.0, le=1.0)
    tags: list[str] = Field(default_factory=list)


class IOCResponse(BaseModel):
    """Schema for IOC responses."""

    ioc: IOC
