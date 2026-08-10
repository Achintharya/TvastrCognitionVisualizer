import { useAppStore, CORTEXES, WORLD_META } from '../stores/appStore'
import type { RuntimeStatus } from '../stores/appStore'

/* ============================================
   INSPECTOR — Rich Architecture Property Panel
   - World overview with engineering stats
   - Cortex inspector: domains, connections, incoming deps
   - Domain inspector: modules with type icons
   - Module inspector: full dependency view
   ============================================ */

const STATUS_COLOR: Record<RuntimeStatus, string> = {
  running:      '#22c55e',
  stopped:      '#ef4444',
  warning:      '#f59e0b',
  initializing: '#3b82f6',
  planned:      '#6b7280',
}

const STATUS_LABEL: Record<RuntimeStatus, string> = {
  running:      'Running',
  stopped:      'Stopped',
  warning:      'Warning',
  initializing: 'Initializing',
  planned:      'Planned',
}

export function Inspector() {
  const selection = useAppStore((s) => s.selection)

  if (!selection)                  return <WorldOverviewInspector />
  if (selection.type === 'cortex') return <CortexInspector cortexId={selection.cortexId!} />
  if (selection.type === 'domain') return <DomainInspector cortexId={selection.cortexId!} domainId={selection.domainId!} />
  if (selection.type === 'module') return <ModuleInspector cortexId={selection.cortexId!} domainId={selection.domainId!} moduleId={selection.id} />
  return <WorldOverviewInspector />
}

/* ============================================
   WORLD OVERVIEW
   ============================================ */

