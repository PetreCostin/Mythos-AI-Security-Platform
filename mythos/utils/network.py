"""Network parsing and validation helpers."""

from __future__ import annotations

import ipaddress
import re

_DOMAIN_PATTERN = re.compile(r"^(?=.{1,253}$)([a-zA-Z0-9-]{1,63}\.)+[a-zA-Z]{2,63}$")


def is_valid_ip(value: str) -> bool:
    """Validates IPv4/IPv6 addresses."""
    try:
        ipaddress.ip_address(value)
        return True
    except ValueError:
        return False


def is_valid_domain(value: str) -> bool:
    """Validates domain names."""
    return _DOMAIN_PATTERN.match(value) is not None
