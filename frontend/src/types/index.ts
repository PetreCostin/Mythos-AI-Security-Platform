export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO'

export type AlertStatus = 'OPEN' | 'TRIAGED' | 'INVESTIGATING' | 'RESOLVED'

export interface Alert {
  id: string
  title: string
  severity: Severity
  source: string
  status: AlertStatus
  asset: string
  timestamp: string
  description: string
}

export type IncidentStatus = 'NEW' | 'INVESTIGATING' | 'CONTAINED' | 'RESOLVED'

export interface IncidentTimelineEvent {
  id: string
  timestamp: string
  title: string
  detail: string
}

export interface Incident {
  id: string
  name: string
  status: IncidentStatus
  severity: Severity
  owner: string
  createdAt: string
  updatedAt: string
  summary: string
  timeline: IncidentTimelineEvent[]
  aiSuggestions: string[]
}

export interface CVE {
  id: string
  severity: Exclude<Severity, 'INFO'>
  description: string
  cvssScore: number
  affectedProducts: string[]
  publishedDate: string
}

export type IOCType = 'ip' | 'domain' | 'hash' | 'url'

export interface IOCResult {
  id: string
  type: IOCType
  value: string
  reputation: 'malicious' | 'suspicious' | 'benign'
  confidence: number
  source: string
  lastSeen: string
  context: string
}

export interface ThreatHuntResult {
  id: string
  timestamp: string
  host: string
  technique: string
  severity: Severity
  description: string
}

export interface MalwareReport {
  fileName: string
  sha256: string
  yaraMatches: string[]
  behaviors: string[]
  classification: string
  confidence: number
  extractedIocs: string[]
  sandboxVerdict: string
}

export interface VulnFinding {
  id: string
  target: string
  title: string
  severity: Severity
  cvssScore: number
  remediation: string
  status: 'OPEN' | 'IN_PROGRESS' | 'FIXED'
}

export interface AttackPathNode {
  id: string
  label: string
  type: 'asset' | 'user' | 'process'
  risk: number
}

export interface AttackPathLink {
  source: string
  target: string
  vector: string
}

export interface AttackPath {
  nodes: AttackPathNode[]
  links: AttackPathLink[]
}

export interface PipelineSecurityStatus {
  name: string
  branch: string
  status: 'PASSING' | 'WARNING' | 'FAILED'
  lastRun: string
}

export interface DependencyRisk {
  packageName: string
  severity: Severity
  issue: string
  fixVersion: string
}

export interface ContainerScanResult {
  image: string
  critical: number
  high: number
  compliance: string
}

export interface ComplianceCheck {
  framework: string
  score: number
  status: 'PASSING' | 'WARNING' | 'FAILED'
}

export interface DashboardMetric {
  title: string
  value: string
  trend: string
  trendLabel: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  createdAt: string
}

export interface AppUser {
  name: string
  role: string
  avatar: string
}
