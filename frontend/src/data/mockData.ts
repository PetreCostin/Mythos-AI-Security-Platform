import type {
  Alert,
  AppUser,
  AttackPath,
  CVE,
  ComplianceCheck,
  ContainerScanResult,
  DashboardMetric,
  DependencyRisk,
  Incident,
  IOCResult,
  MalwareReport,
  PipelineSecurityStatus,
  ThreatHuntResult,
  VulnFinding,
} from '../types'

export const mockUser: AppUser = {
  name: 'Avery Chen',
  role: 'Lead Security Analyst',
  avatar: 'AC',
}

export const mockAlerts: Alert[] = [
  {
    id: 'ALT-1042',
    title: 'Credential dumping attempt detected on DC-01',
    severity: 'CRITICAL',
    source: 'EDR Sentinel',
    status: 'OPEN',
    asset: 'dc-01.mythos.local',
    timestamp: '2026-07-01T08:14:00Z',
    description: 'LSASS memory access pattern matched T1003 with unsigned process lineage.',
  },
  {
    id: 'ALT-1041',
    title: 'Suspicious PowerShell encoded command',
    severity: 'HIGH',
    source: 'Windows Defender',
    status: 'INVESTIGATING',
    asset: 'fin-wks-22',
    timestamp: '2026-07-01T07:55:00Z',
    description: 'Encoded PowerShell executed from temp profile path with outbound beaconing.',
  },
  {
    id: 'ALT-1039',
    title: 'Lateral movement via SMB admin share',
    severity: 'HIGH',
    source: 'NDR Core',
    status: 'TRIAGED',
    asset: 'eng-jump-03',
    timestamp: '2026-07-01T07:21:00Z',
    description: 'Repeated service creation over ADMIN$ followed by PsExec-style execution.',
  },
  {
    id: 'ALT-1036',
    title: 'Malicious domain queried by workstation',
    severity: 'MEDIUM',
    source: 'DNS Analytics',
    status: 'OPEN',
    asset: 'sales-mbp-14',
    timestamp: '2026-07-01T06:43:00Z',
    description: 'Domain overlaps with recent phishing infrastructure tied to Lumma campaigns.',
  },
  {
    id: 'ALT-1032',
    title: 'Anomalous OAuth grant to shadow application',
    severity: 'LOW',
    source: 'Identity Guard',
    status: 'RESOLVED',
    asset: 'entra-tenant',
    timestamp: '2026-07-01T05:18:00Z',
    description: 'Grant revoked automatically after policy enforcement; user confirmed no approval.',
  },
]

