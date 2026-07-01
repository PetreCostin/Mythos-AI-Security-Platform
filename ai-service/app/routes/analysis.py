from __future__ import annotations

from fastapi import APIRouter

from app.agents.soc_analyst import SocAnalystAgent
from app.models import AnalysisRequest, AnalysisResponse

router = APIRouter()
agent = SocAnalystAgent()


@router.post("/analyze", response_model=AnalysisResponse)
async def analyze(payload: AnalysisRequest) -> AnalysisResponse:
    prompt = f"Analysis type: {payload.analysis_type}\nTarget: {payload.target}\nData: {payload.data}"
    result = await agent.run(question=prompt, context=payload.data)
    return AnalysisResponse(
        result=result,
        confidence=result.get("confidence", 0.68),
        recommendations=result.get("recommendations", []),
    )


@router.post("/analyze/threat", response_model=AnalysisResponse)
async def analyze_threat(payload: AnalysisRequest) -> AnalysisResponse:
    threat_context = {**payload.data, "analysis_scope": "threat"}
    prompt = f"Threat analysis for {payload.target}: {payload.analysis_type}"
    result = await agent.run(question=prompt, context=threat_context)
    return AnalysisResponse(
        result=result,
        confidence=result.get("confidence", 0.72),
        recommendations=result.get("recommendations", []),
    )
