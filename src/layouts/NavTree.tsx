import { useState } from 'react'
import { useAppStore, CORTEXES } from '../stores/appStore'
import type { CortexId } from '../stores/appStore'

/* ============================================
   ICONS (inline SVGs for simplicity)
   ============================================ */

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg 
      width="12" 
      height="12" 
      viewBox="0 0 12 12" 
      fill="none"
      className={`transition-transform duration-150 ${expanded ? 'rotate-90' : ''}`}
    >
      <path 
        d="M4.5 3L7.5 6L4.5 9" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CortexIcon({ color }: { color: string }) {
  return (
    <div 
      className="w-3 h-3 rounded-sm"
      style={{ backgroundColor: color }}
    />
  )
}

function DomainIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="opacity-50">
      <rect x="2" y="2" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.2" />
      <rect x="8" y="2" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.2" />
      <rect x="2" y="8" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.2" />
      <rect x="8" y="8" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  )
}

function ModuleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="opacity-40">
      <circle cx="7" cy="7" r="2" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  )
}

/* ============================================
   NAV TREE COMPONENT
   ============================================ */

export function NavTree() {
  const selection = useAppStore((s) => s.selection)
  const setSelection = useAppStore((s) => s.setSelection)
  const currentWorld = useAppStore((s) => s.currentWorld)
  const [expandedCortexes, setExpandedCortexes] = useState<Set<CortexId>>(new Set(['vajra']))
  const [expandedDomains, setExpandedDomains] = useState<Set<string>>(new Set())

  const toggleCortex = (id: CortexId) => {
    const next = new Set(expandedCortexes)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    setExpandedCortexes(next)
  }

  const toggleDomain = (id: string) => {
    const next = new Set(expandedDomains)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    setExpandedDomains(next)
  }

  const activeCortexes = CORTEXES.filter(c => c.status === 'active' || c.status === 'stable')
  const plannedCortexes = CORTEXES.filter(c => c.status === 'planned')

  return (
    <div className="h-full overflow-y-auto py-3 px-2">
      {/* Overview - always at top */}
      <div 
        className={`nav-item mb-2 ${selection === null ? 'active' : ''}`}
        onClick={() => setSelection(null)}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="opacity-60">
          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="8" cy="8" r="2" fill="currentColor" />
        </svg>
        <span>Overview</span>
      </div>

      <div className="divider" />

      {/* Cortices Section */}
      <div className="nav-group-header">Cortices</div>
      
      {activeCortexes.map((cortex) => (
        <CortexTreeItem
          key={cortex.id}
          cortex={cortex}
          expanded={expandedCortexes.has(cortex.id)}
          onToggle={() => toggleCortex(cortex.id)}
          expandedDomains={expandedDomains}
          onToggleDomain={toggleDomain}
          selection={selection}
          setSelection={setSelection}
        />
      ))}

      {/* Planned Section */}
      {plannedCortexes.length > 0 && (
        <>
          <div className="nav-group-header mt-4">Planned</div>
          {plannedCortexes.map((cortex) => (
            <div 
              key={cortex.id}
              className="nav-item opacity-50"
              onClick={() => setSelection({ type: 'cortex', id: cortex.id, cortexId: cortex.id })}
            >
              <CortexIcon color={cortex.color} />
              <span>{cortex.name}</span>
              <span className="ml-auto text-[10px] text-tertiary">planned</span>
            </div>
          ))}
        </>
      )}

      {/* World-specific sections */}
      {currentWorld === 'observe' && (
        <>
          <div className="divider" />
          <div className="nav-group-header">Pipelines</div>
          <div className="nav-item">
            <DomainIcon />
            <span>Inspection Pipeline</span>
          </div>
          <div className="nav-item">
            <DomainIcon />
            <span>Quality Gates</span>
          </div>
        </>
      )}

      {currentWorld === 'understand' && (
        <>
          <div className="divider" />
          <div className="nav-group-header">Reasoning</div>
          <div className="nav-item">
            <DomainIcon />
            <span>Energy Convergence</span>
          </div>
          <div className="nav-item">
            <DomainIcon />
            <span>Signal Agreement</span>
          </div>
          <div className="nav-item">
            <DomainIcon />
            <span>Decision Flow</span>
          </div>
        </>
      )}

      {currentWorld === 'evolve' && (
        <>
          <div className="divider" />
          <div className="nav-group-header">Roadmap</div>
          <div className="nav-item">
            <DomainIcon />
            <span>SCADA Integration</span>
          </div>
          <div className="nav-item">
            <DomainIcon />
            <span>Business Cortex</span>
          </div>
          <div className="nav-item">
            <DomainIcon />
            <span>Industrial Runtime</span>
          </div>
        </>
      )}

      {/* Bottom spacing */}
      <div className="h-8" />
    </div>
  )
}

