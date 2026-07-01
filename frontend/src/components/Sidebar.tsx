import { NavLink } from 'react-router-dom'
import {
  Bot,
  ChartColumnStacked,
  GitBranch,
  LayoutDashboard,
  Menu,
  Radar,
  ShieldAlert,
  ShieldCheck,
  Skull,
  Target,
  Waypoints,
  Wifi,
} from 'lucide-react'
import { cn } from '../lib/utils'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/ai-chat', label: 'AI Chat', icon: Bot },
  { to: '/threat-hunting', label: 'Threat Hunting', icon: Radar },
  { to: '/cve-intelligence', label: 'CVE Intelligence', icon: ShieldAlert },
  { to: '/ioc-search', label: 'IOC Search', icon: Wifi },
  { to: '/incident-response', label: 'Incident Response', icon: ShieldCheck },
  { to: '/malware-analysis', label: 'Malware Analysis', icon: Skull },
  { to: '/vulnerability-scanner', label: 'Vuln Scanner', icon: Target },
  { to: '/attack-path', label: 'Attack Path', icon: Waypoints },
  { to: '/devsecops', label: 'DevSecOps', icon: GitBranch },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  return (
    <aside
      className={cn(
        'flex h-screen flex-col border-r border-cyber-border bg-[#0d1323] px-3 py-4 transition-all duration-200',
        collapsed ? 'w-20' : 'w-72',
      )}
    >
      <div className="mb-6 flex items-center justify-between gap-3 px-2">
        <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
          <div className="rounded-xl bg-cyan-500/10 p-2 text-cyan-400">
            <ChartColumnStacked className="h-5 w-5" />
          </div>
          {!collapsed ? (
            <div>
              <p className="font-semibold text-cyber-text-primary">Mythos AI</p>
              <p className="text-xs text-cyber-text-secondary">Security Platform</p>
            </div>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onToggle}
          className="rounded-lg border border-cyber-border p-2 text-cyber-text-secondary hover:text-cyan-300"
        >
          <Menu className="h-4 w-4" />
        </button>
      </div>

      <nav className="space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors',
                isActive
                  ? 'bg-cyan-500/15 text-cyan-300'
                  : 'text-cyber-text-secondary hover:bg-white/5 hover:text-cyber-text-primary',
                collapsed && 'justify-center px-2',
              )
            }
          >
            <Icon className="h-5 w-5 shrink-0" />
            {!collapsed ? <span>{label}</span> : null}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto rounded-2xl border border-cyber-border bg-cyber-card p-4">
        <p className="text-xs uppercase tracking-[0.2em] text-cyber-text-secondary">Coverage</p>
        <p className="mt-2 text-2xl font-semibold text-cyber-text-primary">99.3%</p>
        {!collapsed ? <p className="mt-1 text-sm text-emerald-400">All sensors reporting healthy</p> : null}
      </div>
    </aside>
  )
}
