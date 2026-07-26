import { useRef, useState, useCallback, useEffect, useMemo } from 'react'
import { useAppStore, CORTEXES } from '../stores/appStore'
import type { CortexId, LayoutMode, RuntimeStatus } from '../stores/appStore'

/* ============================================
   ARCHITECTURE GRAPH
   SVG-based interactive graph engine
   Supports: zoom, pan, focus mode, edge types,
   node tooltips, minimap, layout switching
   ============================================ */

// ── Layout computation ────────────────────────────────────────────────────────

const GRAPH_W = 900
const GRAPH_H = 600

// Returns node positions for each layout mode (in SVG coordinate space)
function computeLayout(mode: LayoutMode): Record<CortexId, { x: number; y: number; r: number }> {
  switch (mode) {
    case 'architecture':
      return {
        vajra:    { x: 450, y: 140, r: 52 },
        piras:    { x: 230, y: 340, r: 44 },
        client:   { x: 670, y: 340, r: 44 },
        scada:    { x: 160, y: 510, r: 34 },
        business: { x: 740, y: 510, r: 34 },
      }
    case 'dependencies':
      return {
        vajra:    { x: 450, y: 120, r: 52 },
        piras:    { x: 220, y: 320, r: 44 },
        client:   { x: 680, y: 320, r: 44 },
        scada:    { x: 150, y: 500, r: 34 },
        business: { x: 750, y: 500, r: 34 },
      }
    case 'dataflow':
      // Horizontal left-to-right pipeline flow
      return {
        scada:    { x: 110, y: 300, r: 32 },
        piras:    { x: 280, y: 300, r: 44 },
        client:   { x: 450, y: 180, r: 40 },
        vajra:    { x: 620, y: 300, r: 52 },
        business: { x: 800, y: 300, r: 32 },
      }
    case 'runtime':
      // Concentric — active cortexes inner ring
      return {
        vajra:    { x: 450, y: 290, r: 52 },
        piras:    { x: 230, y: 200, r: 44 },
        client:   { x: 670, y: 200, r: 44 },
        scada:    { x: 230, y: 400, r: 34 },
        business: { x: 670, y: 400, r: 34 },
      }
    case 'package':
      // Tvastr at center, cortexes radially
      return {
        vajra:    { x: 450, y: 140, r: 52 },
        piras:    { x: 180, y: 320, r: 44 },
        client:   { x: 720, y: 320, r: 44 },
        scada:    { x: 230, y: 510, r: 32 },
        business: { x: 670, y: 510, r: 32 },
      }
    default:
      return computeLayout('architecture')
  }
}

// ── Edge rendering ────────────────────────────────────────────────────────────

const EDGE_COLORS: Record<string, string> = {
  orchestration: '#D97706',
  retrieval:     '#3B82F6',
  context:       '#10B981',
  event:         '#8B5CF6',
  automation:    '#06B6D4',
}

const EDGE_TYPE_LABEL: Record<string, string> = {
  orchestration: 'orchestrates',
  retrieval:     'retrieves',
  context:       'mounts context',
  event:         'streams events',
  automation:    'feeds data',
}

function getEdgeStyle(type: string): { strokeDasharray: string; strokeWidth: number; animated: boolean } {
  switch (type) {
    case 'orchestration': return { strokeDasharray: 'none', strokeWidth: 2.5, animated: false }
    case 'retrieval':     return { strokeDasharray: 'none', strokeWidth: 2,   animated: false }
    case 'context':       return { strokeDasharray: '6 3',  strokeWidth: 1.5, animated: false }
    case 'event':         return { strokeDasharray: '6 3',  strokeWidth: 1.5, animated: true }
    case 'automation':    return { strokeDasharray: '2 4',  strokeWidth: 1.5, animated: false }
    default:              return { strokeDasharray: '4 4',  strokeWidth: 1,   animated: false }
  }
}

// ── Runtime status indicators ─────────────────────────────────────────────────

const STATUS_COLOR: Record<RuntimeStatus, string> = {
  running:      '#22c55e',
  stopped:      '#ef4444',
  warning:      '#f59e0b',
  initializing: '#3b82f6',
  planned:      '#6b7280',
}

// ── Main component ────────────────────────────────────────────────────────────

