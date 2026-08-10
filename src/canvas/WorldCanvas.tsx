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
      {/* Outer padding container — inline styles to guarantee rendering */}
      <div style={{ padding: '24px', paddingBottom: '40px' }}>

        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <div className="text-xs font-semibold tracking-widest uppercase text-tertiary" style={{ marginBottom: '6px' }}>Understand</div>
          <div className="font-semibold text-primary" style={{ fontSize: '24px', marginBottom: '4px' }}>Energy Reasoning — Phase-K</div>
          <div className="text-sm text-secondary">Physics-inspired defect classification via energy convergence</div>
        </div>

        {/* Top row: Energy Forces (left) + Stability + Formula (right) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '16px' }}>

          {/* Energy Forces */}
          <div className="surface rounded-xl" style={{ padding: '20px' }}>
            <div className="text-xs font-semibold tracking-widest uppercase text-tertiary" style={{ marginBottom: '16px' }}>Additive Energy Forces</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {energy.forces.map(f => (
                <div key={f.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: f.color, flexShrink: 0 }} />
                      <span className="text-sm font-medium">{f.name}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span className="text-xs text-tertiary">weight {(f.weight * 100).toFixed(0)}%</span>
                      <span className="text-sm font-mono font-semibold" style={{ color: f.color }}>E={f.value.toFixed(3)}</span>
                    </div>
                  </div>
                  <div style={{ width: '100%', height: '10px', backgroundColor: 'var(--bg-elevated)', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: '999px', width: `${f.value * 100}%`, backgroundColor: f.color, opacity: 0.85 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Stability Metrics + Formula */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Stability Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              <div className="surface rounded-xl text-center" style={{ padding: '16px' }}>
                <div className="font-bold" style={{ fontSize: '20px', marginBottom: '2px', color: energy.lyapunovStable ? '#22c55e' : '#ef4444' }}>
                  {energy.lyapunovStable ? '✓ Stable' : '✗ Unstable'}
                </div>
                <div className="text-xs text-tertiary">Lyapunov</div>
              </div>
              <div className="surface rounded-xl text-center" style={{ padding: '16px' }}>
                <div className="font-bold text-[var(--cortex-piras)]" style={{ fontSize: '20px', marginBottom: '2px' }}>
                  {(energy.convergenceRate * 100).toFixed(0)}%
                </div>
                <div className="text-xs text-tertiary">Convergence</div>
              </div>
              <div className="surface rounded-xl text-center" style={{ padding: '16px' }}>
                <div className="font-bold text-[var(--cortex-vajra)]" style={{ fontSize: '20px', marginBottom: '2px' }}>
                  {energy.totalEnergy.toFixed(3)}
                </div>
                <div className="text-xs text-tertiary">Total Energy</div>
              </div>
            </div>

            {/* Formula Explanation */}
            <div className="surface rounded-xl" style={{ padding: '20px' }}>
              <div className="text-xs font-semibold tracking-widest uppercase text-tertiary" style={{ marginBottom: '12px' }}>Phase-K Formula</div>
              <div className="font-mono font-bold text-[var(--cortex-piras)]" style={{ fontSize: '20px', marginBottom: '12px', padding: '12px', backgroundColor: 'var(--bg-elevated)', borderRadius: '8px' }}>
                E = -log(p + ε)
              </div>
              <div className="text-sm text-secondary" style={{ lineHeight: '1.6' }}>
                Each defect type corresponds to an <strong>energy minimum</strong> (well). The system evolves toward the lowest energy state, which represents the most probable defect classification.
              </div>
              <div className="text-sm text-secondary" style={{ lineHeight: '1.6', marginTop: '8px' }}>
                <strong>Lyapunov</strong> stability guarantees convergence without oscillation.
              </div>
            </div>
          </div>
        </div>

        {/* Bottom row: Multi-Signal Fusion (left) + Why Is It Happening (right) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>

          {/* Multi-Signal Fusion */}
          <div className="surface rounded-xl" style={{ padding: '20px' }}>
            <div className="text-xs font-semibold tracking-widest uppercase text-tertiary" style={{ marginBottom: '16px' }}>Multi-Signal Fusion Weights</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { name: 'Signal Classification', weight: 40, color: 'var(--cortex-piras)' },
                { name: 'LLM Score',             weight: 35, color: 'var(--cortex-vajra)' },
                { name: 'Agreement Score',       weight: 25, color: 'var(--cortex-client)' },
              ].map(s => (
                <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="text-sm text-secondary" style={{ width: '160px', flexShrink: 0 }}>{s.name}</div>
                  <div style={{ flex: 1, height: '10px', backgroundColor: 'var(--bg-elevated)', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: '999px', width: `${s.weight}%`, backgroundColor: s.color, opacity: 0.9 }} />
                  </div>
                  <span className="text-sm font-mono font-semibold text-tertiary" style={{ width: '36px', textAlign: 'right' }}>{s.weight}%</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: '16px', padding: '12px', backgroundColor: 'var(--bg-elevated)', borderRadius: '8px' }}>
              <span className="text-tertiary text-xs" style={{ marginTop: '2px' }}>ℹ</span>
              <div className="text-xs text-tertiary" style={{ lineHeight: '1.5' }}>
                Signal is PRIMARY (40%). LLM provides semantic validation (35%). Agreement measures cross-modal consensus (25%).
              </div>
            </div>
          </div>

          {/* Why Is It Happening */}
          <div className="surface rounded-xl" style={{ padding: '20px' }}>
            <div className="text-xs font-semibold tracking-widest uppercase text-tertiary" style={{ marginBottom: '16px' }}>Why Is It Happening?</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {[
                { color: 'rgba(59,130,246,0.15)', emoji: '🔵', label: 'Reasoning', desc: 'Multi-signal evidence is combined using adaptive energy weighting.' },
                { color: 'rgba(34,197,94,0.15)',  emoji: '🟢', label: 'Energy',    desc: 'System converges to the lowest energy state (most probable defect).' },
                { color: 'rgba(168,85,247,0.15)', emoji: '🟣', label: 'Root Causes', desc: 'Energy minima correspond to underlying defect mechanisms.' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', backgroundColor: item.color }}>
                    {item.emoji}
                  </div>
                  <div className="text-sm font-semibold text-primary">{item.label}</div>
                  <div className="text-xs text-secondary" style={{ lineHeight: '1.5' }}>{item.desc}</div>
                </div>
              ))}
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
