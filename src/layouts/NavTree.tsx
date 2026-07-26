import { useState, useRef, useEffect, useCallback } from 'react'
import { useAppStore, CORTEXES } from '../stores/appStore'
import type { CortexId } from '../stores/appStore'

/* ============================================
   NAV TREE — Architecture IDE Sidebar
   - Global search (/ shortcut)
   - Collapse all / Expand all
   - Keyboard navigation (↑↓ arrows)
   - Module type icons
   - Accent bar on selected
   - Module count badges
   ============================================ */

// ── Module type detection ─────────────────────────────────────────────────────

type ModuleType =
  | 'reasoning' | 'memory' | 'database' | 'logging' | 'tracing'
  | 'voice' | 'api' | 'executive' | 'pipeline' | 'analytics'
  | 'observability' | 'investigation' | 'context' | 'security'
  | 'config' | 'retrieval' | 'vision' | 'intelligence' | 'generic'

function detectModuleType(name: string, domainId: string): ModuleType {
  const n = name.toLowerCase()
  const d = domainId.toLowerCase()
  if (n.includes('reasoning') || n.includes('energy') || n.includes('consolidat')) return 'reasoning'
  if (n.includes('memory') || n.includes('session') || n.includes('episodic')) return 'memory'
  if (n.includes('database') || n.includes('sql') || n.includes('persist') || n.includes('storage')) return 'database'
  if (n.includes('logging') || n.includes('telemetry') || n.includes('log')) return 'logging'
  if (n.includes('tracing') || n.includes('trace') || n.includes('provenance')) return 'tracing'
  if (n.includes('voice') || n.includes('tts') || n.includes('stt') || n.includes('wake') || n.includes('speech')) return 'voice'
  if (n.includes('api') || n.includes('rest') || n.includes('endpoint') || n.includes('batch')) return 'api'
  if (n.includes('orchestrat') || n.includes('executive') || n.includes('intent')) return 'executive'
  if (n.includes('pipeline') || n.includes('stage') || n.includes('gate') || n.includes('fast path') || n.includes('slow path')) return 'pipeline'
  if (n.includes('analytic') || n.includes('metric') || n.includes('stat') || n.includes('plant intel')) return 'analytics'
  if (n.includes('observ') || n.includes('monitor') || n.includes('health')) return 'observability'
  if (n.includes('invest') || n.includes('audit') || n.includes('debug')) return 'investigation'
  if (n.includes('context') || n.includes('compiler') || n.includes('assembl')) return 'context'
  if (n.includes('retrieval') || n.includes('retriev') || n.includes('planner') || n.includes('adapter')) return 'retrieval'
  if (n.includes('vision') || n.includes('yolo') || n.includes('patch') || n.includes('anomaly') || n.includes('detect')) return 'vision'
  if (n.includes('calibrat') || n.includes('fingerprint') || n.includes('prototype') || n.includes('scrata')) return 'intelligence'
  if (n.includes('licens') || n.includes('ota') || n.includes('deploy') || n.includes('embed')) return 'config'
  if (d.includes('voice')) return 'voice'
  if (d.includes('retrieval')) return 'retrieval'
  if (d.includes('observ')) return 'observability'
  return 'generic'
}

// ── Module type icons (inline SVG paths) ─────────────────────────────────────

