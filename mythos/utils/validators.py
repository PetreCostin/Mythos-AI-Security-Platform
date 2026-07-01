"""General-purpose input validators."""

from __future__ import annotations


def sanitize_text(value: str) -> str:
    """Normalizes text input by stripping whitespace."""
    return " ".join(value.strip().split())


def ensure_non_empty(value: str, field_name: str) -> str:
    """Ensures required text fields are not empty."""
    cleaned = sanitize_text(value)
    if not cleaned:
        raise ValueError(f"{field_name} must not be empty")
    return cleaned
