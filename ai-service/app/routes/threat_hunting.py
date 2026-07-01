from __future__ import annotations

from fastapi import APIRouter

from app.agents.threat_hunter import ThreatHunterAgent
from app.models import ThreatHuntRequest, ThreatHuntResponse
from app.tools.mitre_attack import list_techniques

router = APIRouter()
agent = ThreatHunterAgent()


@router.post("/hunt", response_model=ThreatHuntResponse)
async def hunt(payload: ThreatHuntRequest) -> ThreatHuntResponse:
    result = await agent.run(
        query=payload.query,
        parameters={
            "time_range": payload.time_range,
            "technique": payload.technique,
            "hosts": payload.hosts,
        },
    )
    return ThreatHuntResponse(
        findings=result.get("findings", []),
        tactics=result.get("tactics", []),
        recommendations=result.get("recommendations", []),
    )


@router.get("/hunt/techniques")
async def supported_techniques():
    return {"techniques": list_techniques()}