function ModuleTypeIcon({ type, color = 'currentColor' }: { type: ModuleType; color?: string }) {
  const cls = `opacity-60 shrink-0`
  const size = 13

  const icons: Record<ModuleType, JSX.Element> = {
    reasoning:     <svg width={size} height={size} viewBox="0 0 14 14" fill="none" className={cls}><path d="M7 1L12 4V10L7 13L2 10V4L7 1Z" stroke={color} strokeWidth="1.2"/></svg>,
    memory:        <svg width={size} height={size} viewBox="0 0 14 14" fill="none" className={cls}><circle cx="7" cy="7" r="5" stroke={color} strokeWidth="1.2"/><path d="M5 7h4M7 5v4" stroke={color} strokeWidth="1.2" strokeLinecap="round"/></svg>,
    database:      <svg width={size} height={size} viewBox="0 0 14 14" fill="none" className={cls}><ellipse cx="7" cy="4" rx="4" ry="2" stroke={color} strokeWidth="1.2"/><path d="M3 4v6c0 1.1 1.8 2 4 2s4-.9 4-2V4" stroke={color} strokeWidth="1.2"/></svg>,
    logging:       <svg width={size} height={size} viewBox="0 0 14 14" fill="none" className={cls}><path d="M2 3h10M2 7h7M2 11h5" stroke={color} strokeWidth="1.2" strokeLinecap="round"/></svg>,
    tracing:       <svg width={size} height={size} viewBox="0 0 14 14" fill="none" className={cls}><path d="M2 12L5 7L8 9L12 3" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    voice:         <svg width={size} height={size} viewBox="0 0 14 14" fill="none" className={cls}><rect x="5" y="2" width="4" height="6" rx="2" stroke={color} strokeWidth="1.2"/><path d="M3 8a4 4 0 008 0M7 12v2" stroke={color} strokeWidth="1.2" strokeLinecap="round"/></svg>,
    api:           <svg width={size} height={size} viewBox="0 0 14 14" fill="none" className={cls}><path d="M2 7h10M8 4l3 3-3 3" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    executive:     <svg width={size} height={size} viewBox="0 0 14 14" fill="none" className={cls}><circle cx="7" cy="7" r="2.5" fill={color} opacity="0.8"/><circle cx="7" cy="7" r="5" stroke={color} strokeWidth="1.2"/></svg>,
    pipeline:      <svg width={size} height={size} viewBox="0 0 14 14" fill="none" className={cls}><path d="M2 4h10M2 7h10M2 10h10" stroke={color} strokeWidth="1.2" strokeLinecap="round"/><circle cx="5" cy="4" r="1.2" fill={color}/><circle cx="9" cy="7" r="1.2" fill={color}/><circle cx="5" cy="10" r="1.2" fill={color}/></svg>,
    analytics:     <svg width={size} height={size} viewBox="0 0 14 14" fill="none" className={cls}><path d="M2 10L5 6L8 8L12 3" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 13h10" stroke={color} strokeWidth="1.2" strokeLinecap="round"/></svg>,
    observability: <svg width={size} height={size} viewBox="0 0 14 14" fill="none" className={cls}><circle cx="7" cy="7" r="3" stroke={color} strokeWidth="1.2"/><path d="M2 7C3.5 4 5.5 2.5 7 2.5S10.5 4 12 7c-1.5 3-3.5 4.5-5 4.5S3.5 10 2 7z" stroke={color} strokeWidth="1.2"/></svg>,
    investigation: <svg width={size} height={size} viewBox="0 0 14 14" fill="none" className={cls}><circle cx="6" cy="6" r="3.5" stroke={color} strokeWidth="1.2"/><path d="M9 9l3 3" stroke={color} strokeWidth="1.5" strokeLinecap="round"/></svg>,
    context:       <svg width={size} height={size} viewBox="0 0 14 14" fill="none" className={cls}><rect x="2" y="2" width="4" height="4" rx="1" stroke={color} strokeWidth="1.2"/><rect x="8" y="2" width="4" height="4" rx="1" stroke={color} strokeWidth="1.2"/><rect x="5" y="8" width="4" height="4" rx="1" stroke={color} strokeWidth="1.2"/></svg>,
    retrieval:     <svg width={size} height={size} viewBox="0 0 14 14" fill="none" className={cls}><circle cx="7" cy="6" r="3.5" stroke={color} strokeWidth="1.2"/><path d="M7 9.5v3M5 11h4" stroke={color} strokeWidth="1.2" strokeLinecap="round"/></svg>,
    vision:        <svg width={size} height={size} viewBox="0 0 14 14" fill="none" className={cls}><rect x="2" y="3" width="10" height="8" rx="1.5" stroke={color} strokeWidth="1.2"/><circle cx="7" cy="7" r="2" stroke={color} strokeWidth="1.2"/></svg>,
    intelligence:  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" className={cls}><path d="M7 2L9.5 5H12L10 7.5L11 11L7 9L3 11L4 7.5L2 5H4.5L7 2Z" stroke={color} strokeWidth="1.2"/></svg>,
    security:      <svg width={size} height={size} viewBox="0 0 14 14" fill="none" className={cls}><path d="M7 2L12 4.5V8C12 10.5 9.8 12.5 7 13 4.2 12.5 2 10.5 2 8V4.5L7 2Z" stroke={color} strokeWidth="1.2"/></svg>,
    config:        <svg width={size} height={size} viewBox="0 0 14 14" fill="none" className={cls}><circle cx="7" cy="7" r="2" stroke={color} strokeWidth="1.2"/><path d="M7 1v2M7 11v2M1 7h2M11 7h2M3 3l1.5 1.5M9.5 9.5L11 11M3 11l1.5-1.5M9.5 4.5L11 3" stroke={color} strokeWidth="1.2" strokeLinecap="round"/></svg>,
    generic:       <svg width={size} height={size} viewBox="0 0 14 14" fill="none" className={cls}><circle cx="7" cy="7" r="2.5" stroke={color} strokeWidth="1.2"/></svg>,
  }
  return icons[type] ?? icons.generic
}

