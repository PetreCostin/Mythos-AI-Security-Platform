"""Celery-style async task definitions."""

from mythos.automation.orchestrator import OrchestrationResult, SecurityOrchestrator
from mythos.threat_detection.models import ThreatEvent


async def process_threat_event(
    orchestrator: SecurityOrchestrator, event: ThreatEvent
) -> OrchestrationResult:
    """Processes one threat event as an asynchronous task."""
    return await orchestrator.process_event(event)
