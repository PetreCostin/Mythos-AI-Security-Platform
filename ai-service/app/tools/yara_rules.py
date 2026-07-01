from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from typing import List

try:
    import yara  # type: ignore
except Exception:  # pragma: no cover - graceful fallback
    yara = None

RULES_DIR = Path(__file__).resolve().parents[2] / "yara_rules"


@lru_cache(maxsize=1)
def _compile_rules():
    if yara is None:
        return None
    filepaths = {path.stem: str(path) for path in RULES_DIR.glob("*.yar")}
    if not filepaths:
        return None
    return yara.compile(filepaths=filepaths)


class YaraScanner:
    def __init__(self) -> None:
        self._compiled = _compile_rules()

    def match(self, file_content: bytes) -> List[str]:
        if not file_content:
            return []
        if self._compiled is not None:
            return [match.rule for match in self._compiled.match(data=file_content)]
        return self._fallback_match(file_content)

    @staticmethod
    def _fallback_match(file_content: bytes) -> List[str]:
        text = file_content.decode("utf-8", errors="ignore").lower()
        matches = []
        if "powershell" in text and ("-encodedcommand" in text or "-enc " in text):
            matches.append("Suspicious_PowerShell_Encoded")
        if sum(token in text for token in ["eval(", "base64_decode(", "system(", "passthru(", "shell_exec("]) >= 3:
            matches.append("WebShell_Generic")
        if any(token in text for token in ["your files have been encrypted", ".locked", ".encrypted", "bitcoin", "decrypt"]):
            matches.append("Ransomware_Generic")
        if "cmd.exe" in text and ("/c whoami" in text or "/c net user" in text):
            matches.append("WebShell_Command_Execution")
        return matches
