import { Activity, ShieldAlert, ShieldCheck, Siren } from 'lucide-react'
import {
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { MetricCard } from '../components/MetricCard'
import { DataTable, type ColumnDefinition } from '../components/DataTable'
import { AlertBadge } from '../components/AlertBadge'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { alertTrendData, dashboardMetrics, severityDistribution } from '../data/mockData'
import { useAlerts } from '../hooks/useAlerts'
import { useIncidents } from '../hooks/useIncidents'
import type { Alert } from '../types'
import { format } from 'date-fns'

const metricIcons = [ShieldAlert, Siren, Activity, ShieldCheck]
const chartColors = ['#ef4444', '#f97316', '#f59e0b', '#3b82f6', '#6b7280']

export default function Dashboard() {
  const alertsQuery = useAlerts()
  const incidentsQuery = useIncidents()

  const recentAlertColumns: ColumnDefinition<Alert>[] = [
    { key: 'id', label: 'Alert ID', sortable: true },
    { key: 'title', label: 'Title', sortable: true },
    {
      key: 'severity',
      label: 'Severity',
      sortable: true,
      render: (row) => <AlertBadge severity={row.severity} />,
    },
    { key: 'asset', label: 'Asset', sortable: true },
    {
      key: 'timestamp',
      label: 'Observed',
      sortable: true,
      render: (row) => format(new Date(row.timestamp), 'MMM d, HH:mm'),
    },
  ]

  if (alertsQuery.isLoading || incidentsQuery.isLoading) {
    return <LoadingSpinner className="min-h-[40vh]" label="Loading SOC overview" />
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dashboardMetrics.map((metric, index) => {
          const Icon = metricIcons[index] ?? ShieldAlert
          return <MetricCard key={metric.title} {...metric} icon={Icon} />
        })}
      </section>

      {(alertsQuery.error || incidentsQuery.error) ? (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          API unavailable. Showing resilient fallback telemetry.
        </div>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="rounded-2xl border border-cyber-border bg-cyber-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-cyber-text-primary">Alerts over time</h2>
              <p className="text-sm text-cyber-text-secondary">Seven-day operational alert volume</p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer>
              <LineChart data={alertTrendData}>
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#1f2937' }} />
                <Line type="monotone" dataKey="alerts" stroke="#06b6d4" strokeWidth={3} dot={{ fill: '#10b981' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-cyber-border bg-cyber-card p-5">
          <h2 className="text-lg font-semibold text-cyber-text-primary">Severity distribution</h2>
          <p className="mb-4 text-sm text-cyber-text-secondary">Current queue by severity</p>
          <div className="h-72">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={severityDistribution} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={4}>
                  {severityDistribution.map((entry, index) => (
                    <Cell key={entry.name} fill={chartColors[index]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#1f2937' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-cyber-text-primary">Recent alerts</h2>
              <p className="text-sm text-cyber-text-secondary">Prioritized triage feed</p>
            </div>
          </div>
          <DataTable
            columns={recentAlertColumns}
            data={alertsQuery.data ?? []}
            rowKey={(row) => row.id}
            emptyMessage="No alerts in the current time window."
          />
        </div>

        <div className="rounded-2xl border border-cyber-border bg-cyber-card p-5">
          <h2 className="text-lg font-semibold text-cyber-text-primary">Incident pulse</h2>
          <div className="mt-4 space-y-4">
            {(incidentsQuery.data ?? []).map((incident) => (
              <div key={incident.id} className="rounded-2xl border border-cyber-border bg-cyber-background p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-cyber-text-primary">{incident.name}</p>
                    <p className="mt-1 text-xs text-cyber-text-secondary">
                      {incident.id} · {incident.owner}
                    </p>
                  </div>
                  <AlertBadge severity={incident.severity} />
                </div>
                <p className="mt-3 text-sm text-cyber-text-secondary">{incident.summary}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
