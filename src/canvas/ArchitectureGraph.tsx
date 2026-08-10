import { useRef, useState, useCallback, useMemo } from 'react'
import { useAppStore, CORTEXES } from '../stores/appStore'
import type { CortexId, RuntimeStatus } from '../stores/appStore'

/* ============================================
   ARCHITECTURE GRAPH
   SVG-based interactive graph engine
   Supports: zoom, pan, focus mode, edge types,
   node tooltips, minimap, layout switching
   ============================================ */

// ── Layout computation ────────────────────────────────────────────────────────

const GRAPH_W = 900
const GRAPH_H = 600

// Returns node positions (architecture layout only)
function computeLayout(): Record<CortexId, { x: number; y: number; r: number }> {
  return {
    vajra:    { x: 450, y: 130, r: 52 },
    piras:    { x: 200, y: 320, r: 44 },
    client:   { x: 700, y: 320, r: 44 },
    mis:      { x: 450, y: 340, r: 40 },
    scada:    { x: 130, y: 500, r: 32 },
    business: { x: 770, y: 500, r: 32 },
  }
}

// ── Edge rendering ────────────────────────────────────────────────────────────

const FLOW_EDGE_COLOR = '#f5a623'

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
  const focusMode       = useAppStore((s) => s.focusMode)
  const setFocusMode    = useAppStore((s) => s.setFocusMode)
  const hoveredNode     = useAppStore((s) => s.hoveredNode)
  const setHoveredNode  = useAppStore((s) => s.setHoveredNode)
  const runtimeStatus   = useAppStore((s) => s.runtimeStatus)
  const minimapVisible  = useAppStore((s) => s.minimapVisible)
  const searchQuery     = useAppStore((s) => s.searchQuery)
  const theme           = useAppStore((s) => s.theme)

  // Resolved text colors based on theme
  const textPrimary   = theme === 'dark' ? '#e8e8ec' : '#0f172a'
  const textSecondary = theme === 'dark' ? '#9a9aaa' : '#475569'

  const svgRef = useRef<SVGSVGElement>(null)
  const [viewBox, setViewBox] = useState({ x: -60, y: -40, w: GRAPH_W + 120, h: GRAPH_H + 80 })
  const isPanning = useRef(false)
  const panStart  = useRef({ x: 0, y: 0, vbx: 0, vby: 0 })

  const positions = useMemo(() => computeLayout(), [])

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
    
    const newX = panStart.current.vbx - dx
    const newY = panStart.current.vby - dy
    
    // Define pan boundaries to keep content in view
    // Allow some panning but prevent going too far off-screen
    const panBuffer = 200 // pixels of buffer space
    const minX = -panBuffer
    const maxX = panBuffer
    const minY = -panBuffer
    const maxY = panBuffer
    
    // Constrain the new position within bounds
    const constrainedX = Math.max(minX, Math.min(maxX, newX))
    const constrainedY = Math.max(minY, Math.min(maxY, newY))
    
    setViewBox(v => ({ ...v, x: constrainedX, y: constrainedY }))
  }, [viewBox.w, viewBox.h])

  const onMouseUp = useCallback(() => { isPanning.current = false }, [])

  // Zoom via wheel - restricted: no zoom out, max zoom in 200%
  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    if (!svgRef.current) return
    
    const factor = e.deltaY > 0 ? 1.1 : 0.9
    const rect = svgRef.current.getBoundingClientRect()
    const mx = viewBox.x + ((e.clientX - rect.left) / rect.width) * viewBox.w
    const my = viewBox.y + ((e.clientY - rect.top) / rect.height) * viewBox.h
    
    const newW = viewBox.w * factor
    const newH = viewBox.h * factor
    
    // Initial dimensions
    const initialW = GRAPH_W + 120
    const initialH = GRAPH_H + 80
    
    // Restrict zoom: no zoom out (w/h <= initial), max zoom in 200% (w/h >= initial * 0.5)
    const minW = initialW * 0.5  // 200% zoom in
    const maxW = initialW         // no zoom out
    const minH = initialH * 0.5
    const maxH = initialH
    
    // Check if new dimensions are within bounds
    if (newW >= minW && newW <= maxW && newH >= minH && newH <= maxH) {
      setViewBox(v => ({
        x: mx - (mx - v.x) * factor,
        y: my - (my - v.y) * factor,
        w: newW,
        h: newH,
      }))
    }
  }, [viewBox])

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
          <style>{`
            .edge-flow { animation: dashFlow 1.5s linear infinite; }
            @keyframes dashFlow { to { stroke-dashoffset: -20; } }
            .node-pulse { animation: nodePulse 2s ease-in-out infinite; }
            @keyframes nodePulse { 0%,100%{opacity:0.6;r:5} 50%{opacity:1;r:7} }
          `}</style>
          {/* Single arrowhead marker for flow edges */}
          <marker id="arrow-flow" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill={FLOW_EDGE_COLOR} opacity="0.8" />
          </marker>
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
        <text x="450" y="50" textAnchor="middle" fontSize="14" fill="var(--text-tertiary)" letterSpacing="4" fontWeight="600">
          TVASTR INDUSTRIAL COGNITION
        </text>

        {/* Edges */}
        <GraphEdges positions={positions} edgeOpacity={edgeOpacity} />

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
            textPrimary={textPrimary}
            textSecondary={textSecondary}
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
}: {
  positions: Record<CortexId, { x: number; y: number; r: number }>
  edgeOpacity: (s: string, t: string) => number
}) {
  const vajra = positions['vajra']
  if (!vajra) return null

  // One animated dotted edge from every non-Vajra cortex → Vajra
  const sources = CORTEXES.filter(c => c.id !== 'vajra')

  return (
    <g>
      {sources.map(cortex => {
        const src = positions[cortex.id]
        if (!src) return null
        const opacity = edgeOpacity(cortex.id, 'vajra')

        const dx = vajra.x - src.x
        const dy = vajra.y - src.y
        const len = Math.sqrt(dx * dx + dy * dy)
        const ux = dx / len, uy = dy / len
        const x1 = src.x + ux * (src.r + 4)
        const y1 = src.y + uy * (src.r + 4)
        const x2 = vajra.x - ux * (vajra.r + 10)
        const y2 = vajra.y - uy * (vajra.r + 10)

        // Gentle curve
        const cx = (x1 + x2) / 2 - dy * 0.12
        const cy = (y1 + y2) / 2 + dx * 0.12
        const d = `M${x1},${y1} Q${cx},${cy} ${x2},${y2}`

        return (
          <path
            key={cortex.id}
            d={d}
            fill="none"
            stroke={FLOW_EDGE_COLOR}
            strokeWidth={1.5}
            strokeDasharray="4 4"
            className="edge-flow"
            markerEnd="url(#arrow-flow)"
            opacity={opacity}
          />
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
  textPrimary,
  textSecondary,
  onSelect,
  onHover,
}: {
  cortex: typeof CORTEXES[0]
  pos: { x: number; y: number; r: number }
  isSelected: boolean
  isHovered: boolean
  opacity: number
  status: RuntimeStatus
  textPrimary: string
  textSecondary: string
  onSelect: () => void
  onHover: (id: string | null) => void
}) {
  const isPlanned = cortex.status === 'planned'
  const scale = isSelected || isHovered ? 1.12 : 1

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

      {/* Cortex name */}
      <text
        x={0} y={pos.r * 0.25}
        textAnchor="middle"
        fontSize={pos.r > 40 ? 18 : 15}
        fontWeight="700"
        fill={textPrimary}
        letterSpacing="0.5"
      >
        {cortex.name}
      </text>

      {/* Role label below node */}
      <text
        x={0} y={pos.r + 18}
        textAnchor="middle"
        fontSize={13}
        fill={textSecondary}
        fontWeight="500"
      >
        {cortex.role.length > 30 ? cortex.role.slice(0, 30) + '…' : cortex.role}
      </text>

      {/* Planned badge */}
      {isPlanned && (
        <text x={0} y={12} textAnchor="middle" fontSize={11} fill={cortex.color} opacity={0.6}>
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
      <text x={tx} y={ty + 14} textAnchor="middle" fontSize={14} fontWeight="600" fill={cortex.color}>
        {cortex.fullName}
      </text>
      <text x={tx} y={ty + 26} textAnchor="middle" fontSize={11} fill="var(--text-secondary)">
        {cortex.role.length > 36 ? cortex.role.slice(0, 36) + '…' : cortex.role}
      </text>
      <text x={tx} y={ty + 40} textAnchor="middle" fontSize={11} fill="var(--text-tertiary)">
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
