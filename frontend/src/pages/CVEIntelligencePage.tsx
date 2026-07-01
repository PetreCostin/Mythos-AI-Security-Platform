import { useState } from 'react'
import { format } from 'date-fns'
import { SearchBar } from '../components/SearchBar'
import { AlertBadge } from '../components/AlertBadge'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { useCVESearch } from '../hooks/useCVESearch'
import type { Severity } from '../types'

const severityOptions: Array<'' | Exclude<Severity, 'INFO'>> = ['', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW']

export default function CVEIntelligencePage() {
  const [query, setQuery] = useState('')
  const [severity, setSeverity] = useState<'' | Exclude<Severity, 'INFO'>>('')
  const { data, isLoading, error } = useCVESearch(query, severity)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-cyber-text-primary">CVE Intelligence</h2>
        <p className="mt-1 text-sm text-cyber-text-secondary">Search disclosures, prioritize exposure, and review product impact.</p>
      </div>

      <SearchBar
        value={query}
        onChange={setQuery}
        placeholder="Search CVE IDs, products, or descriptions"
        filters={
          <select
            value={severity}
            onChange={(event) => setSeverity(event.target.value as typeof severity)}
            className="rounded-xl border border-cyber-border bg-cyber-background px-4 py-3 text-sm text-cyber-text-primary"
          >
            {severityOptions.map((option) => (
              <option key={option || 'ALL'} value={option}>
                {option || 'All severities'}
              </option>
            ))}
          </select>
        }
      />

      {error ? (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          Backend search unavailable. Showing curated vulnerability intelligence snapshot.
        </div>
      ) : null}

      {isLoading ? (
        <LoadingSpinner className="min-h-[40vh]" label="Searching CVE intelligence" />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {(data ?? []).map((cve) => (
            <article key={cve.id} className="rounded-2xl border border-cyber-border bg-cyber-card p-5 shadow-glow">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-cyber-text-secondary">{format(new Date(cve.publishedDate), 'PPP')}</p>
                  <h3 className="mt-1 text-xl font-semibold text-cyber-text-primary">{cve.id}</h3>
                </div>
                <div className="flex items-center gap-3">
                  <AlertBadge severity={cve.severity} />
                  <span className="rounded-full border border-cyber-border px-3 py-1 text-sm text-cyan-300">
                    CVSS {cve.cvssScore.toFixed(1)}
                  </span>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-cyber-text-secondary">{cve.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {cve.affectedProducts.map((product) => (
                  <span key={product} className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs text-cyan-200">
                    {product}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
