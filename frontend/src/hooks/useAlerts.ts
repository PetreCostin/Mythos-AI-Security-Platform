import { useQuery } from '@tanstack/react-query'
import { mockAlerts } from '../data/mockData'
import api from '../services/api'
import { useAppStore } from '../store/useAppStore'
import type { Alert } from '../types'

async function fetchAlerts(): Promise<Alert[]> {
  try {
    const { data } = await api.get<Alert[]>('/alerts')
    return data
  } catch {
    return mockAlerts
  }
}

export function useAlerts() {
  const setAlerts = useAppStore((state) => state.setAlerts)

  return useQuery({
    queryKey: ['alerts'],
    queryFn: async () => {
      const alerts = await fetchAlerts()
      setAlerts(alerts)
      return alerts
    },
  })
}
