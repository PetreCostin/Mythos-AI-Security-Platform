"""Shared pytest fixtures."""

from __future__ import annotations

import pytest
from httpx import ASGITransport, AsyncClient

from mythos.api.main import create_app


@pytest.fixture
async def client() -> AsyncClient:
    """Creates an async API client fixture."""
    app = create_app()
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as async_client:
        yield async_client