export const mockIncidents: Incident[] = [
  {
    id: 'INC-9008',
    name: 'Domain controller credential access campaign',
    status: 'INVESTIGATING',
    severity: 'CRITICAL',
    owner: 'Avery Chen',
    createdAt: '2026-07-01T08:20:00Z',
    updatedAt: '2026-07-01T08:39:00Z',
    summary: 'Multi-stage credential access activity observed across DC-01 and an engineering jump host.',
    timeline: [
      {
        id: 'evt-1',
        timestamp: '2026-07-01T08:14:00Z',
        title: 'Alert raised',
        detail: 'EDR flagged LSASS memory access from unsigned rundll32 child process.',
      },
      {
        id: 'evt-2',
        timestamp: '2026-07-01T08:18:00Z',
        title: 'Correlation complete',
        detail: 'Linked with SMB lateral movement and Kerberos ticket anomalies.',
      },
      {
        id: 'evt-3',
        timestamp: '2026-07-01T08:31:00Z',
        title: 'Containment proposed',
        detail: 'Recommended host isolation and forced credential rotation for Tier-0 admins.',
      },
    ],
    aiSuggestions: [
      'Isolate dc-01.mythos.local and eng-jump-03 from east-west traffic.',
      'Force password reset and ticket invalidation for accounts with logons in the last 4 hours.',
      'Pull memory capture and Prefetch artifacts before remediation to preserve evidence.',
    ],
  },
  {
    id: 'INC-9005',
    name: 'Cloud shadow app consent abuse',
    status: 'CONTAINED',
    severity: 'HIGH',
    owner: 'Mina Rao',
    createdAt: '2026-06-30T18:10:00Z',
    updatedAt: '2026-07-01T01:12:00Z',
    summary: 'Malicious OAuth application attempted mailbox read permissions using a compromised user session.',
    timeline: [
      {
        id: 'evt-4',
        timestamp: '2026-06-30T18:11:00Z',
        title: 'Consent granted',
        detail: 'Application requested Mail.Read and Files.Read.All scopes.',
      },
      {
        id: 'evt-5',
        timestamp: '2026-06-30T18:22:00Z',
        title: 'Session revoked',
        detail: 'Conditional access revoked active refresh tokens and blocked re-consent.',
      },
    ],
    aiSuggestions: [
      'Review mailbox access logs for the impacted identity over the last 72 hours.',
      'Purge application credentials and update tenant app consent policy.',
    ],
  },
  {
    id: 'INC-9002',
    name: 'Third-party dependency exposure in customer portal',
    status: 'RESOLVED',
    severity: 'MEDIUM',
    owner: 'Omar Diaz',
    createdAt: '2026-06-29T09:05:00Z',
    updatedAt: '2026-06-29T15:42:00Z',
    summary: 'Build pipeline identified exploitable vulnerable component before production deployment.',
    timeline: [
      {
        id: 'evt-6',
        timestamp: '2026-06-29T09:07:00Z',
        title: 'SCA finding created',
        detail: 'Dependency scanner identified vulnerable auth library in pull request branch.',
      },
      {
        id: 'evt-7',
        timestamp: '2026-06-29T13:20:00Z',
        title: 'Patch merged',
        detail: 'Library upgraded and deployment gate reopened after verification.',
      },
    ],
    aiSuggestions: [
      'Backport the fixed version to long-lived maintenance branches.',
    ],
  },
]

export const mockCVEs: CVE[] = [
  {
    id: 'CVE-2026-1881',
    severity: 'CRITICAL',
    description: 'Pre-auth remote code execution in exposed edge gateway due to unsafe request deserialization.',
    cvssScore: 9.8,
    affectedProducts: ['Mythos Edge Gateway < 4.8.2', 'Appliance firmware 2.7.x'],
    publishedDate: '2026-07-01T02:00:00Z',
  },
  {
    id: 'CVE-2026-1720',
    severity: 'HIGH',
    description: 'Improper permission enforcement allows authenticated lateral tenant access in orchestration API.',
    cvssScore: 8.1,
    affectedProducts: ['Kubernetes Operator 1.14', 'API Control Plane 3.1'],
    publishedDate: '2026-06-30T14:10:00Z',
  },
  {
    id: 'CVE-2026-1504',
    severity: 'MEDIUM',
    description: 'Path traversal in log export endpoint can expose archived audit bundles.',
    cvssScore: 6.4,
    affectedProducts: ['Observability Hub 6.2'],
    publishedDate: '2026-06-28T09:45:00Z',
  },
  {
    id: 'CVE-2026-1113',
    severity: 'LOW',
    description: 'Verbose error responses may reveal limited deployment metadata to authenticated users.',
    cvssScore: 3.9,
    affectedProducts: ['Portal UI 2.1', 'Shared API SDK 2.1'],
    publishedDate: '2026-06-24T16:30:00Z',
  },
]

export const alertTrendData = [
  { name: 'Mon', alerts: 24 },
  { name: 'Tue', alerts: 31 },
  { name: 'Wed', alerts: 28 },
  { name: 'Thu', alerts: 37 },
  { name: 'Fri', alerts: 42 },
  { name: 'Sat', alerts: 18 },
  { name: 'Sun', alerts: 26 },
]

