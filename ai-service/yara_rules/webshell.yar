rule WebShell_Command_Execution {
    meta:
        description = "Detects command execution capable web shells"
        severity = "CRITICAL"
    strings:
        $cmd1 = "cmd.exe" nocase
        $cmd2 = "/c whoami" nocase
        $cmd3 = "/c net user" nocase
        $php1 = "$_POST" nocase
        $php2 = "$_GET" nocase
        $asp1 = "WScript.Shell" nocase
    condition:
        ($cmd1 and 1 of ($cmd2, $cmd3)) or
        (1 of ($php*) and $cmd1) or
        $asp1
}
