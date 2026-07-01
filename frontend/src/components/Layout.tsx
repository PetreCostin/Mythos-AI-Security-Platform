import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { Bell, ChevronDown } from 'lucide-react'
import { Outlet } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { Sidebar } from './Sidebar'
import { useAppStore } from '../store/useAppStore'

export function Layout() {
  const [collapsed, setCollapsed] = useState(false)
  const user = useAppStore((state) => state.user)
  const alerts = useAppStore((state) => state.alerts)

  const openAlerts = useMemo(() => alerts.filter((alert) => alert.status !== 'RESOLVED').slice(0, 4), [alerts])

  return (
    <div className="flex min-h-screen bg-cyber-background text-cyber-text-primary">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((current) => !current)} />
      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-cyber-border bg-cyber-background/90 px-4 py-4 backdrop-blur lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">Cyber Defense Console</p>
              <h1 className="mt-1 text-2xl font-semibold">Mythos AI Security Platform</h1>
            </div>

            <div className="flex items-center gap-3">
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button
                    type="button"
                    className="relative rounded-xl border border-cyber-border bg-cyber-card p-3 text-cyber-text-secondary transition hover:text-cyan-300"
                  >
                    <Bell className="h-5 w-5" />
                    <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-cyan-400" />
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    align="end"
                    sideOffset={10}
                    className="w-80 rounded-2xl border border-cyber-border bg-[#0d1323] p-2 shadow-2xl"
                  >
                    <div className="border-b border-cyber-border px-3 py-2 text-sm font-medium text-cyber-text-primary">
                      Priority notifications
                    </div>
                    {openAlerts.map((alert) => (
                      <DropdownMenu.Item
                        key={alert.id}
                        className="cursor-pointer rounded-xl px-3 py-3 outline-none transition hover:bg-white/5"
                      >
                        <div>
                          <p className="text-sm font-medium text-cyber-text-primary">{alert.title}</p>
                          <p className="mt-1 text-xs text-cyber-text-secondary">
                            {alert.asset} · {alert.severity}
                          </p>
                        </div>
                      </DropdownMenu.Item>
                    ))}
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>

              <div className="flex items-center gap-3 rounded-2xl border border-cyber-border bg-cyber-card px-4 py-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/15 font-semibold text-emerald-300">
                  {user.avatar}
                </div>
                <div className="hidden text-left sm:block">
                  <p className="text-sm font-medium text-cyber-text-primary">{user.name}</p>
                  <p className="text-xs text-cyber-text-secondary">{user.role}</p>
                </div>
                <ChevronDown className="h-4 w-4 text-cyber-text-secondary" />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
