import { useCortexStore } from '../core/store/cortexStore'
import { motion } from 'framer-motion'
import { PIRAS_PIPELINE_STAGES, DEFAULT_ENERGY_STATE } from '../core/schema/pirasSchema'
import { VAJRA_COGNITION_FLOW, QUERY_ROUTES } from '../core/schema/vajraSchema'

export function InspectionPanel() {
  const selectedCortex = useCortexStore((s) => s.selectedCortex)
  const cortexes = useCortexStore((s) => s.cortexes)
  const mode = useCortexStore((s) => s.mode)
  const selected = cortexes.find((c) => c.id === selectedCortex)

  if (mode === 'piras-runtime') return <PirasPanel />
  if (mode === 'vajra-executive') return <VajraPanel />
  if (mode === 'process-intelligence') return <ProcessPanel />
  if (mode === 'client-context') return <ClientPanel />

  if (!selected && mode === 'cortex-topology') {
    return (
      <div className="p-4 h-full overflow-y-auto">
        <div className="holo-panel p-4">
          <div className="text-sm text-white/60 tracking-wider mb-3">SYSTEM OVERVIEW</div>
          <div className="space-y-3">
            {cortexes.map((c) => (
              <div key={c.id} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color, opacity: c.status === 'planned' ? 0.5 : 1 }} />
                <span className="text-sm text-white/80">{c.name}</span>
                <span className="text-xs text-white/50 ml-auto uppercase">{c.status}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-white/10">
            <div className="text-sm text-white/60 mb-2">CONNECTIONS</div>
            <div className="text-sm text-white/70">
              {cortexes.reduce((acc, c) => acc + c.connections.length, 0)} active pathways
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!selected) return null

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="p-4 h-full overflow-y-auto">
      <div className="holo-panel p-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: selected.color }} />
          <div>
            <div className="text-base" style={{ color: selected.color }}>{selected.name}</div>
            <div className="text-sm text-white/60">{selected.role}</div>
          </div>
        </div>
        <div className="mb-4">
          <div className="text-sm text-white/60 tracking-wider mb-2">MODULES ({selected.modules.length})</div>
          <div className="space-y-1">
            {selected.modules.map((mod, i) => (
              <div key={i} className="flex items-center gap-2 py-1">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: selected.color, opacity: 0.7 }} />
                <span className="text-sm text-white/80">{mod}</span>
              </div>
            ))}
          </div>
        </div>
        {selected.connections.length > 0 && (
          <div>
            <div className="text-sm text-white/60 tracking-wider mb-2">CONNECTIONS</div>
            {selected.connections.map((conn, i) => (
              <div key={i} className="flex items-center justify-between py-1">
                <span className="text-sm text-white/70">→ {conn.target}</span>
                <span className="text-xs text-white/50">{conn.type}</span>
                <div className="w-12 h-1.5 bg-white/10 rounded overflow-hidden">
                  <div className="h-full rounded" style={{ width: `${conn.strength * 100}%`, backgroundColor: selected.color }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

function PirasPanel() {
  const energy = DEFAULT_ENERGY_STATE
  return (
    <div className="p-4 h-full overflow-y-auto">
      <div className="holo-panel p-4 mb-3">
        <div className="text-sm text-white/60 tracking-wider mb-3">PIPELINE STAGES</div>
        <div className="space-y-2">
          {PIRAS_PIPELINE_STAGES.map((stage) => (
            <div key={stage.id} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stage.color }} />
              <span className="text-sm text-white/80 flex-1">{stage.name}</span>
              <span className="text-xs text-white/50">{stage.latencyMs[0]}-{stage.latencyMs[1]}ms</span>
            </div>
          ))}
        </div>
      </div>
      <div className="holo-panel p-4">
        <div className="text-sm text-white/60 tracking-wider mb-3">ENERGY REASONING</div>
        <div className="space-y-2">
          {energy.forces.map((f) => (
            <div key={f.name}>
              <div className="flex justify-between text-sm mb-1">
                <span style={{ color: f.color }}>{f.name}</span>
                <span className="text-white/60">{(f.weight * 100).toFixed(0)}% · {f.value.toFixed(2)}</span>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded overflow-hidden">
                <div className="h-full rounded" style={{ width: `${f.value * 100}%`, backgroundColor: f.color }} />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-2 border-t border-white/10 flex justify-between text-sm">
          <span className="text-white/50">Lyapunov</span>
          <span className={energy.lyapunovStable ? 'text-green-400' : 'text-red-400'}>
            {energy.lyapunovStable ? '✓ STABLE' : '✗ UNSTABLE'}
          </span>
        </div>
        <div className="flex justify-between text-sm mt-1">
          <span className="text-white/50">Convergence</span>
          <span className="text-cyan-400">{(energy.convergenceRate * 100).toFixed(0)}%</span>
        </div>
      </div>
    </div>
  )
}

function VajraPanel() {
  return (
    <div className="p-4 h-full overflow-y-auto">
      <div className="holo-panel p-4 mb-3">
        <div className="text-sm text-white/60 tracking-wider mb-3">COGNITION FLOW</div>
        <div className="space-y-2">
          {VAJRA_COGNITION_FLOW.map((stage) => (
            <div key={stage.id} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stage.color }} />
              <span className="text-sm text-white/80">{stage.name}</span>
              <span className="text-xs text-white/40 ml-auto">{stage.type}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="holo-panel p-4">
        <div className="text-sm text-white/60 tracking-wider mb-3">QUERY ROUTING</div>
        <div className="space-y-2">
          {QUERY_ROUTES.map((route) => (
            <div key={route.type} className="flex items-center justify-between">
              <span className="text-sm" style={{ color: route.color }}>{route.type}</span>
              <span className="text-xs text-white/50">{route.retrieval}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ProcessPanel() {
  return (
    <div className="p-4 h-full overflow-y-auto">
      <div className="holo-panel p-4">
        <div className="text-sm text-white/60 tracking-wider mb-3">PLANT INTELLIGENCE</div>
        <div className="space-y-3">
          <MetricRow label="Rejection Rate" value="4.2%" color="#ef4444" />
          <MetricRow label="Process Cpk" value="1.33" color="#06b6d4" />
          <MetricRow label="Active Alerts" value="3" color="#f59e0b" />
          <MetricRow label="Mold Risk" value="0.67" color="#ec4899" />
          <MetricRow label="Heat Quality" value="0.89" color="#22c55e" />
        </div>
        <div className="mt-4 pt-3 border-t border-white/10">
          <div className="text-sm text-white/60 mb-2">ENDPOINTS</div>
          <div className="grid grid-cols-2 gap-1">
            {['Analytics (6)', 'Quality (5)', 'Process (4)', 'SPC (2)', 'Decision (4)', 'Reports (2)'].map((ep) => (
              <div key={ep} className="text-sm text-white/60 py-0.5">{ep}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function ClientPanel() {
  return (
    <div className="p-4 h-full overflow-y-auto">
      <div className="holo-panel p-4">
        <div className="text-sm text-white/60 tracking-wider mb-3">CLIENT CORTEX</div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-white/70">Client</span>
            <span className="text-green-400">Client</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-white/70">Type</span>
            <span className="text-white/90">Semantic Factory Memory</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-white/70">Mount Mode</span>
            <span className="text-cyan-400">hybrid</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-white/70">Schema</span>
            <span className="text-white/90">v1.0.0</span>
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-white/10">
          <div className="text-sm text-white/60 mb-2">ACTIVE CONTEXTS</div>
          <div className="space-y-1.5">
            {['calibration', 'knowledge_domains', 'sop', 'ppap', 'visual_references', 'cad', 'erp', 'quality_gates'].map((ctx) => (
              <div key={ctx} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                <span className="text-sm text-white/70">{ctx}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricRow({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-white/70">{label}</span>
      <span className="text-sm font-medium" style={{ color }}>{value}</span>
    </div>
  )
}
