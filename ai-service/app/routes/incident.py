from __future__ import annotations

from fastapi import APIRouter

from app.agents.incident_responder import IncidentResponderAgent
from app.models import IncidentRequest, IncidentResponse

router = APIRouter()
agent = IncidentResponderAgent()


def _payload_to_incident(payload: IncidentRequest):
    return {
        "incident_id": payload.incident_id,
        "description": payload.description,
        "alerts": payload.alerts,
        "context": payload.context,
    }


@router.post("/incident/analyze", response_model=IncidentResponse)
async def analyze_incident(payload: IncidentRequest) -> IncidentResponse:
    result = await agent.run(_payload_to_incident(payload))
    return IncidentResponse(
        severity_assessment=result.get("severity_assessment", "MEDIUM"),
        timeline=result.get("timeline", []),
        playbook=result.get("playbook", []),
        recommendations=result.get("recommendations", []),
    )


@router.post("/incident/playbook", response_model=IncidentResponse)
async def generate_playbook(payload: IncidentRequest) -> IncidentResponse:
    result = await agent.run(_payload_to_incident(payload))
    return IncidentResponse(
        severity_assessment=result.get("severity_assessment", "MEDIUM"),
        timeline=result.get("timeline", []),
        playbook=result.get("playbook", []),
        recommendations=result.get("recommendations", []),
    )
