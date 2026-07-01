import { Search } from 'lucide-react'
import type { ReactNode } from 'react'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  filters?: ReactNode
}

export function SearchBar({ value, onChange, placeholder = 'Search...', filters }: SearchBarProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-cyber-border bg-cyber-card p-4 lg:flex-row lg:items-center lg:justify-between">
      <label className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cyber-text-secondary" />
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-cyber-border bg-cyber-background px-10 py-3 text-sm text-cyber-text-primary outline-none ring-0 placeholder:text-cyber-text-secondary focus:border-cyan-500"
        />
      </label>
      {filters ? <div className="flex flex-wrap items-center gap-3">{filters}</div> : null}
    </div>
  )
}
