import { create } from 'zustand'
import { mockAlerts, mockIncidents, mockUser } from '../data/mockData'
import type { Alert, AppUser, Incident } from '../types'

interface AppState {
  alerts: Alert[]
  incidents: Incident[]
  user: AppUser
  setAlerts: (alerts: Alert[]) => void
  setIncidents: (incidents: Incident[]) => void
  setUser: (user: AppUser) => void
}

export const useAppStore = create<AppState>((set) => ({
  alerts: mockAlerts,
  incidents: mockIncidents,
  user: mockUser,
  setAlerts: (alerts) => set({ alerts }),
  setIncidents: (incidents) => set({ incidents }),
  setUser: (user) => set({ user }),
}))
