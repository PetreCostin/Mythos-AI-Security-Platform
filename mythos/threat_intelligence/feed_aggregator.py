"""Aggregate threat intelligence feeds."""

from __future__ import annotations

import asyncio

from mythos.threat_intelligence.models import FeedItem, IOCType, ThreatFeed


class ThreatFeedAggregator:
    """Fetches and normalizes IOC indicators from configured feeds."""

    def __init__(self, feeds: list[ThreatFeed] | None = None) -> None:
        self.feeds = feeds or [
            ThreatFeed(name="default-otx", provider="otx"),
            ThreatFeed(name="default-misp", provider="misp"),
        ]

    async def fetch_feed(self, feed: ThreatFeed) -> list[FeedItem]:
        """Fetches one feed (stubbed to deterministic sample data)."""
        await asyncio.sleep(0)
        provider = feed.provider.lower()
        if provider == "otx":
            return [
                FeedItem(
                    indicator="198.51.100.42", ioc_type=IOCType.ip, confidence=0.8, tags=["botnet"]
                )
            ]
        if provider == "misp":
            return [
                FeedItem(
                    indicator="malicious.example",
                    ioc_type=IOCType.domain,
                    confidence=0.7,
                    tags=["phishing"],
                )
            ]
        return [
            FeedItem(indicator="deadbeef", ioc_type=IOCType.hash, confidence=0.6, tags=[provider])
        ]

    async def aggregate(self) -> list[FeedItem]:
        """Aggregates indicators from all enabled feeds."""
        enabled = [feed for feed in self.feeds if feed.enabled]
        batches = await asyncio.gather(*(self.fetch_feed(feed) for feed in enabled))
        return [item for batch in batches for item in batch]
