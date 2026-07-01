"""AI-powered anomaly detection for threat events."""

from __future__ import annotations

from typing import Iterable

import numpy as np
from sklearn.ensemble import IsolationForest

from mythos.threat_detection.models import SeverityLevel, ThreatAssessment, ThreatEvent


class ThreatDetector:
    """Detects anomalous threat events using an Isolation Forest model."""

    def __init__(self, contamination: float = 0.1, random_state: int = 42) -> None:
        self._model = IsolationForest(contamination=contamination, random_state=random_state)
        self._fitted = False

    @staticmethod
    def _features(event: ThreatEvent) -> np.ndarray:
        keyword_hits = sum(
            1
            for keyword in ("failed", "bruteforce", "malware", "ransom", "exfiltration")
            if keyword in event.description.lower()
        )
        return np.array(
            [
                event.score,
                float(len(event.indicators)),
                float(len(event.description)),
                float(keyword_hits),
            ],
            dtype=float,
        )

    def fit(self, events: Iterable[ThreatEvent]) -> None:
        """Fits the anomaly detector with historical events."""
        dataset = [self._features(event) for event in events]
        if not dataset:
            return
        self._model.fit(np.vstack(dataset))
        self._fitted = True

    def score_event(self, event: ThreatEvent) -> float:
        """Returns normalized anomaly score from 0 to 1."""
        if not self._fitted:
            heuristic = min(1.0, (event.score * 0.7) + (len(event.indicators) / 10.0))
            return round(heuristic, 4)

        raw_score = float(-self._model.decision_function(self._features(event).reshape(1, -1))[0])
        return float(np.clip((raw_score + 1.0) / 2.0, 0.0, 1.0))

    def analyze(self, event: ThreatEvent) -> ThreatAssessment:
        """Analyzes an event and returns a threat assessment."""
        confidence = self.score_event(event)
        is_anomaly = confidence >= 0.55
        if confidence >= 0.9:
            severity = SeverityLevel.critical
        elif confidence >= 0.75:
            severity = SeverityLevel.high
        elif confidence >= 0.55:
            severity = SeverityLevel.medium
        else:
            severity = SeverityLevel.low

        return ThreatAssessment(is_anomaly=is_anomaly, severity=severity, confidence=confidence)
