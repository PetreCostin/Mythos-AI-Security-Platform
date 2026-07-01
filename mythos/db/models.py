"""SQLAlchemy ORM models for Mythos entities."""

from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, Float, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from mythos.db.database import Base


class ThreatEventORM(Base):
    """Persisted threat events."""

    __tablename__ = "threat_events"

    event_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    source: Mapped[str] = mapped_column(String(255), index=True)
    description: Mapped[str] = mapped_column(Text)
    score: Mapped[float] = mapped_column(Float, default=0.0)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)


class IncidentORM(Base):
    """Persisted incidents."""

    __tablename__ = "incidents"

    incident_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text)
    severity: Mapped[str] = mapped_column(String(32), index=True)
    status: Mapped[str] = mapped_column(String(32), index=True)
    threat_event_id: Mapped[str] = mapped_column(String(64), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)


class IOCORM(Base):
    """Persisted IOC records."""

    __tablename__ = "iocs"

    ioc_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    ioc_type: Mapped[str] = mapped_column(String(16), index=True)
    value: Mapped[str] = mapped_column(String(1024), unique=True, index=True)
    source: Mapped[str] = mapped_column(String(255))
    confidence: Mapped[float] = mapped_column(Float, default=0.5)