// ── Main NavTree ──────────────────────────────────────────────────────────────

export function NavTree() {
  const selection      = useAppStore((s) => s.selection)
  const setSelection   = useAppStore((s) => s.setSelection)
  const searchQuery    = useAppStore((s) => s.searchQuery)
  const setSearchQuery = useAppStore((s) => s.setSearchQuery)

  const [expandedCortexes, setExpandedCortexes] = useState<Set<CortexId>>(new Set(['vajra']))
  const [expandedDomains,  setExpandedDomains]  = useState<Set<string>>(new Set())
  const searchRef = useRef<HTMLInputElement>(null)

  // Listen for '/' shortcut from AppShell
  useEffect(() => {
    const handler = () => {
      if (searchRef.current) {
        searchRef.current.focus()
        searchRef.current.select()
      }
    }
    window.addEventListener('focus-search', handler)
    return () => window.removeEventListener('focus-search', handler)
  }, [])

  const activeCortexes  = CORTEXES.filter(c => c.status === 'active' || c.status === 'stable')
  const plannedCortexes = CORTEXES.filter(c => c.status === 'planned')

  // Filter cortexes by search
  const filterMatch = useCallback((text: string) =>
    !searchQuery.trim() || text.toLowerCase().includes(searchQuery.toLowerCase()), [searchQuery])

  // When search is active, auto-expand matching cortexes
  useEffect(() => {
    if (!searchQuery.trim()) return
    const q = searchQuery.toLowerCase()
    const toExpand = new Set<CortexId>()
    const domainsToExpand = new Set<string>()
    CORTEXES.forEach(c => {
      let matchesCortex = c.name.toLowerCase().includes(q) || c.role.toLowerCase().includes(q)
      c.domains.forEach(d => {
        let matchesDomain = d.name.toLowerCase().includes(q)
        d.modules.forEach(m => {
          if (m.name.toLowerCase().includes(q) || (m.description || '').toLowerCase().includes(q)) {
            matchesDomain = true
            matchesCortex = true
          }
        })
        if (matchesDomain) { toExpand.add(c.id); domainsToExpand.add(`${c.id}-${d.id}`) }
      })
      if (matchesCortex) toExpand.add(c.id)
    })
    setExpandedCortexes(toExpand)
    setExpandedDomains(domainsToExpand)
  }, [searchQuery])

  const expandAll  = () => {
    setExpandedCortexes(new Set(CORTEXES.map(c => c.id) as CortexId[]))
    const allDomains = new Set<string>()
    CORTEXES.forEach(c => c.domains.forEach(d => allDomains.add(`${c.id}-${d.id}`)))
    setExpandedDomains(allDomains)
  }
  const collapseAll = () => { setExpandedCortexes(new Set()); setExpandedDomains(new Set()) }

  const toggleCortex = (id: CortexId) => {
    const next = new Set(expandedCortexes)
    next.has(id) ? next.delete(id) : next.add(id)
    setExpandedCortexes(next)
  }
  const toggleDomain = (key: string) => {
    const next = new Set(expandedDomains)
    next.has(key) ? next.delete(key) : next.add(key)
    setExpandedDomains(next)
  }

  const totalModules = activeCortexes.reduce((a, c) => a + c.domains.reduce((b, d) => b + d.modules.length, 0), 0)

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Search bar */}
      <div className="px-4 pt-5 pb-4 flex-shrink-0">
        <div className="relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-tertiary pointer-events-none"
            width="16" height="16" viewBox="0 0 12 12" fill="none">
            <circle cx="5" cy="5" r="3.5" stroke="currentColor" strokeWidth="1.4"/>
            <path d="M8 8l2.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          <input
            ref={searchRef}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => { if (e.key === 'Escape') { setSearchQuery(''); searchRef.current?.blur() } }}
            placeholder="Search architecture…"
            className="w-full pl-12 pr-10 rounded-xl bg-[var(--bg-elevated)] border-2 border-[var(--border-default)] text-primary placeholder:text-tertiary outline-none focus:border-[var(--brand-accent)] transition-colors"
            style={{ fontSize: 15, height: 48, lineHeight: '48px' }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-tertiary hover:text-primary"
            >
              <svg width="14" height="14" viewBox="0 0 10 10" fill="none">
                <path d="M2 2l6 6M8 2l-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Collapse/Expand toolbar */}
      <div className="flex items-center justify-between px-4 pb-3 flex-shrink-0">
        <span className="text-xs text-tertiary">{totalModules} modules</span>
        <div className="flex gap-1">
          <button onClick={collapseAll} title="Collapse all"
            className="px-2 py-1 text-xs text-tertiary hover:text-primary hover:bg-[var(--bg-hover)] rounded transition-colors">
            ⊟
          </button>
          <button onClick={expandAll} title="Expand all"
            className="px-2 py-1 text-xs text-tertiary hover:text-primary hover:bg-[var(--bg-hover)] rounded transition-colors">
            ⊞
          </button>
        </div>
      </div>

      <div className="divider mx-3 mt-0 mb-2" />

      {/* Tree */}
      <div className="flex-1 overflow-y-auto py-1 px-2">
        {/* Overview item */}
        <div
          className={`nav-item mb-1 ${!selection ? 'active' : ''}`}
          onClick={() => { setSelection(null); setSearchQuery('') }}
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" className="opacity-50 shrink-0">
            <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.3"/>
            <circle cx="6.5" cy="6.5" r="2" fill="currentColor"/>
          </svg>
          <span>Overview</span>
        </div>

        {/* Active cortexes */}
        <div className="nav-group-header mt-2">Cortices</div>
        {activeCortexes.map(cortex => (
          <CortexTreeItem
            key={cortex.id}
            cortex={cortex}
            expanded={expandedCortexes.has(cortex.id)}
            onToggle={() => toggleCortex(cortex.id)}
            expandedDomains={expandedDomains}
            onToggleDomain={toggleDomain}
            selection={selection}
            setSelection={setSelection}
            searchQuery={searchQuery}
            filterMatch={filterMatch}
          />
        ))}

        {/* Planned cortexes */}
        {plannedCortexes.length > 0 && (
          <>
            <div className="nav-group-header mt-3">Planned</div>
            {plannedCortexes.map(cortex => (
              <div
                key={cortex.id}
                className={`nav-item opacity-45 ${selection?.cortexId === cortex.id ? 'active' : ''}`}
                onClick={() => setSelection({ type: 'cortex', id: cortex.id, cortexId: cortex.id })}
              >
                <div className="w-2.5 h-2.5 rounded-sm shrink-0 border opacity-60"
                  style={{ borderColor: cortex.color }} />
                <span className="flex-1">{cortex.name}</span>
                <span className="text-[10px] text-tertiary">planned</span>
              </div>
            ))}
          </>
        )}

        <div className="h-6" />
      </div>
    </div>
  )
}

