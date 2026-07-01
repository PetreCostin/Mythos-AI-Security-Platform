rule Ransomware_Generic {
    meta:
        description = "Generic ransomware indicators"
        severity = "CRITICAL"
    strings:
        $ransom1 = "YOUR FILES HAVE BEEN ENCRYPTED" nocase
        $ransom2 = "bitcoin" nocase
        $ransom3 = "decrypt" nocase
        $ransom4 = ".locked" nocase
        $ransom5 = "ransom" nocase
        $ext1 = ".encrypted"
        $ext2 = ".crypted"
        $ext3 = ".locked"
    condition:
        2 of ($ransom*) or 1 of ($ext*)
}
