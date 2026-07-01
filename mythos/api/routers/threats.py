"""Threat event API endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Depends, Request

from mythos.api.auth import get_current_subject
from mythos.api.schemas import ThreatEventCreate, ThreatEventResponse
from mythos.threat_detection.models import ThreatEvent

router = APIRouter(prefix="/threats", tags=["threats"])


@router.post("", response_model=ThreatEventResponse)
async def create_threat_event(
    payload: ThreatEventCreate,
    request: Request,
    _: str = Depends(get_current_subject),
) -> ThreatEventResponse:
    """Creates and analyzes a threat event."""
    event = ThreatEvent(
        source=payload.source,
        description=payload.description,
        indicators=payload.indicators,
        score=payload.score,
    )
    result = await request.app.state.orchestrator.process_event(event)
    request.app.state.threat_events[event.event_id] = event
    if result.incident_id:
        request.app.state.incident_ids.append(result.incident_id)
    return ThreatEventResponse(
        event=event, assessment=result.assessment, incident_id=result.incident_id
    )


@router.get("", response_model=list[ThreatEvent])
async def list_threat_events(
    request: Request, _: str = Depends(get_current_subject)
) -> list[ThreatEvent]:
    """Lists analyzed threat events."""
    return list(request.app.state.threat_events.values())