/* ============================================
   CORTEX TREE ITEM
   ============================================ */

interface CortexTreeItemProps {
  cortex: typeof CORTEXES[0]
  expanded: boolean
  onToggle: () => void
  expandedDomains: Set<string>
  onToggleDomain: (id: string) => void
  selection: ReturnType<typeof useAppStore.getState>['selection']
  setSelection: ReturnType<typeof useAppStore.getState>['setSelection']
}

function CortexTreeItem({ 
  cortex, 
  expanded, 
  onToggle,
  expandedDomains,
  onToggleDomain,
  selection,
  setSelection
}: CortexTreeItemProps) {
  const isSelected = selection?.type === 'cortex' && selection.cortexId === cortex.id

  return (
    <div>
      {/* Cortex Row */}
      <div 
        className={`nav-item ${isSelected ? 'active' : ''}`}
        style={{ paddingLeft: '8px' }}
      >
        <button 
          onClick={(e) => { e.stopPropagation(); onToggle(); }}
          className="p-0.5 -ml-0.5 hover:bg-white/10 rounded"
        >
          <ChevronIcon expanded={expanded} />
        </button>
        <CortexIcon color={cortex.color} />
        <span 
          className="flex-1 cursor-pointer"
          onClick={() => setSelection({ type: 'cortex', id: cortex.id, cortexId: cortex.id })}
        >
          {cortex.name}
        </span>
        <span 
          className="text-[10px] opacity-40"
          style={{ color: cortex.color }}
        >
          {cortex.status}
        </span>
      </div>

      {/* Domains (when expanded) */}
      {expanded && (
        <div className="ml-4">
          {cortex.domains.map((domain) => {
            const domainKey = `${cortex.id}-${domain.id}`
            const isDomainExpanded = expandedDomains.has(domainKey)
            const isDomainSelected = selection?.type === 'domain' && 
              selection.cortexId === cortex.id && 
              selection.domainId === domain.id

            return (
              <div key={domain.id}>
                {/* Domain Row */}
                <div 
                  className={`nav-item ${isDomainSelected ? 'active' : ''}`}
                  style={{ paddingLeft: '8px' }}
                >
                  <button 
                    onClick={(e) => { e.stopPropagation(); onToggleDomain(domainKey); }}
                    className="p-0.5 -ml-0.5 hover:bg-white/10 rounded"
                  >
                    <ChevronIcon expanded={isDomainExpanded} />
                  </button>
                  <DomainIcon />
                  <span 
                    className="flex-1 cursor-pointer"
                    onClick={() => setSelection({ 
                      type: 'domain', 
                      id: domain.id, 
                      cortexId: cortex.id,
                      domainId: domain.id 
                    })}
                  >
                    {domain.name}
                  </span>
                  <span className="text-[10px] opacity-30">
                    {domain.modules.length}
                  </span>
                </div>

                {/* Modules (when domain expanded) */}
                {isDomainExpanded && (
                  <div className="ml-4">
                    {domain.modules.map((mod) => {
                      const isModuleSelected = selection?.type === 'module' && selection.id === mod.id
                      return (
                        <div 
                          key={mod.id}
                          className={`nav-item ${isModuleSelected ? 'active' : ''}`}
                          style={{ paddingLeft: '20px' }}
                          onClick={() => setSelection({
                            type: 'module',
                            id: mod.id,
                            cortexId: cortex.id,
                            domainId: domain.id
                          })}
                        >
                          <ModuleIcon />
                          <span className="text-secondary">{mod.name}</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