export const severityDistribution = [
  { name: 'Critical', value: 7 },
  { name: 'High', value: 15 },
  { name: 'Medium', value: 22 },
  { name: 'Low', value: 11 },
  { name: 'Info', value: 8 },
]

export const dashboardMetrics: DashboardMetric[] = [
  { title: 'Total Alerts', value: '63', trend: '+12%', trendLabel: 'vs yesterday' },
  { title: 'Active Incidents', value: '08', trend: '-2', trendLabel: 'de-escalated today' },
  { title: 'CVEs Today', value: '14', trend: '+4', trendLabel: 'new disclosures' },
  { title: 'Threats Blocked', value: '1,284', trend: '+18%', trendLabel: 'prevented actions' },
]

export const mockThreatHuntResults: ThreatHuntResult[] = [
  {
    id: 'hunt-1',
    timestamp: '2026-07-01T07:58:00Z',
    host: 'fin-wks-22',
    technique: 'T1059',
    severity: 'HIGH',
    description: 'PowerShell launched with base64-encoded command and spawned net.exe.',
  },
  {
    id: 'hunt-2',
    timestamp: '2026-07-01T07:26:00Z',
    host: 'dc-01',
    technique: 'T1003',
    severity: 'CRITICAL',
    description: 'Unsigned binary accessed LSASS memory region shortly after service install.',
  },
  {
    id: 'hunt-3',
    timestamp: '2026-07-01T05:44:00Z',
    host: 'eng-jump-03',
    technique: 'T1055',
    severity: 'HIGH',
    description: 'Remote thread creation into trusted process from PsExec parent chain.',
  },
  {
    id: 'hunt-4',
    timestamp: '2026-06-30T22:10:00Z',
    host: 'sales-mbp-14',
    technique: 'T1105',
    severity: 'MEDIUM',
    description: 'Downloaded second-stage payload from newly registered infrastructure.',
  },
]

export const mockIOCResults: IOCResult[] = [
  {
    id: 'ioc-1',
    type: 'ip',
    value: '185.224.128.77',
    reputation: 'malicious',
    confidence: 94,
    source: 'Open Threat Feed',
    lastSeen: '2026-07-01T07:41:00Z',
    context: 'Associated with C2 infrastructure used in infostealer and proxy botnet campaigns.',
  },
  {
    id: 'ioc-2',
    type: 'domain',
    value: 'secure-microsoft-login[.]com',
    reputation: 'malicious',
    confidence: 91,
    source: 'Brand Protection',
    lastSeen: '2026-07-01T06:15:00Z',
    context: 'Credential phishing kit hosting Microsoft-themed lure pages for MFA harvesting.',
  },
  {
    id: 'ioc-3',
    type: 'hash',
    value: '9b1d3b1b0e9fa98053dbb07acb6ac4f4baf9f85a90cd6fb35d7bf2ba7be2bfe4',
    reputation: 'suspicious',
    confidence: 78,
    source: 'Sandbox Grid',
    lastSeen: '2026-06-30T19:05:00Z',
    context: 'Packed loader exhibiting delayed execution and anti-analysis checks.',
  },
  {
    id: 'ioc-4',
    type: 'url',
    value: 'https://cdn-dropper.example/payload.bin',
    reputation: 'malicious',
    confidence: 88,
    source: 'Proxy Logs',
    lastSeen: '2026-07-01T04:29:00Z',
    context: 'Payload URL reached by an endpoint later involved in credential theft telemetry.',
  },
]

export const mockMalwareReport: MalwareReport = {
  fileName: 'invoice_reconciliation_2026.xlsm',
  sha256: '4eeeb54a286f1adb3fc85fa474c27adf54c6aa70c796665f6ca06d943ffc6df1',
  yaraMatches: ['Suspicious_Macro_Dropper', 'LummaC2_Config_Extractor'],
  behaviors: [
    'Drops payload to %AppData%\\Roaming\\mscache\\svc.exe',
    'Creates scheduled task for persistence every 15 minutes',
    'Initiates TLS beacon to hard-coded IP over uncommon JA3 fingerprint',
  ],
  classification: 'Infostealer loader with macro-based initial access',
  confidence: 92,
  extractedIocs: ['185.224.128.77', 'secure-microsoft-login[.]com', 'svc.exe'],
  sandboxVerdict: 'Malicious',
}

