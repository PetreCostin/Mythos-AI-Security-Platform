import { useQuery } from '@tanstack/react-query'
import { mockIncidents } from '../data/mockData'
import api from '../services/api'
import { useAppStore } from '../store/useAppStore'
import type { Incident } from '../types'

async function fetchIncidents(): Promise<Incident[]> {
  try {
    const { data } = await api.get<Incident[]>('/incidents')
    return data
  } catch {
    return mockIncidents
  }
}

export function useIncidents() {
  const setIncidents = useAppStore((state) => state.setIncidents)

  return useQuery({
    queryKey: ['incidents'],
    queryFn: async () => {
      const incidents = await fetchIncidents()
      setIncidents(incidents)
      return incidents
    },
  })
}
