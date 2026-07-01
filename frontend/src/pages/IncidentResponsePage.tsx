import { format } from 'date-fns'
import { AlertBadge } from '../components/AlertBadge'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { useIncidents } from '../hooks/useIncidents'

const statusStyles: Record<string, string> = {
  NEW: 'bg-blue-500/15 text-blue-300',
  INVESTIGATING: 'bg-amber-500/15 text-amber-300',
  CONTAINED: 'bg-emerald-500/15 text-emerald-300',
  RESOLVED: 'bg-slate-500/15 text-slate-300',
}

export default function IncidentResponsePage() {
  const { data, isLoading, error } = useIncidents()

  if (isLoading) {
    return <LoadingSpinner className="min-h-[40vh]" label="Loading incidents" />
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-cyber-text-primary">Incident Response</h2>
        <p className="mt-1 text-sm text-cyber-text-secondary">Track active incidents, response status, and AI-suggested next actions.</p>
      </div>

      {error ? (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          Incident API unavailable. Showing synchronized fallback incident queue.
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="space-y-4">
          {(data ?? []).map((incident) => (
            <article key={incident.id} className="rounded-2xl border border-cyber-border bg-cyber-card p-5 shadow-glow">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-cyber-text-secondary">{incident.id}</p>
                  <h3 className="mt-2 text-xl font-semibold text-cyber-text-primary">{incident.name}</h3>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <AlertBadge severity={incident.severity} />
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[incident.status]}`}>
                    {incident.status}
                  </span>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-cyber-text-secondary">{incident.summary}</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-cyber-border bg-cyber-background p-3">
                  <p className="text-xs uppercase tracking-wide text-cyber-text-secondary">Owner</p>
                  <p className="mt-1 text-sm text-cyber-text-primary">{incident.owner}</p>
                </div>
                <div className="rounded-xl border border-cyber-border bg-cyber-background p-3">
                  <p className="text-xs uppercase tracking-wide text-cyber-text-secondary">Updated</p>
                  <p className="mt-1 text-sm text-cyber-text-primary">{format(new Date(incident.updatedAt), 'PPP p')}</p>
                </div>
              </div>
            </article>
          ))}
        </section>

        <section className="space-y-6">
          {(data ?? []).map((incident) => (
            <div key={`${incident.id}-details`} className="rounded-2xl border border-cyber-border bg-cyber-card p-5">
              <h3 className="text-lg font-semibold text-cyber-text-primary">{incident.id} timeline</h3>
              <div className="mt-4 space-y-4">
                {incident.timeline.map((event) => (
                  <div key={event.id} className="relative pl-6">
                    <span className="absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full bg-cyan-400" />
                    <p className="text-xs uppercase tracking-wide text-cyan-300">{format(new Date(event.timestamp), 'MMM d, HH:mm')}</p>
                    <p className="mt-1 text-sm font-medium text-cyber-text-primary">{event.title}</p>
                    <p className="mt-1 text-sm text-cyber-text-secondary">{event.detail}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">AI-suggested response actions</p>
                <ul className="mt-3 space-y-2 text-sm text-emerald-100">
                  {incident.aiSuggestions.map((suggestion) => (
                    <li key={suggestion}>• {suggestion}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  )
}
