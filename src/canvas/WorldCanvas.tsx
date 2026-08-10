import { useState } from 'react'
import { useAppStore } from '../stores/appStore'
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
  const [openStages, setOpenStages] = useState<Set<string>>(new Set())

  const toggle = (id: string) => {
    setOpenStages(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="h-full w-full overflow-y-auto">
      <div style={{ padding: '24px', paddingBottom: '40px' }}>

        {/* Header */}
        <div style={{ marginBottom: '20px' }}>
          <div className="text-xs font-semibold tracking-widest uppercase text-tertiary" style={{ marginBottom: '6px' }}>PIRAS Inspection Pipeline</div>
          <div className="text-sm text-secondary">
            {PIRAS_PIPELINE_STAGES.length} stages &nbsp;•&nbsp; Stage 0 → Stage {PIRAS_PIPELINE_STAGES.length - 1}
          </div>
        </div>

        {/* Pipeline stages */}
        <div className="surface rounded-xl" style={{ padding: '8px 20px' }}>
          {PIRAS_PIPELINE_STAGES.map((stage, i) => {
            const isOpen = openStages.has(stage.id)
            return (
              <div key={stage.id}>
                {/* Clickable row */}
                <div
                  onClick={() => toggle(stage.id)}
                  style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '14px 0', cursor: 'pointer' }}
                >
                  {/* Number circle + connector */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, width: '32px' }}>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '50%',
                      backgroundColor: stage.color, color: 'white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '13px', fontWeight: 700, flexShrink: 0,
                    }}>
                      {i + 1}
                    </div>
                    {i < PIRAS_PIPELINE_STAGES.length - 1 && (
                      <div style={{ width: '2px', flex: 1, minHeight: '16px', backgroundColor: stage.color, opacity: 0.2, marginTop: '4px' }} />
                    )}
                  </div>

                  {/* Name + latency + status */}
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: stage.color }}>{stage.name}</span>
                    <span className="text-tertiary" style={{ fontSize: '11px' }}>{stage.latencyMs[0]}–{stage.latencyMs[1]}ms</span>
                    <span style={{
                      fontSize: '11px', padding: '1px 8px', borderRadius: '4px', fontWeight: 600,
                      color: stage.healthStatus === 'OK' ? '#16a34a' : '#ef4444',
                      backgroundColor: stage.healthStatus === 'OK' ? 'rgba(22,163,74,0.1)' : 'rgba(239,68,68,0.1)',
                    }}>
                      {stage.healthStatus}
                    </span>
                  </div>

                  {/* Chevron */}
                  <div className="text-tertiary" style={{ fontSize: '14px', flexShrink: 0, transition: 'transform 0.2s', transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}>›</div>
                </div>

                {/* Expanded content */}
                {isOpen && (
                  <div style={{ marginLeft: '48px', paddingBottom: '12px' }}>
                    {/* Description */}
                    <div className="text-secondary" style={{ fontSize: '12px', lineHeight: '1.5', marginBottom: '8px' }}>
                      {stage.description}
                    </div>
                    {/* Flow tags */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                      {stage.inputs.map((tag, ti) => (
                        <span key={`in-${ti}`}>
                          <span style={{
                            fontSize: '10px', padding: '2px 6px', borderRadius: '3px',
                            backgroundColor: `${stage.color}12`, color: stage.color,
                            fontFamily: 'monospace',
                          }}>{tag}</span>
                          {ti < stage.inputs.length - 1 && (
                            <span className="text-tertiary" style={{ fontSize: '10px', margin: '0 2px' }}>+</span>
                          )}
                        </span>
                      ))}
                      <span className="text-tertiary" style={{ fontSize: '11px', margin: '0 4px' }}>→</span>
                      {stage.outputs.map((tag, ti) => (
                        <span key={`out-${ti}`}>
                          <span style={{
                            fontSize: '10px', padding: '2px 6px', borderRadius: '3px',
                            backgroundColor: `${stage.color}12`, color: stage.color,
                            fontFamily: 'monospace',
                          }}>{tag}</span>
                          {ti < stage.outputs.length - 1 && (
                            <span className="text-tertiary" style={{ fontSize: '10px', margin: '0 2px' }}>+</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Divider */}
                {i < PIRAS_PIPELINE_STAGES.length - 1 && (
                  <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)', marginLeft: '48px' }} />
                )}
              </div>
            )
          })}
        </div>

      </div>

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

    </div>
  )
}

/* ============================================
   EVOLVE — Roadmap timeline
   ============================================ */

function EvolveCanvas() {
  const stages = [
    { name: 'Signal System',        status: 'complete', color: '#16a34a', desc: 'LBP, GLCM, edge, blob signals extracted and classified' },
    { name: 'Process Intelligence', status: 'complete', color: '#16a34a', desc: 'Plant analytics, SPC, rejection rate dashboards' },
    { name: 'Energy Reasoning',     status: 'active',   color: '#f5a623', desc: 'Phase-K energy landscape, Lyapunov stability' },
    { name: 'Vajra Cortex',         status: 'active',   color: '#f5a623', desc: 'Retrieval-first executive cognition with multi-LLM' },
    { name: 'Client Cortex',        status: 'active',   color: '#f5a623', desc: 'Semantic factory memory — 14 domain knowledge layer' },
    { name: 'Voice Interface',      status: 'active',   color: '#f5a623', desc: 'TTS/STT multilingual routing, 11 languages' },
    { name: 'SCADA Cortex',         status: 'planned',  color: '#3b82f6', desc: 'PLC integration, real-time sensor fusion' },
    { name: 'Business Cortex',      status: 'planned',  color: '#7c3aed', desc: 'ERP analytics, MES integration, enterprise intelligence' },
    { name: 'Industrial Runtime',   status: 'future',   color: '#94a3b8', desc: 'Unified multi-cortex orchestration platform' },
  ]

  const statusLabel: Record<string, string> = {
    complete: 'Complete', active: 'Active', planned: 'Planned', future: 'Future',
  }
  const statusBg: Record<string, string> = {
    complete: 'rgba(22,163,74,0.12)', active: 'rgba(245,166,35,0.15)', planned: 'rgba(59,130,246,0.12)', future: 'rgba(148,163,184,0.1)',
  }

  const counts = {
    complete: stages.filter(s => s.status === 'complete').length,
    active:   stages.filter(s => s.status === 'active').length,
    planned:  stages.filter(s => s.status === 'planned').length,
    future:   stages.filter(s => s.status === 'future').length,
  }

  return (
    <div className="h-full w-full overflow-y-auto">
      <div style={{ padding: '24px', paddingBottom: '40px' }}>

        {/* Header */}
        <div style={{ marginBottom: '20px' }}>
          <div className="text-xs font-semibold tracking-widest uppercase text-tertiary" style={{ marginBottom: '6px' }}>System Evolution Roadmap</div>
          <div className="font-semibold text-primary" style={{ fontSize: '24px', marginBottom: '4px' }}>The path toward unified industrial cognition</div>
          <div className="text-sm text-secondary">Track progress across the Tvastr Cortex ecosystem.</div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
          {[
            { label: 'Complete', value: counts.complete, color: '#16a34a' },
            { label: 'Active',   value: counts.active,   color: '#f5a623' },
            { label: 'Planned',  value: counts.planned,  color: '#3b82f6' },
            { label: 'Future',   value: counts.future,   color: '#94a3b8' },
          ].map(s => (
            <div key={s.label} className="surface rounded-xl text-center" style={{ padding: '16px' }}>
              <div className="font-semibold" style={{ fontSize: '28px', color: s.color, marginBottom: '4px' }}>{s.value}</div>
              <div className="text-xs text-tertiary">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Timeline */}
        <div className="surface rounded-xl" style={{ padding: '20px' }}>
          {stages.map((stage, i) => {
            const opacity = stage.status === 'future' ? 0.5 : stage.status === 'planned' ? 0.75 : 1
            return (
              <div key={stage.name} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', opacity }}>
                {/* Icon + connector */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, width: '28px' }}>
                  {stage.status === 'complete' ? (
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: stage.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '14px', fontWeight: 'bold', flexShrink: 0 }}>✓</div>
                  ) : (
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', border: `2px solid ${stage.color}`, backgroundColor: `${stage.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: stage.color }} />
                    </div>
                  )}
                  {i < stages.length - 1 && (
                    <div style={{ width: '2px', flex: 1, minHeight: '24px', backgroundColor: stage.color, opacity: 0.2, margin: '2px 0' }} />
                  )}
                </div>
                {/* Content */}
                <div style={{ flex: 1, paddingBottom: i < stages.length - 1 ? '12px' : '0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                    <span className="font-semibold text-primary" style={{ fontSize: '14px' }}>{stage.name}</span>
                    <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', color: stage.color, backgroundColor: statusBg[stage.status], fontWeight: 500 }}>
                      {statusLabel[stage.status]}
                    </span>
                  </div>
                  <div className="text-secondary" style={{ fontSize: '12px', lineHeight: '1.5' }}>{stage.desc}</div>
                </div>
              </div>
            )
          })}
        </div>

      </div>

    </div>
  )
}
