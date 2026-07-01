import type { Severity } from '../types'
import { cn } from '../lib/utils'

const severityStyles: Record<Severity, string> = {
  CRITICAL: 'bg-red-500/15 text-red-400 ring-red-500/30',
  HIGH: 'bg-orange-500/15 text-orange-300 ring-orange-500/30',
  MEDIUM: 'bg-amber-500/15 text-amber-300 ring-amber-500/30',
  LOW: 'bg-blue-500/15 text-blue-300 ring-blue-500/30',
  INFO: 'bg-slate-500/15 text-slate-300 ring-slate-500/30',
}

interface AlertBadgeProps {
  severity: Severity
  className?: string
}

export function AlertBadge({ severity, className }: AlertBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ring-1 ring-inset',
        severityStyles[severity],
        className,
      )}
    >
      {severity}
    </span>
  )
}
