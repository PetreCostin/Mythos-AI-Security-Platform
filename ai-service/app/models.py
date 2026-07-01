from __future__ import annotations

from typing import Any, Dict, List, Literal, Optional

from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    role: Literal["user", "assistant", "system"]
    content: str


class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    stream: bool = False
    context: Optional[Dict[str, Any]] = None


class ChatResponse(BaseModel):
    message: ChatMessage
    usage: Dict[str, Any] = Field(default_factory=dict)


class AnalysisRequest(BaseModel):
    target: str
    analysis_type: str
    data: Dict[str, Any] = Field(default_factory=dict)


class AnalysisResponse(BaseModel):
    result: Dict[str, Any]
    confidence: float
    recommendations: List[str]


class ThreatHuntRequest(BaseModel):
    query: str
    time_range: str
    technique: Optional[str] = None
    hosts: Optional[List[str]] = None


class ThreatHuntResponse(BaseModel):
    findings: List[Dict[str, Any]]
    tactics: List[str]
    recommendations: List[str]


class IncidentRequest(BaseModel):
    incident_id: str
    description: str
    alerts: List[Dict[str, Any]] = Field(default_factory=list)
    context: Dict[str, Any] = Field(default_factory=dict)


class IncidentResponse(BaseModel):
    severity_assessment: str
    timeline: List[Dict[str, Any]]
    playbook: List[str]
    recommendations: List[str]


class MalwareRequest(BaseModel):
    file_content: Optional[bytes] = None
    file_hash: Optional[str] = None
    file_name: str


class MalwareResponse(BaseModel):
    classification: str
    confidence: float
    yara_matches: List[str]
    behaviors: List[str]
    iocs: List[Dict[str, Any]]
    recommendations: List[str]
