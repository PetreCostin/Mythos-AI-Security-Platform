from __future__ import annotations

from typing import Dict, Optional

CVE_DATA: Dict[str, Dict[str, str]] = {
    "CVE-2021-44228": {"severity": "critical", "product": "Apache Log4j", "summary": "Remote code execution via JNDI lookup injection.", "recommendation": "Upgrade Log4j to a patched version and block outbound LDAP/RMI where possible."},
    "CVE-2023-23397": {"severity": "critical", "product": "Microsoft Outlook", "summary": "Privilege escalation and NTLM relay exposure through specially crafted messages.", "recommendation": "Apply Microsoft patches and audit outbound NTLM authentication."},
    "CVE-2023-3519": {"severity": "critical", "product": "Citrix ADC/Gateway", "summary": "Unauthenticated code execution in internet-facing appliances.", "recommendation": "Patch urgently, review web shell persistence, and rotate administrative secrets."},
    "CVE-2024-3400": {"severity": "critical", "product": "Palo Alto PAN-OS", "summary": "Command injection affecting GlobalProtect configurations.", "recommendation": "Apply the vendor fix, review telemetry, and hunt for unexpected cron or persistence artifacts."},
}


def lookup_cve(cve_id: str) -> Optional[Dict[str, str]]:
    return CVE_DATA.get(cve_id.upper())