function WorldOverviewInspector() {
  const currentWorld  = useAppStore((s) => s.currentWorld)
  const setSelection  = useAppStore((s) => s.setSelection)
  const runtimeStatus = useAppStore((s) => s.runtimeStatus)
  const layoutMode    = useAppStore((s) => s.layoutMode)
  const meta = WORLD_META[currentWorld]

  const activeCortexes  = CORTEXES.filter(c => c.status === 'active' || c.status === 'stable')
  const plannedCortexes = CORTEXES.filter(c => c.status === 'planned')
  const totalDomains    = activeCortexes.reduce((a, c) => a + c.domains.length, 0)
  const totalModules    = activeCortexes.reduce((a, c) => a + c.domains.reduce((b, d) => b + d.modules.length, 0), 0)
  const totalConns      = CORTEXES.reduce((a, c) => a + c.connections.length, 0)
  const runningCount    = activeCortexes.filter(c => runtimeStatus[c.id] === 'running').length

  return (
    <div className="h-full overflow-y-auto">
      {/* World context */}
      <div className="inspector-section">
        <div className="heading-sm mb-2">Current View</div>
        <div className="flex items-baseline gap-2 mb-1">
          <div className="heading-lg capitalize">{currentWorld}</div>
          <div className="caption text-tertiary">{meta.question}</div>
        </div>
        <div className="caption">{meta.description}</div>
        <div className="mt-2 text-xs text-tertiary">Layout: <span className="text-secondary capitalize">{layoutMode}</span></div>
      </div>

      {/* Explore-only sections */}
      {currentWorld === 'explore' && (<>
        {/* Engineering stats */}
        <div className="inspector-section">
          <div className="heading-sm mb-3">System Metrics</div>
          <div className="grid grid-cols-2 gap-2">
            <MetricPill label="Running Cortexes" value={`${runningCount}/${activeCortexes.length}`} color="var(--status-success)" />
            <MetricPill label="Total Modules"    value={totalModules.toString()}                     color="var(--cortex-vajra)" />
            <MetricPill label="Domains"          value={totalDomains.toString()}                    color="var(--cortex-piras)" />
            <MetricPill label="Connections"      value={totalConns.toString()}                      color="var(--cortex-client)" />
            <MetricPill label="Planned"          value={plannedCortexes.length.toString()}          color="var(--text-tertiary)" />
            <MetricPill label="Active Services"  value={runningCount.toString()}                    color="var(--status-success)" />
          </div>
        </div>

        {/* Cortex health table */}
        <div className="inspector-section">
          <div className="heading-sm mb-3">Cortex Status</div>
          <div className="space-y-2">
            {CORTEXES.map(cortex => {
              const status = runtimeStatus[cortex.id]
              const domainCount  = cortex.domains.length
              const moduleCount  = cortex.domains.reduce((a, d) => a + d.modules.length, 0)
              return (
                <div
                  key={cortex.id}
                  className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-[var(--bg-hover)] cursor-pointer transition-colors"
                  onClick={() => setSelection({ type: 'cortex', id: cortex.id, cortexId: cortex.id })}
                >
                  <div className="w-2 h-2 rounded-full shrink-0 flex-none"
                    style={{ backgroundColor: STATUS_COLOR[status] }} />
                  <div className="w-2 h-2 rounded-sm shrink-0" style={{ backgroundColor: cortex.color }} />
                  <span className="text-sm flex-1 font-medium">{cortex.name}</span>
                  <span className="text-[10px] text-tertiary">{domainCount}d</span>
                  <span className="text-[10px] text-tertiary">{moduleCount}m</span>
                  <span className="text-[10px] px-1 rounded" style={{ color: STATUS_COLOR[status], backgroundColor: `${STATUS_COLOR[status]}15` }}>
                    {STATUS_LABEL[status]}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Edge legend */}
        <div className="inspector-section">
          <div className="heading-sm mb-3">Edge Types</div>
          <div className="space-y-1.5">
            {[
              { type: 'orchestration', color: '#D97706', style: 'solid',   desc: 'Primary orchestration' },
              { type: 'retrieval',     color: '#3B82F6', style: 'solid',   desc: 'Data retrieval' },
              { type: 'context',       color: '#10B981', style: 'dashed',  desc: 'Context mounting' },
              { type: 'event',         color: '#8B5CF6', style: 'animated',desc: 'Event streaming' },
              { type: 'automation',    color: '#06B6D4', style: 'dotted',  desc: 'Automation feed' },
            ].map(e => (
              <div key={e.type} className="flex items-center gap-2.5">
                <div className="w-8 flex items-center">
                  <svg width="28" height="8" viewBox="0 0 28 8">
                    <line x1="0" y1="4" x2="22" y2="4"
                      stroke={e.color} strokeWidth="1.5"
                      strokeDasharray={e.style === 'dashed' ? '4 2' : e.style === 'dotted' ? '2 3' : undefined} />
                    <path d="M22 1L27 4L22 7" fill={e.color} opacity="0.8" />
                  </svg>
                </div>
                <span className="text-xs text-secondary flex-1">{e.desc}</span>
                <span className="text-[10px] text-tertiary capitalize">{e.type}</span>
              </div>
            ))}
          </div>
        </div>
      </>)}

      {/* Evolve-only sections */}
      {currentWorld === 'evolve' && (<>
        {/* About This Roadmap */}
        <div className="inspector-section">
          <div className="heading-sm mb-3">About This Roadmap</div>
          <div className="text-xs text-secondary" style={{ lineHeight: '1.6' }}>
            This roadmap represents our journey toward building a unified industrial cognition platform. Each cortex builds on the previous foundation, bringing us closer to autonomous, intelligent manufacturing.
          </div>
        </div>

        {/* Legend */}
        <div className="inspector-section">
          <div className="heading-sm mb-3">Legend</div>
          <div className="space-y-3">
            {[
              { color: '#16a34a', label: 'Complete', desc: 'Fully implemented and operational' },
              { color: '#f5a623', label: 'Active',   desc: 'In development and actively evolving' },
              { color: '#3b82f6', label: 'Planned',  desc: 'Planned for upcoming phases' },
              { color: '#7c3aed', label: 'Future',   desc: 'Long-term vision and research' },
            ].map(l => (
              <div key={l.label} className="flex items-start gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full mt-1 shrink-0" style={{ backgroundColor: l.color }} />
                <div>
                  <div className="text-sm font-semibold text-primary">{l.label}</div>
                  <div className="text-xs text-tertiary">{l.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Key Principles */}
        <div className="inspector-section">
          <div className="heading-sm mb-3">Key Principles</div>
          <div className="space-y-3">
            {[
              { color: '#3b82f6', abbr: 'UI', label: 'Unified Intelligence',  desc: 'All cortexes work together seamlessly' },
              { color: '#f5a623', abbr: 'MA', label: 'Modular Architecture',  desc: 'Independent yet deeply integrated' },
              { color: '#16a34a', abbr: 'CE', label: 'Continuous Evolution',  desc: 'Always learning, always improving' },
              { color: '#7c3aed', abbr: '🔒', label: 'Enterprise Ready',       desc: 'Secure, scalable, and reliable' },
            ].map(p => (
              <div key={p.label} className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                  style={{ backgroundColor: `${p.color}20`, color: p.color }}>
                  {p.abbr}
                </div>
                <div>
                  <div className="text-sm font-semibold text-primary">{p.label}</div>
                  <div className="text-xs text-secondary">{p.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </>)}

      {/* Keyboard shortcuts */}
      <div className="inspector-section">
        <div className="heading-sm mb-3">Shortcuts</div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
          {[
            ['/', 'Search'],
            ['F', 'Focus mode'],
            ['Esc', 'Clear'],
            ['1–4', 'Worlds'],
            ['[', 'Nav panel'],
            [']', 'Inspector'],
            ['A', 'Architecture'],
            ['D', 'Dependencies'],
            ['R', 'Runtime'],
            ['M', 'Minimap'],
          ].map(([key, label]) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-tertiary">{label}</span>
              <kbd className="kbd">{key}</kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ============================================
   CORTEX INSPECTOR
   ============================================ */

function CortexInspector({ cortexId }: { cortexId: string }) {
  const setSelection  = useAppStore((s) => s.setSelection)
  const runtimeStatus = useAppStore((s) => s.runtimeStatus)
  const cortex = CORTEXES.find(c => c.id === cortexId)
  if (!cortex) return null

  const status       = runtimeStatus[cortex.id as keyof typeof runtimeStatus]
  const moduleCount  = cortex.domains.reduce((a, d) => a + d.modules.length, 0)

  // Compute incoming connections (who points TO this cortex)
  const incomingConns = CORTEXES
    .filter(c => c.id !== cortex.id)
    .flatMap(c => c.connections
      .filter(conn => conn.target === cortex.id)
      .map(conn => ({ source: c, conn }))
    )

  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className="inspector-section">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-4 h-4 rounded mt-0.5 shrink-0" style={{ backgroundColor: cortex.color }} />
          <div className="flex-1 min-w-0">
            <div className="heading-lg leading-tight">{cortex.fullName}</div>
            <div className="caption mt-0.5 leading-relaxed">{cortex.role}</div>
          </div>
        </div>
        {/* Status + metric row */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs"
            style={{ backgroundColor: `${STATUS_COLOR[status]}15`, color: STATUS_COLOR[status] }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: STATUS_COLOR[status] }} />
            {STATUS_LABEL[status]}
          </span>
          <StatusBadge status={cortex.status} />
          <span className="text-[10px] text-tertiary">{cortex.domains.length} domains</span>
          <span className="text-[10px] text-tertiary">{moduleCount} modules</span>
        </div>
      </div>

      {/* Domains (clickable) */}
      <div className="inspector-section">
        <div className="heading-sm mb-2">Domains ({cortex.domains.length})</div>
        <div className="space-y-1">
          {cortex.domains.map(domain => (
            <div
              key={domain.id}
              className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-[var(--bg-hover)] cursor-pointer transition-colors group"
              onClick={() => setSelection({ type: 'domain', id: domain.id, cortexId: cortex.id, domainId: domain.id })}
            >
              <div className="flex items-center gap-2">
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none" className="opacity-40">
                  <rect x="1" y="1" width="4" height="4" rx="0.8" stroke="currentColor" strokeWidth="1.1"/>
                  <rect x="6" y="1" width="4" height="4" rx="0.8" stroke="currentColor" strokeWidth="1.1"/>
                  <rect x="1" y="6" width="4" height="4" rx="0.8" stroke="currentColor" strokeWidth="1.1"/>
                  <rect x="6" y="6" width="4" height="4" rx="0.8" stroke="currentColor" strokeWidth="1.1"/>
                </svg>
                <span className="text-sm text-secondary group-hover:text-primary transition-colors">{domain.name}</span>
              </div>
              <span className="text-[10px] text-tertiary">{domain.modules.length}m</span>
            </div>
          ))}
        </div>
      </div>

      {/* Outgoing connections */}
      {cortex.connections.length > 0 && (
        <div className="inspector-section">
          <div className="heading-sm mb-2">Outgoing ({cortex.connections.length})</div>
          <div className="space-y-2">
            {cortex.connections.map((conn, i) => {
              const target = CORTEXES.find(c => c.id === conn.target)
              return (
                <div key={i} className="surface rounded p-2.5">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: target?.color }} />
                    <span className="label flex-1">{target?.name}</span>
                    <EdgeTypeBadge type={conn.type} />
                  </div>
                  <div className="text-xs text-secondary mb-1.5">{conn.label}</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1 bg-[var(--bg-elevated)] rounded overflow-hidden">
                      <div className="h-full rounded transition-all"
                        style={{ width: `${conn.strength * 100}%`, backgroundColor: cortex.color }} />
                    </div>
                    <span className="text-[10px] text-tertiary">{(conn.strength * 100).toFixed(0)}%</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Incoming connections */}
      {incomingConns.length > 0 && (
        <div className="inspector-section">
          <div className="heading-sm mb-2">Incoming ({incomingConns.length})</div>
          <div className="space-y-2">
            {incomingConns.map(({ source, conn }, i) => (
              <div key={i} className="surface rounded p-2.5">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: source.color }} />
                  <span className="label flex-1">{source.name}</span>
                  <EdgeTypeBadge type={conn.type} />
                </div>
                <div className="text-xs text-secondary">{conn.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ============================================
   DOMAIN INSPECTOR
   ============================================ */

function DomainInspector({ cortexId, domainId }: { cortexId: string; domainId: string }) {
  const setSelection = useAppStore((s) => s.setSelection)
  const cortex = CORTEXES.find(c => c.id === cortexId)
  const domain = cortex?.domains.find(d => d.id === domainId)
  if (!cortex || !domain) return null

  return (
    <div className="h-full overflow-y-auto">
      {/* Breadcrumb */}
      <div className="inspector-section">
        <div className="flex items-center gap-1 text-xs mb-2">
          <button className="hover:text-primary text-tertiary transition-colors"
            onClick={() => setSelection({ type: 'cortex', id: cortex.id, cortexId: cortex.id })}>
            {cortex.name}
          </button>
          <span className="text-tertiary">/</span>
          <span className="text-primary font-medium">{domain.name}</span>
        </div>
        <div className="heading-lg mb-1">{domain.name}</div>
        <div className="caption">{domain.modules.length} modules · {cortex.name} cortex</div>
        <div className="mt-2">
          <StatusBadge status={cortex.status} />
        </div>
      </div>

      {/* Modules */}
      <div className="inspector-section">
        <div className="heading-sm mb-2">Modules</div>
        <div className="space-y-1.5">
          {domain.modules.map(mod => (
            <div
              key={mod.id}
              className="surface rounded p-2.5 hover:bg-[var(--bg-elevated)] cursor-pointer transition-colors"
              onClick={() => setSelection({ type: 'module', id: mod.id, cortexId: cortex.id, domainId: domain.id })}
            >
              <div className="label mb-0.5" style={{ color: cortex.color }}>{mod.name}</div>
              {mod.description && <div className="caption">{mod.description}</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Parent info */}
      <div className="inspector-section">
        <div className="heading-sm mb-2">Parent Cortex</div>
        <div className="surface rounded p-2.5">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: cortex.color }} />
            <span className="label">{cortex.fullName}</span>
          </div>
          <div className="caption mt-1">{cortex.role}</div>
        </div>
      </div>
    </div>
  )
}

/* ============================================
   MODULE INSPECTOR
   ============================================ */

function ModuleInspector({ cortexId, domainId, moduleId }: { cortexId: string; domainId: string; moduleId: string }) {
  const setSelection = useAppStore((s) => s.setSelection)
  const cortex = CORTEXES.find(c => c.id === cortexId)
  const domain = cortex?.domains.find(d => d.id === domainId)
  const mod    = domain?.modules.find(m => m.id === moduleId)
  if (!cortex || !domain || !mod) return null

  // Find sibling modules in same domain
  const siblings = domain.modules.filter(m => m.id !== mod.id)

  // Find modules in same-named domains across other cortexes (related)
  const relatedModules = CORTEXES
    .filter(c => c.id !== cortex.id)
    .flatMap(c => c.domains
      .filter(d => d.id === domain.id || d.name === domain.name)
      .flatMap(d => d.modules.slice(0, 3).map(m => ({ cortex: c, domain: d, mod: m })))
    ).slice(0, 4)

  return (
    <div className="h-full overflow-y-auto">
      {/* Breadcrumb */}
      <div className="inspector-section">
        <div className="flex items-center gap-1 text-xs mb-2 flex-wrap">
          <button className="hover:text-primary text-tertiary transition-colors"
            onClick={() => setSelection({ type: 'cortex', id: cortex.id, cortexId: cortex.id })}>
            {cortex.name}
          </button>
          <span className="text-tertiary">/</span>
          <button className="hover:text-primary text-tertiary transition-colors"
            onClick={() => setSelection({ type: 'domain', id: domain.id, cortexId: cortex.id, domainId: domain.id })}>
            {domain.name}
          </button>
          <span className="text-tertiary">/</span>
          <span className="text-primary font-medium">{mod.name}</span>
        </div>
        <div className="heading-lg mb-1">{mod.name}</div>
        {mod.description && <div className="text-secondary text-sm leading-relaxed">{mod.description}</div>}
      </div>

      {/* Properties */}
      <div className="inspector-section">
        <div className="heading-sm mb-2">Properties</div>
        <div className="space-y-1">
          <PropertyRow label="Type"    value="Module" />
          <PropertyRow label="Cortex"  value={cortex.name} valueColor={cortex.color} />
          <PropertyRow label="Domain"  value={domain.name} />
          <PropertyRow label="Status"  value={cortex.status} />
          <PropertyRow label="ID"      value={mod.id} mono />
        </div>
      </div>

      {/* Sibling modules in same domain */}
      {siblings.length > 0 && (
        <div className="inspector-section">
          <div className="heading-sm mb-2">Siblings in {domain.name} ({siblings.length})</div>
          <div className="space-y-1">
            {siblings.map(s => (
              <div
                key={s.id}
                className="flex items-center gap-2 px-2 py-1 rounded hover:bg-[var(--bg-hover)] cursor-pointer text-xs text-secondary hover:text-primary transition-colors"
                onClick={() => setSelection({ type: 'module', id: s.id, cortexId: cortex.id, domainId: domain.id })}
              >
                <div className="w-1 h-1 rounded-full" style={{ backgroundColor: cortex.color }} />
                {s.name}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Related (same domain name in other cortexes) */}
      {relatedModules.length > 0 && (
        <div className="inspector-section">
          <div className="heading-sm mb-2">Related Modules</div>
          <div className="space-y-1">
            {relatedModules.map(({ cortex: rc, domain: rd, mod: rm }, i) => (
              <div key={i}
                className="flex items-center gap-2 px-2 py-1 rounded hover:bg-[var(--bg-hover)] cursor-pointer text-xs transition-colors"
                onClick={() => setSelection({ type: 'module', id: rm.id, cortexId: rc.id, domainId: rd.id })}
              >
                <div className="w-1.5 h-1.5 rounded-sm shrink-0" style={{ backgroundColor: rc.color }} />
                <span className="text-secondary">{rm.name}</span>
                <span className="ml-auto text-tertiary">{rc.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Parent domain & cortex */}
      <div className="inspector-section">
        <div className="heading-sm mb-2">Hierarchy</div>
        <div className="space-y-1.5">
          <div className="surface rounded p-2">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded" style={{ backgroundColor: cortex.color }} />
              <span className="label">{cortex.name}</span>
              <span className="caption ml-auto">{cortex.status}</span>
            </div>
          </div>
          <div className="surface rounded p-2 ml-3">
            <div className="text-xs text-secondary">{domain.name}</div>
            <div className="caption">{domain.modules.length} modules</div>
          </div>
          <div className="surface rounded p-2 ml-6" style={{ borderLeft: `2px solid ${cortex.color}` }}>
            <div className="text-xs font-medium" style={{ color: cortex.color }}>{mod.name}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ============================================
   HELPER COMPONENTS
   ============================================ */

function MetricPill({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="surface rounded p-2.5 text-center">
      <div className="text-lg font-semibold leading-tight" style={{ color }}>{value}</div>
      <div className="caption mt-0.5">{label}</div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    active:       'var(--status-success)',
    stable:       'var(--cortex-client)',
    experimental: 'var(--status-warning)',
    planned:      'var(--text-tertiary)',
  }
  return (
    <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium"
      style={{ backgroundColor: `${colors[status]}20`, color: colors[status] }}>
      {status}
    </span>
  )
}

const EDGE_TYPE_COLORS: Record<string, string> = {
  orchestration: '#D97706',
  retrieval:     '#3B82F6',
  context:       '#10B981',
  event:         '#8B5CF6',
  automation:    '#06B6D4',
}

function EdgeTypeBadge({ type }: { type: string }) {
  const color = EDGE_TYPE_COLORS[type] || '#6b7280'
  return (
    <span className="text-[10px] px-1.5 py-0.5 rounded capitalize"
      style={{ backgroundColor: `${color}18`, color }}>
      {type}
    </span>
  )
}

function PropertyRow({ label, value, valueColor, mono }: { label: string; value: string; valueColor?: string; mono?: boolean }) {
  return (
    <div className="inspector-row">
      <span className="label">{label}</span>
      <span className={`value text-xs ${mono ? 'font-mono' : ''}`}
        style={{ color: valueColor || 'var(--text-primary)' }}>
        {value}
      </span>
    </div>
  )
}
