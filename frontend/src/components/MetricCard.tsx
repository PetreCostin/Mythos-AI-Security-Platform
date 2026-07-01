import type { LucideIcon } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string
  trend: string
  trendLabel: string
  icon: LucideIcon
}

export function MetricCard({ title, value, trend, trendLabel, icon: Icon }: MetricCardProps) {
  const positive = trend.startsWith('+') || !trend.startsWith('-')

  return (
    <div className="rounded-2xl border border-cyber-border bg-cyber-card p-5 shadow-glow">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-cyber-text-secondary">{title}</p>
          <p className="mt-3 text-3xl font-semibold text-cyber-text-primary">{value}</p>
        </div>
        <div className="rounded-xl bg-cyan-500/10 p-3 text-cyan-400">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2 text-sm">
        <span className={positive ? 'text-emerald-400' : 'text-red-400'}>{trend}</span>
        <span className="text-cyber-text-secondary">{trendLabel}</span>
      </div>
    </div>
  )
}
