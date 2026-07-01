"""FastAPI endpoint tests."""

import pytest


@pytest.mark.asyncio
async def test_health_endpoint(client) -> None:
    response = await client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


@pytest.mark.asyncio
async def test_threat_and_intelligence_endpoints(client) -> None:
    threat_response = await client.post(
        "/api/v1/threats",
        json={
            "source": "gateway",
            "description": "failed login spike from suspicious source",
            "indicators": ["198.51.100.42"],
            "score": 0.8,
        },
    )
    assert threat_response.status_code == 200
    threat_payload = threat_response.json()
    assert "assessment" in threat_payload

    ioc_response = await client.post(
        "/api/v1/intelligence/iocs",
        json={
            "type": "ip",
            "value": "198.51.100.42",
            "source": "analyst",
            "confidence": 0.9,
            "tags": ["known-bad"],
        },
    )
    assert ioc_response.status_code == 200

    list_response = await client.get("/api/v1/intelligence/iocs")
    assert list_response.status_code == 200
    assert any(item["value"] == "198.51.100.42" for item in list_response.json())