export const mockVulnFindings: VulnFinding[] = [
  {
    id: 'vuln-1',
    target: 'api.mythos.internal',
    title: 'TLS certificate uses deprecated signature algorithm',
    severity: 'MEDIUM',
    cvssScore: 5.9,
    remediation: 'Reissue certificate with SHA-256 or stronger signature chain.',
    status: 'OPEN',
  },
  {
    id: 'vuln-2',
    target: '10.20.4.15',
    title: 'Unauthenticated Prometheus metrics endpoint exposed',
    severity: 'HIGH',
    cvssScore: 8.0,
    remediation: 'Restrict metrics endpoint with authentication and network ACLs.',
    status: 'IN_PROGRESS',
  },
  {
    id: 'vuln-3',
    target: 'portal.mythos.ai',
    title: 'Outdated OpenSSL package in base image',
    severity: 'CRITICAL',
    cvssScore: 9.1,
    remediation: 'Upgrade container image to patched OpenSSL build and redeploy.',
    status: 'OPEN',
  },
]

export const mockAttackPath: AttackPath = {
  nodes: [
    { id: 'user-1', label: 'Compromised User', type: 'user', risk: 3 },
    { id: 'asset-1', label: 'VPN Gateway', type: 'asset', risk: 4 },
    { id: 'asset-2', label: 'Finance Workstation', type: 'asset', risk: 5 },
    { id: 'process-1', label: 'PowerShell Loader', type: 'process', risk: 5 },
    { id: 'asset-3', label: 'Jump Host', type: 'asset', risk: 4 },
    { id: 'asset-4', label: 'Domain Controller', type: 'asset', risk: 5 },
  ],
  links: [
    { source: 'user-1', target: 'asset-1', vector: 'Stolen VPN Credentials' },
    { source: 'asset-1', target: 'asset-2', vector: 'Valid Account Access' },
    { source: 'asset-2', target: 'process-1', vector: 'Encoded PowerShell' },
    { source: 'process-1', target: 'asset-3', vector: 'PsExec Lateral Movement' },
    { source: 'asset-3', target: 'asset-4', vector: 'Credential Dumping' },
  ],
}

export const mockPipelines: PipelineSecurityStatus[] = [
  { name: 'frontend-release', branch: 'main', status: 'PASSING', lastRun: '2026-07-01T07:50:00Z' },
  { name: 'backend-security-scan', branch: 'main', status: 'WARNING', lastRun: '2026-07-01T07:12:00Z' },
  { name: 'container-hardening', branch: 'release/2026.07', status: 'FAILED', lastRun: '2026-07-01T06:48:00Z' },
]

export const mockDependencyRisks: DependencyRisk[] = [
  {
    packageName: 'jsonwebtoken',
    severity: 'HIGH',
    issue: 'Algorithm confusion weakness in older parser path.',
    fixVersion: '9.0.2',
  },
  {
    packageName: 'golang.org/x/crypto',
    severity: 'MEDIUM',
    issue: 'Outdated SSH packet validation can enable resource exhaustion.',
    fixVersion: '0.35.0',
  },
]

export const mockContainerScans: ContainerScanResult[] = [
  { image: 'registry/mythos-api:2026.07.01', critical: 1, high: 4, compliance: '85% CIS' },
  { image: 'registry/mythos-worker:2026.07.01', critical: 0, high: 2, compliance: '91% CIS' },
]

export const mockComplianceChecks: ComplianceCheck[] = [
  { framework: 'SOC 2', score: 92, status: 'PASSING' },
  { framework: 'NIST 800-53', score: 81, status: 'WARNING' },
  { framework: 'PCI DSS', score: 74, status: 'FAILED' },
]
