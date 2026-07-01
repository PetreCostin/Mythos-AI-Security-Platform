import * as Tabs from '@radix-ui/react-tabs'
import { useMemo, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { SearchBar } from '../components/SearchBar'
import { AlertBadge } from '../components/AlertBadge'
import { mockIOCResults } from '../data/mockData'
import type { IOCType, Severity } from '../types'

const tabValues: IOCType[] = ['ip', 'domain', 'hash', 'url']
const reputationSeverity: Record<string, Severity> = {
  malicious: 'CRITICAL',
  suspicious: 'MEDIUM',
  benign: 'LOW',
}

export default function IOCSearchPage() {
  const [activeTab, setActiveTab] = useState<IOCType>('ip')
  const [query, setQuery] = useState('')

  const filteredResults = useMemo(
    () =>
      mockIOCResults.filter(
        (result) =>
          result.type === activeTab &&
          (!query || result.value.toLowerCase().includes(query.toLowerCase()) || result.context.toLowerCase().includes(query.toLowerCase())),
      ),
    [activeTab, query],
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-cyber-text-primary">IOC Search</h2>
        <p className="mt-1 text-sm text-cyber-text-secondary">Query IPs, domains, hashes, and URLs with threat intelligence context.</p>
      </div>

      <SearchBar value={query} onChange={setQuery} placeholder="Search indicators or related context" />

      <Tabs.Root value={activeTab} onValueChange={(value) => setActiveTab(value as IOCType)}>
        <Tabs.List className="inline-flex rounded-2xl border border-cyber-border bg-cyber-card p-1">
          {tabValues.map((tab) => (
            <Tabs.Trigger
              key={tab}
              value={tab}
              className="rounded-xl px-4 py-2 text-sm font-medium uppercase tracking-wide text-cyber-text-secondary data-[state=active]:bg-cyan-500 data-[state=active]:text-slate-950"
            >
              {tab}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        {tabValues.map((tab) => (
          <Tabs.Content key={tab} value={tab} className="mt-4 outline-none">
            <div className="grid gap-4 lg:grid-cols-2">
              {filteredResults.map((result) => (
                <article key={result.id} className="rounded-2xl border border-cyber-border bg-cyber-card p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-cyber-text-secondary">{result.type}</p>
                      <h3 className="mt-2 break-all text-lg font-semibold text-cyber-text-primary">{result.value}</h3>
                    </div>
                    <AlertBadge severity={reputationSeverity[result.reputation]} />
                  </div>
                  <p className="mt-4 text-sm leading-6 text-cyber-text-secondary">{result.context}</p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-cyber-text-secondary">Confidence</p>
                      <p className="mt-1 text-sm text-cyan-300">{result.confidence}%</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-cyber-text-secondary">Source</p>
                      <p className="mt-1 text-sm text-cyber-text-primary">{result.source}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-cyber-text-secondary">Last seen</p>
                      <p className="mt-1 text-sm text-cyber-text-primary">
                        {formatDistanceToNow(new Date(result.lastSeen), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </Tabs.Content>
        ))}
      </Tabs.Root>
    </div>
  )
}
