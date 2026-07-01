from __future__ import annotations

from typing import Dict, List

CAMPAIGN_KEYWORDS = {
    "ransom": "Double-extortion ransomware activity",
    "mimikatz": "Credential theft tradecraft",
    "powershell": "Living-off-the-land PowerShell execution",
    "wmic": "Lateral movement over WMI",
    "phish": "Email-borne initial access",
}


def summarize_threat_text(text: str) -> Dict[str, List[str]]:
    lowered = text.lower()
    campaigns = [summary for keyword, summary in CAMPAIGN_KEYWORDS.items() if keyword in lowered]
    families = []
    if "ransom" in lowered or "encrypt" in lowered:
        families.append("Ransomware")
    if "powershell" in lowered:
        families.append("PowerShell tradecraft")
    if "mimikatz" in lowered or "lsass" in lowered:
        families.append("Credential dumping")
    return {"campaigns": campaigns, "families": families}
