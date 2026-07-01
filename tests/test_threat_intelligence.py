"""Unit tests for threat intelligence components."""

from datetime import datetime, timedelta, timezone

import pytest

from mythos.threat_intelligence.feed_aggregator import ThreatFeedAggregator
from mythos.threat_intelligence.ioc_manager import IOCManager
from mythos.threat_intelligence.models import IOC, IOCType


@pytest.mark.asyncio
async def test_ioc_manager_add_and_expire() -> None:
    manager = IOCManager()
    ioc = IOC(
        type=IOCType.ip,
        value="198.51.100.42",
        source="otx",
        expires_at=datetime.now(timezone.utc) + timedelta(seconds=1),
    )
    await manager.add_ioc(ioc)
    assert await manager.get_ioc("198.51.100.42") is not None

    removed = await manager.expire_iocs(now=datetime.now(timezone.utc) + timedelta(days=1))
    assert removed == 1


@pytest.mark.asyncio
async def test_feed_aggregator_returns_items() -> None:
    aggregator = ThreatFeedAggregator()
    items = await aggregator.aggregate()
    assert len(items) >= 2
