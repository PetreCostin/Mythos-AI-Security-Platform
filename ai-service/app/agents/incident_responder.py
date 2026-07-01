from __future__ import annotations

from typing import Any, Dict, List, TypedDict

from langgraph.graph import END, StateGraph

from app.config import get_settings
from app.prompts.incident_responder_prompt import INCIDENT_RESPONDER_PROMPT
from app.tools.mitre_attack import lookup_by_text
from app.utils.formatters import severity_score

try:
    from langchain_openai import ChatOpenAI
except Exception:  # pragma: no cover
    ChatOpenAI = None


class IncidentState(TypedDict, total=False):
    incident: Dict[str, Any]
    assessment: Dict[str, Any]
    output: Dict[str, Any]


class IncidentResponderAgent:
    def __init__(self) -> None:
        self.settings = get_settings()
        self.use_mock = self.settings.should_use_mock_llm or ChatOpenAI is None
        self.llm = None
        if not self.use_mock and self.settings.openai_api_key:
            self.llm = ChatOpenAI(model=self.settings.openai_model, api_key=self.settings.openai_api_key, temperature=0.1)
        self.graph = self._build_graph()

    def _build_graph(self):
        graph = StateGraph(IncidentState)
        graph.add_node("analyze_incident", self.analyze_incident)
        graph.add_node("build_playbook", self.build_playbook)
        graph.add_node("prioritize_actions", self.prioritize_actions)
        graph.set_entry_point("analyze_incident")
        graph.add_edge("analyze_incident", "build_playbook")
        graph.add_edge("build_playbook", "prioritize_actions")
        graph.add_edge("prioritize_actions", END)
        return graph.compile()

    def analyze_incident(self, state: IncidentState) -> IncidentState:
        incident = state.get("incident", {})
        description = incident.get("description", "")
        alerts = incident.get("alerts", [])
        severity = "medium"
        if len(alerts) >= 3 or any(word in description.lower() for word in ["credential", "ransom", "lateral", "exfiltration"]):
            severity = "high"
        if any(word in description.lower() for word in ["domain admin", "critical server", "data encrypted", "active command and control"]):
            severity = "critical"
        timeline = []
        for idx, alert in enumerate(alerts, start=1):
            timeline.append(
                {
                    "sequence": idx,
                    "time": alert.get("timestamp") or alert.get("time") or f"T+{idx * 5}m",
                    "event": alert.get("title") or alert.get("name") or alert.get("description") or "Alert observed",
                }
            )
        if not timeline:
            timeline.append({"sequence": 1, "time": "T+0m", "event": "Initial incident triage opened"})
        assessment = {"severity": severity, "timeline": timeline, "mitre": lookup_by_text(description)}
        return {**state, "assessment": assessment}

    def build_playbook(self, state: IncidentState) -> IncidentState:
        assessment = dict(state.get("assessment", {}))
        playbook = [
            "Preparation: Confirm incident commander, preserve case notes, and verify logging coverage for impacted assets.",
            "Identification: Validate affected users, hosts, and accounts; correlate alerts with endpoint, identity, and network telemetry.",
            "Containment: Isolate impacted systems, disable compromised accounts, and block malicious indicators across controls.",
            "Eradication: Remove persistence, terminate malicious processes, reset credentials, and patch exploited weaknesses.",
            "Recovery: Restore business services in stages, monitor for recurrence, and verify hardening baselines.",
            "Lessons Learned: Document root cause, update detections, and capture control gaps for follow-up remediation.",
        ]
        if assessment.get("severity") == "critical":
            playbook.insert(2, "Containment Priority: Disable east-west administrative protocols and enforce emergency segmentation for crown-jewel assets.")
        assessment["playbook"] = playbook
        return {**state, "assessment": assessment}

    def prioritize_actions(self, state: IncidentState) -> IncidentState:
        assessment = dict(state.get("assessment", {}))
        description = state.get("incident", {}).get("description", "")
        recommendations = [
            "Contain high-risk endpoints first, then reset impacted credentials and invalidate active sessions.",
            "Acquire volatile memory and relevant logs before destructive cleanup actions when feasible.",
            "Open a retrospective hunt for related indicators across peer hosts and privileged accounts.",
        ]
        if "email" in description.lower() or "phish" in description.lower():
            recommendations.insert(0, "Purge related messages from mailboxes and block sender/infrastructure indicators.")
        if self.use_mock or self.llm is None:
            severity_text = assessment.get("severity", "medium").upper()
        else:
            response = self.llm.invoke(
                f"{INCIDENT_RESPONDER_PROMPT}\n"
                f"Incident: {state.get('incident')}\n"
                f"Assessment: {assessment}"
            )
            severity_text = getattr(response, 'content', assessment.get('severity', 'medium')).splitlines()[0][:32]
        output = {
            "severity_assessment": severity_text,
            "timeline": assessment.get("timeline", []),
            "playbook": assessment.get("playbook", []),
            "recommendations": recommendations,
            "priority_score": severity_score(assessment.get("severity", "medium")),
        }
        return {**state, "output": output}

    async def run(self, incident: Dict[str, Any]) -> Dict[str, Any]:
        result = self.graph.invoke({"incident": incident})
        return result["output"]