export function ArchitectureGraph() {
  const selection       = useAppStore((s) => s.selection)
  const setSelection    = useAppStore((s) => s.setSelection)
  const layoutMode      = useAppStore((s) => s.layoutMode)
  const focusMode       = useAppStore((s) => s.focusMode)
  const setFocusMode    = useAppStore((s) => s.setFocusMode)
  const hoveredNode     = useAppStore((s) => s.hoveredNode)
  const setHoveredNode  = useAppStore((s) => s.setHoveredNode)
  const runtimeStatus   = useAppStore((s) => s.runtimeStatus)
  const minimapVisible  = useAppStore((s) => s.minimapVisible)
  const searchQuery     = useAppStore((s) => s.searchQuery)

  const svgRef = useRef<SVGSVGElement>(null)
  const [viewBox, setViewBox] = useState({ x: -60, y: -40, w: GRAPH_W + 120, h: GRAPH_H + 80 })
  const isPanning = useRef(false)
  const panStart  = useRef({ x: 0, y: 0, vbx: 0, vby: 0 })

  const positions = useMemo(() => computeLayout(layoutMode), [layoutMode])

  // Determine selected cortex ID
  const selectedCortexId = selection?.cortexId ?? null

  // Compute which cortexes are "connected" to selected (for focus mode)
  const connectedIds = useMemo((): Set<string> => {
    if (!selectedCortexId) return new Set()
    const ids = new Set<string>([selectedCortexId])
    CORTEXES.forEach(c => {
      c.connections.forEach(conn => {
        if (c.id === selectedCortexId) ids.add(conn.target)
        if (conn.target === selectedCortexId) ids.add(c.id)
      })
    })
    return ids
  }, [selectedCortexId])

  // Search match
  const matchedIds = useMemo((): Set<string> => {
    if (!searchQuery.trim()) return new Set()
    const q = searchQuery.toLowerCase()
    const ids = new Set<string>()
    CORTEXES.forEach(c => {
      if (c.name.toLowerCase().includes(q) || c.role.toLowerCase().includes(q)) ids.add(c.id)
      c.domains.forEach(d => {
        if (d.name.toLowerCase().includes(q)) ids.add(c.id)
        d.modules.forEach(m => {
          if (m.name.toLowerCase().includes(q)) ids.add(c.id)
        })
      })
    })
    return ids
  }, [searchQuery])

  // Pan handlers
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as SVGElement).closest('.graph-node')) return
    isPanning.current = true
    panStart.current = { x: e.clientX, y: e.clientY, vbx: viewBox.x, vby: viewBox.y }
    e.preventDefault()
  }, [viewBox])

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning.current || !svgRef.current) return
    const rect = svgRef.current.getBoundingClientRect()
    const scaleX = viewBox.w / rect.width
    const scaleY = viewBox.h / rect.height
    const dx = (e.clientX - panStart.current.x) * scaleX
    const dy = (e.clientY - panStart.current.y) * scaleY
    setViewBox(v => ({ ...v, x: panStart.current.vbx - dx, y: panStart.current.vby - dy }))
  }, [viewBox.w, viewBox.h])

  const onMouseUp = useCallback(() => { isPanning.current = false }, [])

  // Zoom via wheel
  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    if (!svgRef.current) return
    const factor = e.deltaY > 0 ? 1.1 : 0.9
    const rect = svgRef.current.getBoundingClientRect()
    const mx = viewBox.x + ((e.clientX - rect.left) / rect.width) * viewBox.w
    const my = viewBox.y + ((e.clientY - rect.top) / rect.height) * viewBox.h
    setViewBox(v => ({
      x: mx - (mx - v.x) * factor,
      y: my - (my - v.y) * factor,
      w: v.w * factor,
      h: v.h * factor,
    }))
  }, [viewBox])

  // Reset view
  const resetView = () => setViewBox({ x: -60, y: -40, w: GRAPH_W + 120, h: GRAPH_H + 80 })

  // Node opacity based on focus/search state
  function nodeOpacity(id: string): number {
    if (searchQuery.trim()) return matchedIds.has(id) ? 1 : 0.2
    if (focusMode && selectedCortexId) return connectedIds.has(id) ? 1 : 0.1
    return 1
  }

  // Edge opacity based on focus/search state
  function edgeOpacity(sourceId: string, targetId: string): number {
    if (searchQuery.trim()) return 0.15
    if (focusMode && selectedCortexId) {
      return (connectedIds.has(sourceId) && connectedIds.has(targetId)) ? 0.85 : 0.05
    }
    return 0.55
  }

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Layout toolbar */}
      <LayoutToolbar />

      {/* Main SVG */}
      <svg
        ref={svgRef}
        className="w-full h-full"
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onWheel={onWheel}
        style={{ cursor: isPanning.current ? 'grabbing' : 'default' }}
      >
        <defs>
          {/* Animated dash offset for event edges */}
          <style>{`
            .edge-animated { animation: dashFlow 1.2s linear infinite; }
            @keyframes dashFlow { to { stroke-dashoffset: -18; } }
            .node-pulse { animation: nodePulse 2s ease-in-out infinite; }
            @keyframes nodePulse { 0%,100%{opacity:0.6;r:5} 50%{opacity:1;r:7} }
          `}</style>
          {/* Arrowhead markers per edge type */}
          {Object.entries(EDGE_COLORS).map(([type, color]) => (
            <marker key={type} id={`arrow-${type}`} markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
              <path d="M0,0 L0,6 L8,3 z" fill={color} opacity="0.7" />
            </marker>
          ))}
          {/* Glow filter */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Background dot grid */}
        <pattern id="dotgrid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
          <circle cx="20" cy="20" r="1" fill="var(--border-subtle)" opacity="0.5" />
        </pattern>
        <rect x={viewBox.x} y={viewBox.y} width={viewBox.w} height={viewBox.h} fill="url(#dotgrid)" />

        {/* Tvastr label */}
        <text x="450" y="50" textAnchor="middle" fontSize="11" fill="var(--text-tertiary)" letterSpacing="4" fontWeight="600">
          TVASTR INDUSTRIAL COGNITION
        </text>

        {/* Edges */}
        <GraphEdges positions={positions} edgeOpacity={edgeOpacity} layoutMode={layoutMode} />

        {/* Cortex nodes */}
        {CORTEXES.map(cortex => (
          <CortexNode
            key={cortex.id}
            cortex={cortex}
            pos={positions[cortex.id]}
            isSelected={selection?.cortexId === cortex.id}
            isHovered={hoveredNode === cortex.id}
            opacity={nodeOpacity(cortex.id)}
            status={runtimeStatus[cortex.id]}
            onSelect={() => {
              setSelection({ type: 'cortex', id: cortex.id, cortexId: cortex.id })
              if (!focusMode) setFocusMode(true)
            }}
            onHover={setHoveredNode}
          />
        ))}

        {/* Tooltip */}
        {hoveredNode && !isPanning.current && (
          <NodeTooltip
            cortexId={hoveredNode as CortexId}
            pos={positions[hoveredNode as CortexId]}
            status={runtimeStatus[hoveredNode as CortexId]}
          />
        )}
      </svg>

      {/* Reset + focus controls */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-2">
        {minimapVisible && <Minimap positions={positions} viewBox={viewBox} selectedId={selectedCortexId} />}
        <div className="flex gap-1">
          <ControlButton onClick={resetView} title="Reset view">⊕</ControlButton>
          <ControlButton
            onClick={() => { setFocusMode(!focusMode) }}
            title={focusMode ? 'Exit focus mode (F)' : 'Focus mode (F)'}
            active={focusMode}
          >⊙</ControlButton>
        </div>
      </div>

      {/* Clear focus on background click */}
      {focusMode && !hoveredNode && (
        <div
          className="absolute inset-0 pointer-events-none"
          onClick={() => { setFocusMode(false); setSelection(null) }}
        />
      )}
    </div>
  )
}

