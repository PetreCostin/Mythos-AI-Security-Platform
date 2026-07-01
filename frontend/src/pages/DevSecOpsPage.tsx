import { format } from 'date-fns'
import { AlertBadge } from '../components/AlertBadge'
import { mockComplianceChecks, mockContainerScans, mockDependencyRisks, mockPipelines } from '../data/mockData'
import type { Severity } from '../types'

const pipelineStyles: Record<string, string> = {
  PASSING: 'text-emerald-300 bg-emerald-500/10',
  WARNING: 'text-amber-300 bg-amber-500/10',
  FAILED: 'text-red-300 bg-red-500/10',
}

const containerSeverity = (critical: number, high: number): Severity => {
  if (critical > 0) {
    return 'CRITICAL'
  }
  if (high > 2) {
    return 'HIGH'
  }
  return 'LOW'
}

export default function DevSecOpsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-cyber-text-primary">DevSecOps</h2>
        <p className="mt-1 text-sm text-cyber-text-secondary">Monitor pipeline security posture across SAST, DAST, dependencies, containers, and compliance.</p>
      </div>

      <section className="grid gap-4 lg:grid-cols-3">
        {mockPipelines.map((pipeline) => (
          <article key={pipeline.name} className="rounded-2xl border border-cyber-border bg-cyber-card p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-cyber-text-secondary">{pipeline.branch}</p>
                <h3 className="mt-1 text-lg font-semibold text-cyber-text-primary">{pipeline.name}</h3>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${pipelineStyles[pipeline.status]}`}>
                {pipeline.status}
              </span>
            </div>
            <p className="mt-4 text-sm text-cyber-text-secondary">Last run {format(new Date(pipeline.lastRun), 'PPP p')}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-cyber-border bg-cyber-card p-5">
          <h3 className="text-lg font-semibold text-cyber-text-primary">Dependency vulnerabilities</h3>
          <div className="mt-4 space-y-4">
            {mockDependencyRisks.map((risk) => (
              <div key={risk.packageName} className="rounded-2xl border border-cyber-border bg-cyber-background p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-lg font-semibold text-cyber-text-primary">{risk.packageName}</p>
                  <AlertBadge severity={risk.severity} />
                </div>
                <p className="mt-3 text-sm text-cyber-text-secondary">{risk.issue}</p>
                <p className="mt-3 text-sm text-emerald-300">Fix version: {risk.fixVersion}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-cyber-border bg-cyber-card p-5">
          <h3 className="text-lg font-semibold text-cyber-text-primary">Container image scans</h3>
          <div className="mt-4 space-y-4">
            {mockContainerScans.map((scan) => (
              <div key={scan.image} className="rounded-2xl border border-cyber-border bg-cyber-background p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-cyber-text-primary">{scan.image}</p>
                  <AlertBadge severity={containerSeverity(scan.critical, scan.high)} />
                </div>
                <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-cyber-text-secondary">Critical</p>
                    <p className="mt-1 text-red-300">{scan.critical}</p>
                  </div>
                  <div>
                    <p className="text-cyber-text-secondary">High</p>
                    <p className="mt-1 text-amber-300">{scan.high}</p>
                  </div>
                  <div>
                    <p className="text-cyber-text-secondary">Compliance</p>
                    <p className="mt-1 text-cyan-300">{scan.compliance}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-cyber-border bg-cyber-card p-5">
        <h3 className="text-lg font-semibold text-cyber-text-primary">Compliance status</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {mockComplianceChecks.map((check) => (
            <div key={check.framework} className="rounded-2xl border border-cyber-border bg-cyber-background p-4">
              <p className="text-sm text-cyber-text-secondary">{check.framework}</p>
              <p className="mt-2 text-3xl font-semibold text-cyber-text-primary">{check.score}%</p>
              <span className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${pipelineStyles[check.status]}`}>
                {check.status}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
