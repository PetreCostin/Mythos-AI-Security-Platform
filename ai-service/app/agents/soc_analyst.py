from __future__ import annotations

from typing import Any, Dict, List, TypedDict

from langgraph.graph import END, StateGraph

from app.config import get_settings
from app.prompts.soc_analyst_prompt import SOC_ANALYST_PROMPT
from app.tools.cve_lookup import lookup_cve
from app.tools.ioc_enrichment import enrich_iocs
from app.tools.mitre_attack import lookup_by_text
from app.tools.threat_intel import summarize_threat_text
from app.utils.formatters import normalize_confidence

try:
    from langchain_openai import ChatOpenAI
except Exception:  # pragma: no cover
    ChatOpenAI = None


class AnalystState(TypedDict, total=False):
    question: str
    context: Dict[str, Any]
    analysis: Dict[str, Any]
    threats: List[str]
    mitre: List[Dict[str, str]]
    output: Dict[str, Any]


class SocAnalystAgent:
    def __init__(self) -> None:
        self.settings = get_settings()
        self.use_mock = self.settings.should_use_mock_llm or ChatOpenAI is None
        self.graph = self._build_graph()
        self.llm = None
        if not self.use_mock and self.settings.openai_api_key:
            self.llm = ChatOpenAI(model=self.settings.openai_model, api_key=self.settings.openai_api_key, temperature=0.2)

    def _build_graph(self):
        graph = StateGraph(AnalystState)
        graph.add_node("analyze_context", self.analyze_context)
        graph.add_node("identify_threats", self.identify_threats)
        graph.add_node("correlate_alerts", self.correlate_alerts)
        graph.add_node("generate_response", self.generate_response)
        graph.set_entry_point("analyze_context")
        graph.add_edge("analyze_context", "identify_threats")
        graph.add_edge("identify_threats", "correlate_alerts")
        graph.add_edge("correlate_alerts", "generate_response")
        graph.add_edge("generate_response", END)
        return graph.compile()

    def analyze_context(self, state: AnalystState) -> AnalystState:
        question = state.get("question", "")
        context = state.get("context", {}) or {}
        combined_text = f"{question}\n{context}"
        iocs = enrich_iocs(combined_text)
        cves = [lookup_cve(token.strip('., ')) for token in question.split() if token.upper().startswith("CVE-")]
        cves = [cve for cve in cves if cve]
        severity = "medium"
        if any(keyword in combined_text.lower() for keyword in ["ransom", "lsass", "critical", "domain admin", "encrypted"]):
            severity = "high"
        if any(keyword in combined_text.lower() for keyword in ["active exploitation", "data exfiltration", "lateral movement", "command and control"]):
            severity = "critical"
        analysis = {
            "summary": "Initial context triaged against known adversary behaviors.",
            "severity": severity,
            "evidence": [f"IOC detected: {ioc['type']}={ioc['value']}" for ioc in iocs[:4]],
            "iocs": iocs,
            "cves": cves,
        }
        return {**state, "analysis": analysis}

    def identify_threats(self, state: AnalystState) -> AnalystState:
        question = state.get("question", "")
        context = state.get("context", {}) or {}
        combined_text = f"{question}\n{context}"
        mitre = lookup_by_text(combined_text)
        intel = summarize_threat_text(combined_text)
        threats = intel["families"] + intel["campaigns"]
        if not threats:
            threats = ["Suspicious authentication or execution activity requiring validation"]
        if not mitre:
            mitre = lookup_by_text("powershell credential wmi")[:2]
        return {**state, "threats": threats, "mitre": mitre}

    def correlate_alerts(self, state: AnalystState) -> AnalystState:
        analysis = dict(state.get("analysis", {}))
        mitre = state.get("mitre", [])
        threats = state.get("threats", [])
        recommendations = [
            "Validate affected hosts against EDR telemetry and isolate if malicious execution is confirmed.",
            "Search for related authentication, PowerShell, and remote service activity across the declared time range.",
            "Preserve volatile evidence and collect process, network, and user session artifacts.",
        ]
        if any(item.get("id") == "T1486" for item in mitre):
            recommendations.insert(0, "Immediately disable east-west SMB access and protect critical shares from further encryption impact.")
        analysis.update(
            {
                "threats_identified": threats,
                "mitre_techniques": [f"{item['id']} {item['name']}" for item in mitre],
                "recommendations": recommendations,
                "confidence": normalize_confidence(0.76 if analysis.get("iocs") else 0.67),
            }
        )
        return {**state, "analysis": analysis}

    def generate_response(self, state: AnalystState) -> AnalystState:
        analysis = dict(state.get("analysis", {}))
        if self.use_mock or self.llm is None:
            output = {
                **analysis,
                "summary": self._mock_summary(state),
                "mode": "mock",
            }
            return {**state, "output": output}

        prompt = (
            f"{SOC_ANALYST_PROMPT}\n"
            f"Question: {state.get('question', '')}\n"
            f"Context: {state.get('context', {})}\n"
            f"Draft analysis: {analysis}\n"
            "Refine the draft into a concise SOC analysis paragraph followed by top recommendations."
        )
        message = self.llm.invoke(prompt)
        output = {
            **analysis,
            "summary": getattr(message, "content", str(message)),
            "mode": "llm",
        }
        return {**state, "output": output}

    def _mock_summary(self, state: AnalystState) -> str:
        question = state.get("question", "security event")
        threats = state.get("threats", [])
        primary = threats[0] if threats else "suspicious activity"
        return (
            f"The reported activity is consistent with {primary.lower()} and warrants analyst validation. "
            f"Observed indicators from the prompt suggest elevated risk around execution, credential abuse, or lateral movement tied to: {question[:220]}."
        )

    async def run(self, question: str, context: Dict[str, Any] | None = None) -> Dict[str, Any]:
        result = self.graph.invoke({"question": question, "context": context or {}})
        return result["output"]
