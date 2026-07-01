from __future__ import annotations

import re
from typing import Any, Dict, List

IP_PATTERN = re.compile(r"\b(?:\d{1,3}\.){3}\d{1,3}\b")
DOMAIN_PATTERN = re.compile(r"\b(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}\b")
SHA256_PATTERN = re.compile(r"\b[a-fA-F0-9]{64}\b")
MD5_PATTERN = re.compile(r"\b[a-fA-F0-9]{32}\b")
REGISTRY_PATTERN = re.compile(r"\b(?:HKLM|HKCU|HKEY_LOCAL_MACHINE|HKEY_CURRENT_USER)\\[^\n\r]+")


def ensure_text(value: Any) -> str:
    if value is None:
        return ""
    if isinstance(value, bytes):
        return value.decode("utf-8", errors="ignore")
    return str(value)


def extract_iocs(content: Any) -> List[Dict[str, str]]:
    text = ensure_text(content)
    indicators: List[Dict[str, str]] = []
    seen: set[tuple[str, str]] = set()

    for match in IP_PATTERN.findall(text):
        key = ("ip", match)
        if key not in seen:
            indicators.append({"type": "ip", "value": match})
            seen.add(key)

    for match in DOMAIN_PATTERN.findall(text):
        if match.replace(".", "").isdigit():
            continue
        key = ("domain", match)
        if key not in seen:
            indicators.append({"type": "domain", "value": match})
            seen.add(key)

    for match in SHA256_PATTERN.findall(text):
        normalized = match.lower()
        key = ("sha256", normalized)
        if key not in seen:
            indicators.append({"type": "sha256", "value": normalized})
            seen.add(key)

    for match in MD5_PATTERN.findall(text):
        normalized = match.lower()
        key = ("md5", normalized)
        if key not in seen:
            indicators.append({"type": "md5", "value": normalized})
            seen.add(key)

    for match in REGISTRY_PATTERN.findall(text):
        key = ("registry", match)
        if key not in seen:
            indicators.append({"type": "registry", "value": match})
            seen.add(key)

    return indicators


def merge_iocs(*ioc_lists: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    merged: List[Dict[str, Any]] = []
    seen: set[tuple[str, str]] = set()
    for ioc_list in ioc_lists:
        for ioc in ioc_list:
            key = (str(ioc.get("type", "unknown")), str(ioc.get("value", "")))
            if key not in seen:
                merged.append(ioc)
                seen.add(key)
    return merged
