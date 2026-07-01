"""Simple periodic scheduler for async tasks."""

from __future__ import annotations

import asyncio
from collections.abc import Awaitable, Callable


class PeriodicScheduler:
    """Schedules periodic async jobs."""

    def __init__(self) -> None:
        self._tasks: list[asyncio.Task[None]] = []

    def every(self, interval_seconds: float, coro_factory: Callable[[], Awaitable[None]]) -> None:
        """Schedules a coroutine factory periodically."""

        async def _runner() -> None:
            while True:
                await coro_factory()
                await asyncio.sleep(interval_seconds)

        self._tasks.append(asyncio.create_task(_runner()))

    async def stop(self) -> None:
        """Stops all scheduled jobs."""
        for task in self._tasks:
            task.cancel()
        if self._tasks:
            await asyncio.gather(*self._tasks, return_exceptions=True)
        self._tasks.clear()