// ── Cortex tree item ──────────────────────────────────────────────────────────

interface CortexTreeItemProps {
  cortex: typeof CORTEXES[0]
  expanded: boolean
  onToggle: () => void
  expandedDomains: Set<string>
  onToggleDomain: (key: string) => void
  selection: ReturnType<typeof useAppStore.getState>['selection']
  setSelection: ReturnType<typeof useAppStore.getState>['setSelection']
  searchQuery: string
  filterMatch: (text: string) => boolean
}

function CortexTreeItem({
  cortex, expanded, onToggle, expandedDomains, onToggleDomain,
  selection, setSelection, searchQuery, filterMatch,
}: CortexTreeItemProps) {
  const isSelected = selection?.type === 'cortex' && selection.cortexId === cortex.id
  const moduleCount = cortex.domains.reduce((a, d) => a + d.modules.length, 0)

  // In search mode, only show if any child matches
  const hasMatch = !searchQuery.trim() || cortex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cortex.domains.some(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.modules.some(m => m.name.toLowerCase().includes(searchQuery.toLowerCase())))
  if (!hasMatch) return null

  return (
    <div>
      <div
        className={`nav-item ${isSelected ? 'active' : ''} relative`}
        style={{ paddingLeft: '8px' }}
      >
        {/* Cortex color accent bar */}
        {isSelected && (
          <div className="absolute left-0 top-1 bottom-1 w-0.5 rounded-full"
            style={{ backgroundColor: cortex.color }} />
        )}
        <button
          onClick={e => { e.stopPropagation(); onToggle() }}
          className="p-0.5 hover:bg-[var(--bg-hover)] rounded shrink-0"
        >
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none"
            className={`transition-transform duration-150 text-tertiary ${expanded ? 'rotate-90' : ''}`}>
            <path d="M3.5 2.5L7 5.5L3.5 8.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
        </button>
        <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: cortex.color }} />
        <span className="flex-1 cursor-pointer font-medium"
          onClick={() => setSelection({ type: 'cortex', id: cortex.id, cortexId: cortex.id })}>
          {cortex.name}
        </span>
        <span className="text-[10px] shrink-0 px-1.5 py-0.5 rounded"
          style={{ backgroundColor: cortex.colorSubtle, color: cortex.color }}>
          {moduleCount}
        </span>
      </div>

      {/* Domains */}
      {expanded && (
        <div className="ml-3 border-l border-[var(--border-subtle)]">
          {cortex.domains.map(domain => {
            const key = `${cortex.id}-${domain.id}`
            const isDomainExpanded = expandedDomains.has(key)
            const isDomainSelected = selection?.type === 'domain' &&
              selection.cortexId === cortex.id && selection.domainId === domain.id

            // Filter domains
            const domainMatch = !searchQuery.trim() || domain.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              domain.modules.some(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()))
            if (!domainMatch) return null

            return (
              <div key={domain.id} className="ml-1">
                <div className={`nav-item ${isDomainSelected ? 'active' : ''}`} style={{ paddingLeft: '6px' }}>
                  <button
                    onClick={e => { e.stopPropagation(); onToggleDomain(key) }}
                    className="p-0.5 hover:bg-[var(--bg-hover)] rounded shrink-0"
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
                      className={`transition-transform duration-150 text-tertiary ${isDomainExpanded ? 'rotate-90' : ''}`}>
                      <path d="M3 2L7 5L3 8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                    </svg>
                  </button>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="opacity-40 shrink-0">
                    <rect x="1" y="1" width="4" height="4" rx="0.8" stroke="currentColor" strokeWidth="1.1"/>
                    <rect x="7" y="1" width="4" height="4" rx="0.8" stroke="currentColor" strokeWidth="1.1"/>
                    <rect x="1" y="7" width="4" height="4" rx="0.8" stroke="currentColor" strokeWidth="1.1"/>
                    <rect x="7" y="7" width="4" height="4" rx="0.8" stroke="currentColor" strokeWidth="1.1"/>
                  </svg>
                  <span className="flex-1 cursor-pointer text-secondary hover:text-primary text-xs"
                    onClick={() => setSelection({ type: 'domain', id: domain.id, cortexId: cortex.id, domainId: domain.id })}>
                    {domain.name}
                  </span>
                  <span className="text-[10px] text-tertiary shrink-0">{domain.modules.length}</span>
                </div>

                {/* Modules */}
                {isDomainExpanded && (
                  <div className="ml-3 border-l border-[var(--border-subtle)]">
                    {domain.modules.map(mod => {
                      const modMatch = !searchQuery.trim() ||
                        mod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (mod.description || '').toLowerCase().includes(searchQuery.toLowerCase())
                      if (!modMatch) return null
                      const isModSelected = selection?.type === 'module' && selection.id === mod.id
                      const modType = detectModuleType(mod.name, domain.id)
                      return (
                        <div
                          key={mod.id}
                          className={`nav-item ml-1 ${isModSelected ? 'active' : ''}`}
                          style={{ paddingLeft: '8px' }}
                          onClick={() => setSelection({ type: 'module', id: mod.id, cortexId: cortex.id, domainId: domain.id })}
                        >
                          <ModuleTypeIcon type={modType} color={cortex.color} />
                          <span className="text-secondary text-xs truncate"
                            style={{ color: isModSelected ? cortex.color : undefined }}>
                            {mod.name}
                          </span>
                          {searchQuery && mod.description?.toLowerCase().includes(searchQuery.toLowerCase()) && (
                            <span className="ml-auto text-[9px] text-tertiary truncate max-w-[60px]">
                              {mod.description}
                            </span>
                          )}
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
