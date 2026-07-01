"""Unit tests for threat detection components."""

from mythos.threat_detection.detector import ThreatDetector
from mythos.threat_detection.models import SeverityLevel, ThreatEvent
from mythos.threat_detection.rules_engine import default_rules_engine


def test_detector_identifies_high_risk_event() -> None:
    detector = ThreatDetector()
    event = ThreatEvent(
        source="auth-service",
        description="Multiple failed login attempts and ransomware note detected",
        indicators=["10.0.0.1", "file.encrypted"],
        score=0.95,
    )

    assessment = detector.analyze(event)

    assert assessment.is_anomaly is True
    assert assessment.severity in {SeverityLevel.high, SeverityLevel.critical}


def test_rules_engine_matches_ransomware_rule() -> None:
    engine = default_rules_engine()
    event = ThreatEvent(
        source="endpoint-agent",
        description="Host reports ransom demand after encryption",
        indicators=["invoice.encrypted"],
        score=0.5,
    )

    matched, severity = engine.evaluate(event)

    assert "ransomware_indicator" in matched
    assert severity == SeverityLevel.critical
