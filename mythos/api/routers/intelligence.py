"""Threat intelligence API endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Depends, Request

from mythos.api.auth import get_current_subject
from mythos.api.schemas import IOCCreate, IOCResponse
from mythos.threat_intelligence.models import IOC

router = APIRouter(prefix="/intelligence", tags=["intelligence"])


@router.post("/iocs", response_model=IOCResponse)
async def create_ioc(
    payload: IOCCreate, request: Request, _: str = Depends(get_current_subject)
) -> IOCResponse:
    """Adds an IOC to the intelligence manager."""
    ioc = IOC(
        type=payload.type,
        value=payload.value,
        source=payload.source,
        confidence=payload.confidence,
        tags=payload.tags,
    )
    created = await request.app.state.ioc_manager.add_ioc(ioc)
    return IOCResponse(ioc=created)


@router.get("/iocs", response_model=list[IOC])
async def list_iocs(request: Request, _: str = Depends(get_current_subject)) -> list[IOC]:
    """Lists active IOCs."""
    return await request.app.state.ioc_manager.list_active()


@router.get("/feeds/aggregate")
async def aggregate_feeds(
    request: Request, _: str = Depends(get_current_subject)
) -> dict[str, int]:
    """Fetches and counts feed items from configured providers."""
    items = await request.app.state.feed_aggregator.aggregate()
    return {"count": len(items)}