// ── Edges ─────────────────────────────────────────────────────────────────────

function GraphEdges({
  positions,
  edgeOpacity,
  layoutMode,
}: {
  positions: Record<CortexId, { x: number; y: number; r: number }>
  edgeOpacity: (s: string, t: string) => number
  layoutMode: LayoutMode
}) {
  const edges: { source: CortexId; target: CortexId; type: string; label: string; strength: number }[] = []
  CORTEXES.forEach(c => {
    c.connections.forEach(conn => {
      edges.push({ source: c.id, target: conn.target, type: conn.type, label: conn.label, strength: conn.strength })
    })
  })

  return (
    <g>
      {edges.map((edge, i) => {
        const src = positions[edge.source]
        const tgt = positions[edge.target]
        if (!src || !tgt) return null
        const style = getEdgeStyle(edge.type)
        const color = EDGE_COLORS[edge.type] || '#6b7280'
        const opacity = edgeOpacity(edge.source, edge.target)

        // Compute points offset from node radii
        const dx = tgt.x - src.x
        const dy = tgt.y - src.y
        const len = Math.sqrt(dx * dx + dy * dy)
        const ux = dx / len, uy = dy / len
        const x1 = src.x + ux * (src.r + 4)
        const y1 = src.y + uy * (src.r + 4)
        const x2 = tgt.x - ux * (tgt.r + 10)
        const y2 = tgt.y - uy * (tgt.r + 10)

        // Curved control point
        const cx = (x1 + x2) / 2 - dy * 0.15
        const cy = (y1 + y2) / 2 + dx * 0.15
        const d = `M${x1},${y1} Q${cx},${cy} ${x2},${y2}`

        // Label midpoint
        const lx = (x1 + x2) / 2 - dy * 0.1
        const ly = (y1 + y2) / 2 + dx * 0.1

        return (
          <g key={i} opacity={opacity}>
            <path
              d={d}
              fill="none"
              stroke={color}
              strokeWidth={style.strokeWidth}
              strokeDasharray={style.strokeDasharray === 'none' ? undefined : style.strokeDasharray}
              strokeDashoffset={style.animated ? 0 : undefined}
              className={style.animated ? 'edge-animated' : undefined}
              markerEnd={`url(#arrow-${edge.type})`}
            />
            {/* Edge label on hover — always shown at low opacity */}
            <text x={lx} y={ly} textAnchor="middle" fontSize="9" fill={color} opacity="0.7">
              {EDGE_TYPE_LABEL[edge.type] || edge.type}
            </text>
          </g>
        )
      })}
    </g>
  )
}

