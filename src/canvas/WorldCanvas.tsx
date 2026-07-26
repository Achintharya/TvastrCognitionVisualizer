import { useAppStore, WORLD_META } from '../stores/appStore'
import { ArchitectureGraph } from './ArchitectureGraph'
import { PIRAS_PIPELINE_STAGES, DEFAULT_ENERGY_STATE } from '../core/schema/pirasSchema'

/* ============================================
   WORLD CANVAS
   Routes to the correct visualization per world
   ============================================ */

export function WorldCanvas() {
  const currentWorld = useAppStore((s) => s.currentWorld)

  return (
    <div className="h-full w-full relative bg-[var(--bg-space)]">
      {currentWorld === 'explore'    && <ExploreCanvas />}
      {currentWorld === 'observe'    && <ObserveCanvas />}
      {currentWorld === 'understand' && <UnderstandCanvas />}
      {currentWorld === 'evolve'     && <EvolveCanvas />}
    </div>
  )
}

/* ============================================
   EXPLORE — Architecture graph
   ============================================ */

function ExploreCanvas() {
  return <ArchitectureGraph />
}

/* ============================================
   OBSERVE — PIRAS pipeline data flow
   ============================================ */

function ObserveCanvas() {
  const addEvent  = useAppStore((s) => s.addEvent)
  const events    = useAppStore((s) => s.events)
  const setSelection = useAppStore((s) => s.setSelection)

  const simulateEvent = () => {
    const sources = ['vajra', 'piras', 'client'] as const
    const categories = ['perception', 'reasoning', 'decision', 'retrieval', 'execution'] as const
    const types = [
      'inspection.started', 'signal.extracted', 'energy.converged',
      'decision.made', 'query.classified', 'retrieval.complete',
      'quality.gate.passed', 'pipeline.stage.complete',
    ]
    addEvent({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: Date.now(),
      source: sources[Math.floor(Math.random() * sources.length)],
      type: types[Math.floor(Math.random() * types.length)],
      category: categories[Math.floor(Math.random() * categories.length)],
      confidence: Math.random() * 0.4 + 0.6,
    })
  }

  const recentEvents = events.slice(-8).reverse()

  return (
    <div className="h-full w-full flex overflow-hidden">
      {/* Left: Pipeline flow */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-4">
          <div className="heading-sm mb-1">PIRAS Inspection Pipeline</div>
          <div className="caption">11 stages · Stage 0 → Stage 10</div>
        </div>

        <div className="relative ml-4">
          {PIRAS_PIPELINE_STAGES.map((stage, i) => (
            <div key={stage.id} className="flex items-start gap-4 group cursor-pointer mb-1"
              onClick={() => setSelection({ type: 'domain', id: 'pipeline', cortexId: 'piras', domainId: 'pipeline' })}>
              {/* Timeline spine */}
              <div className="flex flex-col items-center shrink-0" style={{ width: 20 }}>
                <div
                  className="w-3 h-3 rounded-full border-2 transition-all duration-200 group-hover:scale-125 shrink-0"
                  style={{ borderColor: stage.color, backgroundColor: `${stage.color}30` }}
                />
                {i < PIRAS_PIPELINE_STAGES.length - 1 && (
                  <div className="w-px flex-1 min-h-[24px]" style={{ backgroundColor: stage.color, opacity: 0.2 }} />
                )}
              </div>

              {/* Stage info */}
              <div className="flex-1 pb-5">
                <div className="flex items-center gap-3 mb-0.5">
                  <span className="text-sm font-medium" style={{ color: stage.color }}>{stage.name}</span>
                  <span className="text-[10px] text-tertiary font-mono">
                    {stage.latencyMs[0]}–{stage.latencyMs[1]}ms
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded ml-auto"
                    style={{ backgroundColor: `${stage.healthStatus === 'OK' ? '#22c55e' : '#ef4444'}15`,
                             color: stage.healthStatus === 'OK' ? '#22c55e' : '#ef4444' }}>
                    {stage.healthStatus}
                  </span>
                </div>
                <div className="text-xs text-secondary leading-relaxed">{stage.description}</div>
                <div className="text-[10px] text-tertiary mt-1 italic">{stage.semanticMeaning}</div>
                {/* Input/Output pills */}
                <div className="flex gap-1 flex-wrap mt-1.5">
                  {stage.inputs.slice(0, 3).map(inp => (
                    <span key={inp} className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--bg-elevated)] text-tertiary">
                      ← {inp}
                    </span>
                  ))}
                  {stage.outputs.slice(0, 2).map(out => (
                    <span key={out} className="text-[9px] px-1.5 py-0.5 rounded text-[var(--cortex-piras)]"
                      style={{ backgroundColor: 'rgba(59,130,246,0.08)' }}>
                      → {out}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Event stream */}
      <div className="w-56 border-l border-[var(--border-subtle)] flex flex-col p-3 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="heading-sm">Events</div>
          <button
            onClick={simulateEvent}
            className="text-[10px] px-2 py-1 rounded surface-elevated hover:bg-[var(--bg-hover)] transition-colors"
          >
            + Simulate
          </button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-1.5">
          {recentEvents.length === 0 ? (
            <div className="text-[11px] text-tertiary text-center pt-8">No events yet</div>
          ) : recentEvents.map(ev => (
            <div key={ev.id} className="surface rounded p-2">
              <div className="text-[10px] font-medium" style={{
                color: ev.source === 'vajra' ? 'var(--cortex-vajra)' :
                       ev.source === 'piras' ? 'var(--cortex-piras)' : 'var(--cortex-client)'
              }}>
                {ev.type}
              </div>
              <div className="flex items-center justify-between mt-0.5">
                <span className="text-[9px] text-tertiary">{ev.source}</span>
                {ev.confidence && (
                  <span className="text-[9px] text-tertiary">{(ev.confidence * 100).toFixed(0)}%</span>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-2 text-[10px] text-tertiary text-center">{events.length} total</div>
      </div>

      <WorldLabel world="observe" />
    </div>
  )
}

/* ============================================
   UNDERSTAND — Energy reasoning view
   ============================================ */

function UnderstandCanvas() {
  const energy = DEFAULT_ENERGY_STATE

  return (
    <div className="h-full w-full overflow-y-auto">
      <div className="min-h-full flex flex-col items-center justify-center py-10 px-8">
      <div className="w-full max-w-2xl">
        <div className="mb-8">
          <div className="text-xs font-semibold tracking-widest uppercase text-tertiary mb-2">Understand</div>
          <div className="text-2xl font-semibold mb-1 text-primary">Energy Reasoning — Phase-K</div>
          <div className="text-sm text-secondary">Physics-inspired defect classification via energy convergence</div>
        </div>

        {/* Energy forces */}
        <div className="surface rounded-xl p-6 mb-5">
          <div className="text-xs font-semibold tracking-widest uppercase text-tertiary mb-4">Additive Energy Forces</div>
          <div className="space-y-4">
            {energy.forces.map(f => (
              <div key={f.name}>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: f.color }} />
                    <span className="text-base font-medium">{f.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-tertiary">weight {(f.weight * 100).toFixed(0)}%</span>
                    <span className="text-base font-mono font-semibold" style={{ color: f.color }}>E={f.value.toFixed(3)}</span>
                  </div>
                </div>
                <div className="w-full h-3 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${f.value * 100}%`, backgroundColor: f.color, opacity: 0.8 }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stability metrics */}
        <div className="grid grid-cols-3 gap-4 mb-5">
          <div className="surface rounded-xl p-5 text-center">
            <div className="text-2xl font-bold mb-1" style={{ color: energy.lyapunovStable ? '#22c55e' : '#ef4444' }}>
              {energy.lyapunovStable ? '✓ Stable' : '✗ Unstable'}
            </div>
            <div className="text-sm text-tertiary">Lyapunov</div>
          </div>
          <div className="surface rounded-xl p-5 text-center">
            <div className="text-2xl font-bold mb-1 text-[var(--cortex-piras)]">
              {(energy.convergenceRate * 100).toFixed(0)}%
            </div>
            <div className="text-sm text-tertiary">Convergence</div>
          </div>
          <div className="surface rounded-xl p-5 text-center">
            <div className="text-2xl font-bold mb-1 text-[var(--cortex-vajra)]">
              {energy.totalEnergy.toFixed(3)}
            </div>
            <div className="text-sm text-tertiary">Total Energy</div>
          </div>
        </div>

        {/* Formula explanation */}
        <div className="surface rounded-xl p-6 mb-5">
          <div className="text-xs font-semibold tracking-widest uppercase text-tertiary mb-3">Phase-K Formula</div>
          <div className="font-mono text-xl text-[var(--cortex-piras)] mb-3">E = -log(p + ε)</div>
          <div className="text-sm text-secondary leading-relaxed">
            Each defect type corresponds to an energy minimum (well). The system evolves toward the lowest energy state, which represents the most probable defect classification. Lyapunov stability guarantees convergence without oscillation.
          </div>
        </div>

        {/* Signal weights */}
        <div className="surface rounded-xl p-6">
          <div className="text-xs font-semibold tracking-widest uppercase text-tertiary mb-4">Multi-Signal Fusion Weights</div>
          <div className="space-y-3">
            {[
              { name: 'Signal Classification', weight: 40, color: 'var(--cortex-piras)' },
              { name: 'LLM Score',             weight: 35, color: 'var(--cortex-vajra)' },
              { name: 'Agreement Score',        weight: 25, color: 'var(--cortex-client)' },
            ].map(s => (
              <div key={s.name} className="flex items-center gap-4">
                <div className="text-sm text-secondary w-48 shrink-0">{s.name}</div>
                <div className="flex-1 h-2 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${s.weight}%`, backgroundColor: s.color }} />
                </div>
                <span className="text-sm font-mono font-semibold text-tertiary w-10 text-right">{s.weight}%</span>
              </div>
            ))}
          </div>
          <div className="text-xs text-tertiary mt-4 leading-relaxed">
            Signal is PRIMARY (40%). LLM provides semantic validation (35%). Agreement measures cross-modal consensus (25%).
          </div>
        </div>
      </div>
      </div>

      <WorldLabel world="understand" />
    </div>
  )
}

/* ============================================
   EVOLVE — Roadmap timeline
   ============================================ */

function EvolveCanvas() {
  const stages = [
    { name: 'Signal System',        status: 'complete',  color: 'var(--status-success)',  desc: 'LBP, GLCM, edge, blob signals extracted and classified' },
    { name: 'Process Intelligence', status: 'complete',  color: 'var(--status-success)',  desc: 'Plant analytics, SPC, rejection rate dashboards' },
    { name: 'Energy Reasoning',     status: 'active',    color: 'var(--cortex-vajra)',    desc: 'Phase-K energy landscape, Lyapunov stability' },
    { name: 'Vajra Cortex',         status: 'active',    color: 'var(--cortex-vajra)',    desc: 'Retrieval-first executive cognition with multi-LLM' },
    { name: 'Client Cortex',        status: 'active',    color: 'var(--cortex-client)',   desc: 'Semantic factory memory — 14 domain knowledge layer' },
    { name: 'Voice Interface',      status: 'active',    color: 'var(--cortex-vajra)',    desc: 'TTS/STT multilingual routing, 11 languages' },
    { name: 'SCADA Cortex',         status: 'planned',   color: 'var(--cortex-scada)',    desc: 'PLC integration, real-time sensor fusion' },
    { name: 'Business Cortex',      status: 'planned',   color: 'var(--cortex-business)', desc: 'ERP analytics, MES integration, enterprise intelligence' },
    { name: 'Industrial Runtime',   status: 'future',    color: 'var(--text-muted)',      desc: 'Unified multi-cortex orchestration platform' },
  ]

  const statusConfig: Record<string, { label: string; pulse: boolean }> = {
    complete: { label: 'Complete', pulse: false },
    active:   { label: 'Active',   pulse: true },
    planned:  { label: 'Planned',  pulse: false },
    future:   { label: 'Future',   pulse: false },
  }

  return (
    <div className="h-full w-full overflow-y-auto">
      <div className="min-h-full flex flex-col items-center justify-start py-8 px-6">
      <div className="w-full max-w-xl">
        <div className="mb-6">
          <div className="heading-sm mb-1">System Evolution Roadmap</div>
          <div className="caption">The path toward unified industrial cognition</div>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          {[
            { label: 'Complete',  value: stages.filter(s => s.status === 'complete').length, color: 'var(--status-success)' },
            { label: 'Active',    value: stages.filter(s => s.status === 'active').length,   color: 'var(--cortex-vajra)' },
            { label: 'Planned',   value: stages.filter(s => s.status === 'planned').length,  color: 'var(--text-tertiary)' },
            { label: 'Future',    value: stages.filter(s => s.status === 'future').length,   color: 'var(--text-muted)' },
          ].map(s => (
            <div key={s.label} className="surface rounded p-3 text-center">
              <div className="text-xl font-semibold" style={{ color: s.color }}>{s.value}</div>
              <div className="caption">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Timeline */}
        <div className="relative ml-2">
          {stages.map((stage, i) => {
            const cfg = statusConfig[stage.status]
            const opacity = stage.status === 'future' ? 0.4 : stage.status === 'planned' ? 0.65 : 1
            return (
              <div key={stage.name} className="flex items-start gap-4" style={{ opacity }}>
                <div className="flex flex-col items-center shrink-0 mt-1" style={{ width: 16 }}>
                  <div
                    className={`w-3 h-3 rounded-full border-2 ${cfg.pulse ? 'animate-pulse' : ''}`}
                    style={{ borderColor: stage.color, backgroundColor: `${stage.color}30` }}
                  />
                  {i < stages.length - 1 && (
                    <div className="w-px flex-1 min-h-[28px]" style={{ backgroundColor: stage.color, opacity: 0.2 }} />
                  )}
                </div>
                <div className="flex-1 pb-5">
                  <div className="flex items-center gap-3 mb-0.5">
                    <span className="text-sm font-medium" style={{ color: stage.color }}>{stage.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded ml-auto"
                      style={{ color: stage.color, backgroundColor: `${stage.color}18` }}>
                      {cfg.label}
                    </span>
                  </div>
                  <div className="text-xs text-secondary">{stage.desc}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
      </div>

      <WorldLabel world="evolve" />
    </div>
  )
}

/* ============================================
   WORLD LABEL
   ============================================ */

function WorldLabel({ world }: { world: keyof typeof WORLD_META }) {
  const meta = WORLD_META[world]
  return (
    <div className="absolute bottom-5 left-5 pointer-events-none">
      <div className="heading-sm mb-0.5">{meta.question}</div>
      <div className="caption">{meta.description}</div>
    </div>
  )
}
