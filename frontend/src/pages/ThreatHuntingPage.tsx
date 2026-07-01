import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { ChevronDown } from 'lucide-react'
import { SearchBar } from '../components/SearchBar'
import { DataTable, type ColumnDefinition } from '../components/DataTable'
import { AlertBadge } from '../components/AlertBadge'
import { mockThreatHuntResults } from '../data/mockData'
import type { ThreatHuntResult } from '../types'
import { useMemo, useState } from 'react'
import { format } from 'date-fns'

const techniques = ['All Techniques', 'T1055', 'T1059', 'T1003', 'T1105', 'T1078', 'T1021']

export default function ThreatHuntingPage() {
  const [query, setQuery] = useState('')
  const [technique, setTechnique] = useState('All Techniques')

  const results = useMemo(
    () =>
      mockThreatHuntResults.filter((result) => {
        const matchesTechnique = technique === 'All Techniques' || result.technique === technique
        const term = query.toLowerCase()
        const matchesQuery =
          !term ||
          result.host.toLowerCase().includes(term) ||
          result.description.toLowerCase().includes(term) ||
          result.technique.toLowerCase().includes(term)
        return matchesTechnique && matchesQuery
      }),
    [query, technique],
  )

  const columns: ColumnDefinition<ThreatHuntResult>[] = [
    {
      key: 'timestamp',
      label: 'Timestamp',
      sortable: true,
      render: (row) => format(new Date(row.timestamp), 'MMM d, HH:mm:ss'),
    },
    { key: 'host', label: 'Host', sortable: true },
    { key: 'technique', label: 'Technique', sortable: true },
    {
      key: 'severity',
      label: 'Severity',
      sortable: true,
      render: (row) => <AlertBadge severity={row.severity} />,
    },
    { key: 'description', label: 'Description' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-cyber-text-primary">Threat Hunting</h2>
        <p className="mt-1 text-sm text-cyber-text-secondary">Pivot across telemetry using MITRE ATT&CK techniques and free-text filters.</p>
      </div>

      <SearchBar
        value={query}
        onChange={setQuery}
        placeholder="Search hosts, tactics, or behavior notes"
        filters={
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-xl border border-cyber-border bg-cyber-background px-4 py-3 text-sm text-cyber-text-primary"
              >
                {technique}
                <ChevronDown className="h-4 w-4 text-cyber-text-secondary" />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                sideOffset={8}
                className="min-w-48 rounded-2xl border border-cyber-border bg-[#0d1323] p-2 shadow-2xl"
              >
                {techniques.map((item) => (
                  <DropdownMenu.Item
                    key={item}
                    onSelect={() => setTechnique(item)}
                    className="cursor-pointer rounded-xl px-3 py-2 text-sm text-cyber-text-primary outline-none hover:bg-white/5"
                  >
                    {item}
                  </DropdownMenu.Item>
                ))}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-cyber-border bg-cyber-card p-4">
          <p className="text-sm text-cyber-text-secondary">Hits returned</p>
          <p className="mt-2 text-3xl font-semibold text-cyber-text-primary">{results.length}</p>
        </div>
        <div className="rounded-2xl border border-cyber-border bg-cyber-card p-4">
          <p className="text-sm text-cyber-text-secondary">Technique focus</p>
          <p className="mt-2 text-3xl font-semibold text-cyan-300">{technique === 'All Techniques' ? 'Multi' : technique}</p>
        </div>
        <div className="rounded-2xl border border-cyber-border bg-cyber-card p-4">
          <p className="text-sm text-cyber-text-secondary">Highest severity</p>
          <p className="mt-2 text-3xl font-semibold text-red-400">{results.some((item) => item.severity === 'CRITICAL') ? 'CRITICAL' : 'HIGH'}</p>
        </div>
      </div>

      <DataTable columns={columns} data={results} rowKey={(row) => row.id} emptyMessage="No threat hunting matches for the current filters." />
    </div>
  )
}
