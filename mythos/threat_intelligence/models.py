"""Threat intelligence data models."""

from datetime import datetime, timedelta, timezone
from enum import Enum
from uuid import uuid4

from pydantic import BaseModel, Field


class IOCType(str, Enum):
    """Supported IOC types."""

    ip = "ip"
    domain = "domain"
    hash = "hash"
    url = "url"


class IOC(BaseModel):
    """Indicator of compromise."""

    ioc_id: str = Field(default_factory=lambda: str(uuid4()))
    type: IOCType
    value: str
    source: str
    confidence: float = Field(default=0.5, ge=0.0, le=1.0)
    tags: list[str] = Field(default_factory=list)
    first_seen: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    expires_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc) + timedelta(days=30)
    )


class ThreatFeed(BaseModel):
    """Threat feed metadata."""

    name: str
    provider: str
    enabled: bool = True


class FeedItem(BaseModel):
    """Raw feed item mapped to IOC fields."""

    indicator: str
    ioc_type: IOCType
    confidence: float = 0.5
    tags: list[str] = Field(default_factory=list)