// ── Cortex node ───────────────────────────────────────────────────────────────

function CortexNode({
  cortex,
  pos,
  isSelected,
  isHovered,
  opacity,
  status,
  onSelect,
  onHover,
}: {
  cortex: typeof CORTEXES[0]
  pos: { x: number; y: number; r: number }
  isSelected: boolean
  isHovered: boolean
  opacity: number
  status: RuntimeStatus
  onSelect: () => void
  onHover: (id: string | null) => void
}) {
  const isPlanned = cortex.status === 'planned'
  const scale = isSelected || isHovered ? 1.12 : 1
  const domainCount = cortex.domains.length
  const moduleCount = cortex.domains.reduce((a, d) => a + d.modules.length, 0)

  return (
    <g
      className="graph-node"
      transform={`translate(${pos.x},${pos.y}) scale(${scale})`}
      style={{ transformOrigin: `${pos.x}px ${pos.y}px`, transition: 'all 0.2s ease', cursor: 'pointer', opacity }}
      onClick={onSelect}
      onMouseEnter={() => onHover(cortex.id)}
      onMouseLeave={() => onHover(null)}
    >
      {/* Selection / hover glow ring */}
      {(isSelected || isHovered) && (
        <circle
          cx={0} cy={0} r={pos.r + 10}
          fill={cortex.colorSubtle}
          stroke={cortex.color}
          strokeWidth={isSelected ? 2 : 1}
          strokeOpacity={isSelected ? 0.8 : 0.4}
          filter="url(#glow)"
        />
      )}

      {/* Main circle */}
      <circle
        cx={0} cy={0} r={pos.r}
        fill={isPlanned ? 'transparent' : cortex.colorSubtle}
        stroke={cortex.color}
        strokeWidth={isSelected ? 2.5 : 1.5}
        strokeDasharray={isPlanned ? '5 3' : undefined}
      />

      {/* Inner core */}
      {!isPlanned && (
        <circle cx={0} cy={0} r={pos.r * 0.32} fill={cortex.color} opacity={0.9} />
      )}

      {/* Runtime status indicator */}
      <circle
        cx={pos.r * 0.72} cy={-pos.r * 0.72} r={5}
        fill={STATUS_COLOR[status]}
        stroke="var(--bg-space)"
        strokeWidth={1.5}
        className={status === 'running' ? 'node-pulse' : undefined}
      />

      {/* Cortex name — rendered outside the fill with high contrast */}
      <text
        x={0} y={pos.r * 0.25}
        textAnchor="middle"
        fontSize={pos.r > 40 ? 14 : 12}
        fontWeight="700"
        fill="#ffffff"
        style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.9))' }}
        letterSpacing="0.5"
      >
        {cortex.name}
      </text>

      {/* Role label below node */}
      <text
        x={0} y={pos.r + 18}
        textAnchor="middle"
        fontSize={10}
        fill="var(--text-secondary)"
        fontWeight="500"
      >
        {cortex.role.length > 30 ? cortex.role.slice(0, 30) + '…' : cortex.role}
      </text>

      {/* Domain / module count badges */}
      <text
        x={0} y={pos.r + 31}
        textAnchor="middle"
        fontSize={9}
        fill="var(--text-tertiary)"
      >
        {domainCount}d · {moduleCount}m
      </text>

      {/* Planned badge */}
      {isPlanned && (
        <text x={0} y={12} textAnchor="middle" fontSize={9} fill={cortex.color} opacity={0.6}>
          planned
        </text>
      )}
    </g>
  )
}

