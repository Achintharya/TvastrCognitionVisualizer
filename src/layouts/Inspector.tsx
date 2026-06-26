import { useAppStore, CORTEXES, WORLD_META } from '../stores/appStore'

/* ============================================
   INSPECTOR PANEL
   Contextual details panel (right side)
   Inspired by: Unreal Engine, Blender, Figma
   ============================================ */

export function Inspector() {
  const selection = useAppStore((s) => s.selection)
  const currentWorld = useAppStore((s) => s.currentWorld)
  const inspectorOpen = useAppStore((s) => s.inspectorOpen)

  if (!inspectorOpen) return null

  // World-specific overview when nothing selected
  if (!selection) {
    return <WorldOverviewInspector />
  }

  // Selection-based content
  if (selection.type === 'cortex') {
    return <CortexInspector cortexId={selection.cortexId!} />
  }

  if (selection.type === 'domain') {
    return <DomainInspector cortexId={selection.cortexId!} domainId={selection.domainId!} />
  }

  if (selection.type === 'module') {
    return <ModuleInspector cortexId={selection.cortexId!} domainId={selection.domainId!} moduleId={selection.id} />
  }

  return <WorldOverviewInspector />
}

/* ============================================
   WORLD OVERVIEW INSPECTOR
   ============================================ */

