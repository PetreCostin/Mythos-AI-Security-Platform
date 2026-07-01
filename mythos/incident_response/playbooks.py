"""YAML-based playbook definitions and loaders."""

from __future__ import annotations

from pathlib import Path

import yaml

from mythos.incident_response.models import Playbook, PlaybookStep
from mythos.threat_detection.models import SeverityLevel


def load_playbook(path: Path) -> Playbook:
    """Loads and validates a playbook YAML file."""
    payload = yaml.safe_load(path.read_text(encoding="utf-8"))
    payload["steps"] = [PlaybookStep(**step) for step in payload.get("steps", [])]
    return Playbook(**payload)


class PlaybookRepository:
    """Stores and resolves loaded playbooks."""

    def __init__(self) -> None:
        self._playbooks: dict[str, Playbook] = {}

    def load_directory(self, directory: Path) -> None:
        """Loads all .yaml playbooks from a directory."""
        for path in sorted(directory.glob("*.yaml")):
            playbook = load_playbook(path)
            self._playbooks[playbook.name] = playbook

    def all(self) -> list[Playbook]:
        """Returns all loaded playbooks."""
        return list(self._playbooks.values())

    def choose_for_severity(self, severity: SeverityLevel) -> list[Playbook]:
        """Returns playbooks matching an exact severity trigger."""
        return [pb for pb in self._playbooks.values() if pb.trigger_severity == severity]
