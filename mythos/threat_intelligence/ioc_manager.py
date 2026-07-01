"""IOC manager for storing and querying indicators."""

from __future__ import annotations

from datetime import datetime, timezone

from mythos.threat_intelligence.models import IOC


class IOCManager:
    """In-memory IOC manager with expiration support."""

    def __init__(self) -> None:
        self._iocs: dict[str, IOC] = {}

    async def add_ioc(self, ioc: IOC) -> IOC:
        """Adds or updates an IOC by value."""
        self._iocs[ioc.value.lower()] = ioc
        return ioc

    async def get_ioc(self, value: str) -> IOC | None:
        """Gets IOC by exact value."""
        return self._iocs.get(value.lower())

    async def list_active(self, now: datetime | None = None) -> list[IOC]:
        """Lists active (non-expired) IOCs."""
        current = now or datetime.now(timezone.utc)
        return [ioc for ioc in self._iocs.values() if ioc.expires_at > current]

    async def expire_iocs(self, now: datetime | None = None) -> int:
        """Removes expired IOCs and returns count."""
        current = now or datetime.now(timezone.utc)
        stale = [value for value, ioc in self._iocs.items() if ioc.expires_at <= current]
        for value in stale:
            self._iocs.pop(value, None)
        return len(stale)

    async def match_indicators(self, indicators: list[str]) -> list[IOC]:
        """Matches provided indicators against stored IOCs."""
        matches: list[IOC] = []
        for indicator in indicators:
            item = await self.get_ioc(indicator)
            if item is not None:
                matches.append(item)
        return matches
