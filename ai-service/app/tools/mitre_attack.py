from __future__ import annotations

from typing import Dict, List, Optional

MITRE_TECHNIQUES: Dict[str, Dict[str, str]] = {
    "T1055": {"name": "Process Injection", "tactic": "defense-evasion", "description": "Adversaries inject code into legitimate processes to evade detection and escalate execution."},
    "T1059": {"name": "Command and Scripting Interpreter", "tactic": "execution", "description": "Adversaries abuse command shells and scripting engines such as PowerShell and bash."},
    "T1003": {"name": "OS Credential Dumping", "tactic": "credential-access", "description": "Attackers dump credentials from LSASS, SAM, or security subsystems."},
    "T1021": {"name": "Remote Services", "tactic": "lateral-movement", "description": "Remote protocols such as RDP, SMB, SSH, or WMI are abused for movement."},
    "T1053": {"name": "Scheduled Task/Job", "tactic": "persistence", "description": "Scheduled tasks or cron jobs are used to persist or execute payloads."},
    "T1078": {"name": "Valid Accounts", "tactic": "initial-access", "description": "Compromised credentials allow access while blending into normal operations."},
    "T1082": {"name": "System Information Discovery", "tactic": "discovery", "description": "Adversaries enumerate host attributes, installed software, and hardware details."},
    "T1083": {"name": "File and Directory Discovery", "tactic": "discovery", "description": "Files and folders are enumerated to identify valuable data or tooling paths."},
    "T1105": {"name": "Ingress Tool Transfer", "tactic": "command-and-control", "description": "Adversaries transfer tools or malware to compromised systems."},
    "T1486": {"name": "Data Encrypted for Impact", "tactic": "impact", "description": "Ransomware encrypts data to disrupt availability and extort victims."},
    "T1190": {"name": "Exploit Public-Facing Application", "tactic": "initial-access", "description": "Internet-exposed applications are exploited to gain footholds."},
    "T1566": {"name": "Phishing", "tactic": "initial-access", "description": "Users are targeted with malicious content to obtain execution or credentials."},
}

KEYWORD_MAP = {
    "powershell": "T1059",
    "lsass": "T1003",
    "wmic": "T1021",
    "wmi": "T1021",
    "scheduled task": "T1053",
    "credential": "T1078",
    "inventory": "T1082",
    "discovery": "T1083",
    "download": "T1105",
    "ransom": "T1486",
    "encrypt": "T1486",
    "exploit": "T1190",
    "phish": "T1566",
}


def get_technique(technique_id: str) -> Optional[Dict[str, str]]:
    return MITRE_TECHNIQUES.get(technique_id.upper())


def list_techniques() -> List[Dict[str, str]]:
    return [dict(id=technique_id, **details) for technique_id, details in MITRE_TECHNIQUES.items()]


def lookup_by_text(text: str) -> List[Dict[str, str]]:
    lowered = text.lower()
    matches = []
    seen = set()
    for keyword, technique_id in KEYWORD_MAP.items():
        if keyword in lowered and technique_id not in seen:
            seen.add(technique_id)
            technique = MITRE_TECHNIQUES[technique_id]
            matches.append(dict(id=technique_id, **technique))
    return matches
