from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Dict, List, TypedDict

from langgraph.graph import END, StateGraph

from app.config import get_settings
from app.prompts.threat_hunter_prompt import THREAT_HUNTER_PROMPT
from app.tools.mitre_attack import get_technique, lookup_by_text
from app.tools.sigma_rules import load_sigma_rules
from app.utils.formatters import normalize_confidence

try:
    from langchain_openai import ChatOpenAI
except Exception:  # pragma: no cover
    ChatOpenAI = None


class HuntState(TypedDict, total=False):
    query: str
    parameters: Dict[str, Any]
    hypotheses: List[str]
    mitre: List[Dict[str, str]]
    result: Dict[str, Any]


class ThreatHunterAgent:
    def __init__(self) -> None:
        self.settings = get_settings()
        self.use_mock = self.settings.should_use_mock_llm or ChatOpenAI is None
        self.llm = None
        if not self.use_mock and self.settings.openai_api_key:
            self.llm = ChatOpenAI(model=self.settings.openai_model, api_key=self.settings.openai_api_key, temperature=0.1)
        self.graph = self._build_graph()

    def _build_graph(self):
        graph = StateGraph(HuntState)
        graph.add_node("map_techniques", self.map_techniques)
        graph.add_node("generate_hypotheses", self.generate_hypotheses)
        graph.add_node("suggest_detections", self.suggest_detections)
        graph.add_node("generate_findings", self.generate_findings)
        graph.set_entry_point("map_techniques")
        graph.add_edge("map_techniques", "generate_hypotheses")
        graph.add_edge("generate_hypotheses", "suggest_detections")
        graph.add_edge("suggest_detections", "generate_findings")
        graph.add_edge("generate_findings", END)
        return graph.compile()

    def map_techniques(self, state: HuntState) -> HuntState:
        query = state.get("query", "")
        parameters = state.get("parameters", {})
        mitre = lookup_by_text(query)
        technique = parameters.get("technique")
        if technique and get_technique(technique):
            mitre.insert(0, dict(id=technique.upper(), **get_technique(technique.upper())))
        if not mitre:
            mitre = lookup_by_text("wmic powershell credential")
        return {**state, "mitre": mitre}

    def generate_hypotheses(self, state: HuntState) -> HuntState:
        query = state.get("query", "hunt suspicious activity")
        mitre = state.get("mitre", [])
        hypotheses = [
            f"An adversary may be using {technique['name']} to satisfy the hunt objective: {query}."
            for technique in mitre[:3]
        ]
        if not hypotheses:
            hypotheses = ["A low-noise adversary may be abusing native tooling to evade signatures."]
        return {**state, "hypotheses": hypotheses}

    def suggest_detections(self, state: HuntState) -> HuntState:
        rules = load_sigma_rules()
        suggestions = []
        mitre_ids = {item['id'].lower() for item in state.get('mitre', [])}
        for rule in rules:
            tags = {str(tag).lower() for tag in rule.get('tags', [])}
            if mitre_ids.intersection(tags) or any(tag.startswith('attack.') for tag in tags):
                suggestions.append({"title": rule.get("title"), "level": rule.get("level"), "condition": rule.get("detection", {}).get("condition")})
        state["result"] = {"suggested_rules": suggestions[:3]}
        return state

    def generate_findings(self, state: HuntState) -> HuntState:
        parameters = state.get("parameters", {})
        hosts = parameters.get("hosts") or ["wkstn-014", "dc-01"]
        mitre = state.get("mitre", [])
        hypotheses = state.get("hypotheses", [])
        finding_time = datetime.now(timezone.utc).isoformat()
        findings = []
        for index, host in enumerate(hosts[:3], start=1):
            technique = mitre[(index - 1) % len(mitre)] if mitre else {"id": "T1059", "name": "Command and Scripting Interpreter"}
            findings.append(
                {
                    "host": host,
                    "timestamp": finding_time,
                    "technique": f"{technique['id']} {technique['name']}",
                    "evidence": f"Hunt query aligned process/network telemetry on {host} with {technique['name'].lower()} tradecraft.",
                    "confidence": normalize_confidence(0.64 + (index * 0.08)),
                }
            )
        recommendations = [
            "Convert the highest-confidence hunt leads into detections and retrospective searches.",
            "Pivot on parent-child process ancestry, user context, and authentication telemetry for implicated hosts.",
            "Validate whether observed tooling is administrator-driven or indicative of hands-on-keyboard activity.",
        ]
        narrative = "Mock hunt findings generated" if self.use_mock or self.llm is None else getattr(
            self.llm.invoke(
                f"{THREAT_HUNTER_PROMPT}\n"
                f"Query: {state.get('query')}\n"
                f"Hypotheses: {hypotheses}"
            ),
            'content',
            'Threat hunt completed.',
        )
        result = {
            "findings": findings,
            "tactics": sorted({item["tactic"] for item in mitre}) if mitre else ["execution"],
            "recommendations": recommendations,
            "hypotheses": hypotheses,
            "suggested_rules": state.get("result", {}).get("suggested_rules", []),
            "summary": narrative,
        }
        return {**state, "result": result}

    async def run(self, query: str, parameters: Dict[str, Any] | None = None) -> Dict[str, Any]:
        result = self.graph.invoke({"query": query, "parameters": parameters or {}})
        return result["result"]