// ── Tooltip ───────────────────────────────────────────────────────────────────

function NodeTooltip({
  cortexId,
  pos,
  status,
}: {
  cortexId: CortexId
  pos: { x: number; y: number; r: number }
  status: RuntimeStatus
}) {
  const cortex = CORTEXES.find(c => c.id === cortexId)
  if (!cortex) return null
  const moduleCount = cortex.domains.reduce((a, d) => a + d.modules.length, 0)
  const connCount = cortex.connections.length
  const tx = pos.x
  const ty = pos.y - pos.r - 60

  return (
    <g pointerEvents="none">
      <rect x={tx - 90} y={ty} width={180} height={52} rx={6}
        fill="var(--bg-elevated)" stroke="var(--border-default)" strokeWidth={1} opacity={0.97} />
      <text x={tx} y={ty + 14} textAnchor="middle" fontSize={11} fontWeight="600" fill={cortex.color}>
        {cortex.fullName}
      </text>
      <text x={tx} y={ty + 26} textAnchor="middle" fontSize={9} fill="var(--text-secondary)">
        {cortex.role.length > 36 ? cortex.role.slice(0, 36) + '…' : cortex.role}
      </text>
      <text x={tx} y={ty + 40} textAnchor="middle" fontSize={9} fill="var(--text-tertiary)">
        {cortex.domains.length} domains · {moduleCount} modules · {connCount} connections · {status}
      </text>
    </g>
  )
}

// ── Minimap ───────────────────────────────────────────────────────────────────

function Minimap({
  positions,
  viewBox,
  selectedId,
}: {
  positions: Record<CortexId, { x: number; y: number; r: number }>
  viewBox: { x: number; y: number; w: number; h: number }
  selectedId: string | null
}) {
  const MM_W = 120, MM_H = 80
  const scaleX = MM_W / (GRAPH_W + 120)
  const scaleY = MM_H / (GRAPH_H + 80)

  return (
    <div className="rounded border border-[var(--border-default)] overflow-hidden"
      style={{ background: 'var(--bg-elevated)', opacity: 0.9 }}>
      <svg width={MM_W} height={MM_H} viewBox={`-60 -40 ${GRAPH_W + 120} ${GRAPH_H + 80}`}>
        {CORTEXES.map(c => {
          const p = positions[c.id]
          return (
            <circle key={c.id} cx={p.x} cy={p.y} r={p.r * 0.7}
              fill={c.colorSubtle} stroke={c.color} strokeWidth={2}
              opacity={selectedId === c.id ? 1 : 0.6} />
          )
        })}
        {/* Viewport indicator */}
        <rect
          x={viewBox.x} y={viewBox.y} width={viewBox.w} height={viewBox.h}
          fill="none" stroke="var(--brand-accent)" strokeWidth={8} opacity={0.5} />
      </svg>
    </div>
  )
}

// ── Layout toolbar ────────────────────────────────────────────────────────────

function LayoutToolbar() {
  const layoutMode    = useAppStore((s) => s.layoutMode)
  const setLayoutMode = useAppStore((s) => s.setLayoutMode)

  const modes: { id: LayoutMode; label: string; key: string }[] = [
    { id: 'architecture', label: 'Architecture', key: 'A' },
    { id: 'dependencies', label: 'Dependencies', key: 'D' },
    { id: 'dataflow',     label: 'Data Flow',    key: 'F' },
    { id: 'runtime',      label: 'Runtime',      key: 'R' },
    { id: 'package',      label: 'Package',      key: 'P' },
  ]

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 px-3 py-2 rounded-xl surface-elevated shadow-md">
      {modes.map(m => (
        <button
          key={m.id}
          onClick={() => setLayoutMode(m.id)}
          title={`${m.label} (${m.key})`}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
            layoutMode === m.id
              ? 'bg-[var(--brand-accent)] text-[var(--brand-accent-fg)] shadow-sm'
              : 'text-secondary hover:text-primary hover:bg-[var(--bg-hover)]'
          }`}
        >
          {m.label}
        </button>
      ))}
    </div>
  )
}

// ── Control button ────────────────────────────────────────────────────────────

function ControlButton({
  onClick,
  title,
  active,
  children,
}: {
  onClick: () => void
  title: string
  active?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`w-8 h-8 rounded flex items-center justify-center text-sm transition-all ${
        active
          ? 'bg-[var(--brand-accent)] text-[var(--brand-accent-fg)]'
          : 'surface-elevated text-secondary hover:text-primary'
      }`}
    >
      {children}
    </button>
  )
}
