import { useQuery } from '@tanstack/react-query'
import { mockCVEs } from '../data/mockData'
import api from '../services/api'
import type { CVE, Severity } from '../types'

interface CVESearchFilters {
  query: string
  severity: '' | Exclude<Severity, 'INFO'>
}

async function searchCVEs(filters: CVESearchFilters): Promise<CVE[]> {
  try {
    const { data } = await api.get<CVE[]>('/cves/search', {
      params: { query: filters.query, severity: filters.severity || undefined },
    })
    return data
  } catch {
    return mockCVEs.filter((cve) => {
      const matchesQuery =
        !filters.query ||
        cve.id.toLowerCase().includes(filters.query.toLowerCase()) ||
        cve.description.toLowerCase().includes(filters.query.toLowerCase())
      const matchesSeverity = !filters.severity || cve.severity === filters.severity
      return matchesQuery && matchesSeverity
    })
  }
}

export function useCVESearch(query: string, severity: CVESearchFilters['severity']) {
  return useQuery({
    queryKey: ['cves', query, severity],
    queryFn: () => searchCVEs({ query, severity }),
  })
}
