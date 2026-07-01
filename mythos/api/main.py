"""FastAPI application entry point."""

from __future__ import annotations

from pathlib import Path

from fastapi import FastAPI

from mythos.api.routers import automation, incidents, intelligence, threats
from mythos.automation.orchestrator import SecurityOrchestrator
from mythos.config.logging import configure_logging
from mythos.config.settings import get_settings
from mythos.incident_response.playbooks import PlaybookRepository
from mythos.threat_intelligence.feed_aggregator import ThreatFeedAggregator
from mythos.threat_intelligence.ioc_manager import IOCManager


def create_app() -> FastAPI:
    """Creates and configures the FastAPI app."""
    settings = get_settings()
    configure_logging(settings.log_level)

    app = FastAPI(title=settings.app_name)

    playbook_repo = PlaybookRepository()
    playbook_dir = Path("playbooks")
    if playbook_dir.exists():
        playbook_repo.load_directory(playbook_dir)

    ioc_manager = IOCManager()
    app.state.ioc_manager = ioc_manager
    app.state.feed_aggregator = ThreatFeedAggregator()
    app.state.orchestrator = SecurityOrchestrator(
        ioc_manager=ioc_manager, playbook_repo=playbook_repo
    )
    app.state.threat_events = {}
    app.state.incident_ids = []

    app.include_router(threats.router, prefix=settings.api_prefix)
    app.include_router(incidents.router, prefix=settings.api_prefix)
    app.include_router(intelligence.router, prefix=settings.api_prefix)
    app.include_router(automation.router, prefix=settings.api_prefix)

    @app.get("/health")
    async def health() -> dict[str, str]:
        return {"status": "ok"}

    return app


app = create_app()
