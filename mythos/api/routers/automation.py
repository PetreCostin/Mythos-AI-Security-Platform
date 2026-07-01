"""Automation workflow API endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Depends, Request

from mythos.api.auth import get_current_subject
from mythos.api.schemas import ThreatEventCreate
from mythos.threat_detection.models import ThreatEvent

router = APIRouter(prefix="/automation", tags=["automation"])


@router.post("/process")
async def process_event(
    payload: ThreatEventCreate, request: Request, _: str = Depends(get_current_subject)
) -> dict[str, str | None]:
    """Runs full automation workflow for provided event payload."""
    event = ThreatEvent(
        source=payload.source,
        description=payload.description,
        indicators=payload.indicators,
        score=payload.score,
    )
    result = await request.app.state.orchestrator.process_event(event)
    return {
        "incident_id": result.incident_id,
        "severity": result.assessment.severity,
        "confidence": f"{result.assessment.confidence:.2f}",
    }
