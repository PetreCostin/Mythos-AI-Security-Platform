import ForceGraph2D from 'react-force-graph-2d'
import { useEffect, useState } from 'react'
import { mockAttackPath } from '../data/mockData'
import type { AttackPathLink, AttackPathNode } from '../types'

const nodeColors: Record<AttackPathNode['type'], string> = {
  asset: '#06b6d4',
  user: '#10b981',
  process: '#ef4444',
}

export default function AttackPathPage() {
  const [width, setWidth] = useState(900)

  useEffect(() => {
    const updateWidth = () => {
      const nextWidth = window.innerWidth >= 1280 ? window.innerWidth - 440 : window.innerWidth - 64
      setWidth(Math.max(320, nextWidth))
    }

    updateWidth()
    window.addEventListener('resize', updateWidth)
    return () => window.removeEventListener('resize', updateWidth)
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-cyber-text-primary">Attack Path Visualization</h2>
        <p className="mt-1 text-sm text-cyber-text-secondary">Map attacker movement across identities, assets, and malicious process execution.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_300px]">
        <div className="rounded-2xl border border-cyber-border bg-cyber-card p-4">
          <div className="h-[620px] overflow-hidden rounded-2xl border border-cyber-border bg-cyber-background">
            <ForceGraph2D<AttackPathNode, AttackPathLink>
              graphData={mockAttackPath}
              width={width}
              height={620}
              backgroundColor="#0a0e1a"
              nodeLabel={(node) => `${node.label} · Risk ${node.risk}/5`}
              linkLabel={(link) => link.vector}
              linkDirectionalParticles={2}
              linkDirectionalParticleColor={() => '#10b981'}
              linkDirectionalParticleWidth={2}
              nodeCanvasObject={(node, context, globalScale) => {
                const label = node.label
                const fontSize = 14 / globalScale
                context.font = `${fontSize}px Inter, sans-serif`
                context.fillStyle = nodeColors[node.type]
                context.beginPath()
                context.arc(node.x ?? 0, node.y ?? 0, 8, 0, 2 * Math.PI, false)
                context.fill()
                context.fillStyle = '#f9fafb'
                context.fillText(label, (node.x ?? 0) + 12, (node.y ?? 0) + 4)
              }}
              nodePointerAreaPaint={(node, color, context) => {
                context.fillStyle = color
                context.beginPath()
                context.arc(node.x ?? 0, node.y ?? 0, 10, 0, 2 * Math.PI, false)
                context.fill()
              }}
            />
          </div>
        </div>

        <aside className="space-y-4 rounded-2xl border border-cyber-border bg-cyber-card p-5">
          <h3 className="text-lg font-semibold text-cyber-text-primary">Path narrative</h3>
          <ol className="space-y-3 text-sm text-cyber-text-secondary">
            <li>1. Initial access through compromised VPN credentials.</li>
            <li>2. Valid account usage on finance workstation establishes foothold.</li>
            <li>3. Encoded PowerShell launches staged loader with process injection.</li>
            <li>4. PsExec-style lateral movement reaches privileged jump host.</li>
            <li>5. Credential dumping on the domain controller enables full compromise.</li>
          </ol>
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-red-300">Recommended choke points</p>
            <ul className="mt-3 space-y-2 text-sm text-red-100">
              <li>• Require phishing-resistant MFA on VPN.</li>
              <li>• Block unsigned PowerShell and JEA-bypass scripts.</li>
              <li>• Restrict admin share access from workstations.</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  )
}