function WorldOverviewInspector() {
  const currentWorld = useAppStore((s) => s.currentWorld)
  const meta = WORLD_META[currentWorld]
  const activeCortexes = CORTEXES.filter(c => c.status === 'active' || c.status === 'stable')
  const plannedCortexes = CORTEXES.filter(c => c.status === 'planned')

  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className="inspector-section">
        <div className="heading-sm mb-1">Current View</div>
        <div className="heading-lg capitalize mb-1">{currentWorld}</div>
        <div className="text-secondary text-sm">{meta.question}</div>
        <div className="caption mt-1">{meta.description}</div>
      </div>

      {/* System Status */}
      <div className="inspector-section">
        <div className="heading-sm mb-3">System Status</div>
        
        <div className="space-y-2">
          {activeCortexes.map((cortex) => (
            <CortexStatusRow key={cortex.id} cortex={cortex} />
          ))}
        </div>

        {plannedCortexes.length > 0 && (
          <>
            <div className="divider" />
            <div className="heading-sm mb-3">Planned</div>
            <div className="space-y-2 opacity-50">
              {plannedCortexes.map((cortex) => (
                <CortexStatusRow key={cortex.id} cortex={cortex} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Quick Stats */}
      <div className="inspector-section">
        <div className="heading-sm mb-3">Statistics</div>
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Cortexes" value={activeCortexes.length.toString()} />
          <StatCard label="Domains" value={activeCortexes.reduce((a, c) => a + c.domains.length, 0).toString()} />
          <StatCard label="Modules" value={activeCortexes.reduce((a, c) => a + c.domains.reduce((b, d) => b + d.modules.length, 0), 0).toString()} />
          <StatCard label="Connections" value={activeCortexes.reduce((a, c) => a + c.connections.length, 0).toString()} />
        </div>
      </div>

      {/* Keyboard Shortcuts */}
      <div className="inspector-section">
        <div className="heading-sm mb-3">Shortcuts</div>
        <div className="space-y-2 text-sm">
          <ShortcutRow keys={['1']} label="Explore" />
          <ShortcutRow keys={['2']} label="Observe" />
          <ShortcutRow keys={['3']} label="Understand" />
          <ShortcutRow keys={['4']} label="Evolve" />
          <ShortcutRow keys={['Esc']} label="Clear Selection" />
        </div>
      </div>
    </div>
  )
}

/* ============================================
   CORTEX INSPECTOR
   ============================================ */

function CortexInspector({ cortexId }: { cortexId: string }) {
  const cortex = CORTEXES.find(c => c.id === cortexId)
  if (!cortex) return null

  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className="inspector-section">
        <div className="flex items-center gap-3 mb-3">
          <div 
            className="w-4 h-4 rounded"
            style={{ backgroundColor: cortex.color }}
          />
          <div>
            <div className="heading-lg">{cortex.fullName}</div>
            <div className="caption">{cortex.role}</div>
          </div>
        </div>
        <StatusBadge status={cortex.status} />
      </div>

      {/* Domains */}
      <div className="inspector-section">
        <div className="heading-sm mb-3">Domains ({cortex.domains.length})</div>
        <div className="space-y-2">
          {cortex.domains.map((domain) => (
            <div key={domain.id} className="surface rounded p-3">
              <div className="flex justify-between items-center mb-1">
                <span className="label">{domain.name}</span>
                <span className="caption">{domain.modules.length} modules</span>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {domain.modules.map((mod) => (
                  <span 
                    key={mod.id}
                    className="text-[10px] px-2 py-0.5 rounded"
                    style={{ 
                      backgroundColor: cortex.colorSubtle,
                      color: cortex.color
                    }}
                  >
                    {mod.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Connections */}
      {cortex.connections.length > 0 && (
        <div className="inspector-section">
          <div className="heading-sm mb-3">Connections ({cortex.connections.length})</div>
          <div className="space-y-2">
            {cortex.connections.map((conn, i) => {
              const target = CORTEXES.find(c => c.id === conn.target)
              return (
                <div key={i} className="surface rounded p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: target?.color }}
                    />
                    <span className="label">{target?.name}</span>
                    <span className="caption ml-auto">{conn.type}</span>
                  </div>
                  <div className="text-sm text-secondary">{conn.label}</div>
                  <div className="mt-2 h-1 bg-white/5 rounded overflow-hidden">
                    <div 
                      className="h-full rounded"
                      style={{ 
                        width: `${conn.strength * 100}%`,
                        backgroundColor: cortex.color 
                      }}
                    />
                  </div>
                </div>
              )
            })}
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
  const cortex = CORTEXES.find(c => c.id === cortexId)
  const domain = cortex?.domains.find(d => d.id === domainId)
  if (!cortex || !domain) return null

  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className="inspector-section">
        <div className="caption mb-1" style={{ color: cortex.color }}>{cortex.name}</div>
        <div className="heading-lg mb-1">{domain.name}</div>
        <div className="text-secondary text-sm">{domain.modules.length} modules</div>
      </div>

      {/* Modules */}
      <div className="inspector-section">
        <div className="heading-sm mb-3">Modules</div>
        <div className="space-y-2">
          {domain.modules.map((mod) => (
            <div key={mod.id} className="surface rounded p-3">
              <div className="label">{mod.name}</div>
              {mod.description && (
                <div className="caption mt-1">{mod.description}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="inspector-section">
        <div className="heading-sm mb-2">Path</div>
        <div className="flex items-center gap-1 text-sm">
          <span style={{ color: cortex.color }}>{cortex.name}</span>
          <span className="text-tertiary">/</span>
          <span className="text-secondary">{domain.name}</span>
        </div>
      </div>
    </div>
  )
}

/* ============================================
   MODULE INSPECTOR
   ============================================ */

function ModuleInspector({ cortexId, domainId, moduleId }: { cortexId: string; domainId: string; moduleId: string }) {
  const cortex = CORTEXES.find(c => c.id === cortexId)
  const domain = cortex?.domains.find(d => d.id === domainId)
  const mod = domain?.modules.find(m => m.id === moduleId)
  if (!cortex || !domain || !mod) return null

  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className="inspector-section">
        <div className="caption mb-1" style={{ color: cortex.color }}>{cortex.name} / {domain.name}</div>
        <div className="heading-lg mb-2">{mod.name}</div>
        {mod.description && (
          <div className="text-secondary text-sm">{mod.description}</div>
        )}
      </div>

      {/* Properties Placeholder */}
      <div className="inspector-section">
        <div className="heading-sm mb-3">Properties</div>
        <div className="space-y-1">
          <PropertyRow label="Type" value="Module" />
          <PropertyRow label="Cortex" value={cortex.name} />
          <PropertyRow label="Domain" value={domain.name} />
          <PropertyRow label="Status" value="Active" />
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="inspector-section">
        <div className="heading-sm mb-2">Path</div>
        <div className="flex items-center gap-1 text-sm flex-wrap">
          <span style={{ color: cortex.color }}>{cortex.name}</span>
          <span className="text-tertiary">/</span>
          <span className="text-secondary">{domain.name}</span>
          <span className="text-tertiary">/</span>
          <span className="text-primary">{mod.name}</span>
        </div>
      </div>
    </div>
  )
}

/* ============================================
   HELPER COMPONENTS
   ============================================ */

function CortexStatusRow({ cortex }: { cortex: typeof CORTEXES[0] }) {
  return (
    <div className="flex items-center gap-2">
      <div 
        className={`status-dot ${cortex.status === 'planned' ? 'planned' : 'active'}`}
        style={{ backgroundColor: cortex.status !== 'planned' ? cortex.color : undefined }}
      />
      <span className="text-sm flex-1">{cortex.name}</span>
      <span className="caption">{cortex.role}</span>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="surface rounded p-3 text-center">
      <div className="heading-lg">{value}</div>
      <div className="caption">{label}</div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    active: 'var(--status-success)',
    stable: 'var(--cortex-client)',
    experimental: 'var(--status-warning)',
    planned: 'var(--text-tertiary)',
  }

  return (
    <span 
      className="inline-block px-2 py-0.5 rounded text-xs font-medium"
      style={{ 
        backgroundColor: `${colors[status]}20`,
        color: colors[status]
      }}
    >
      {status}
    </span>
  )
}

function PropertyRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="inspector-row">
      <span className="label">{label}</span>
      <span className="value">{value}</span>
    </div>
  )
}

function ShortcutRow({ keys, label }: { keys: string[]; label: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-secondary">{label}</span>
      <div className="flex gap-1">
        {keys.map((key) => (
          <kbd key={key} className="kbd">{key}</kbd>
        ))}
      </div>
    </div>
  )
}
