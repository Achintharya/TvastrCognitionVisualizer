import { useAppStore, CORTEXES, WORLD_META } from '../stores/appStore'

/* ============================================
   WORLD CANVAS
   Main visualization area - renders based on current world
   This is a placeholder until 3D visualizations are built
   ============================================ */

export function WorldCanvas() {
  const currentWorld = useAppStore((s) => s.currentWorld)

  return (
    <div className="h-full w-full relative bg-[var(--bg-space)]">
      {currentWorld === 'explore' && <ExploreCanvas />}
      {currentWorld === 'observe' && <ObserveCanvas />}
      {currentWorld === 'understand' && <UnderstandCanvas />}
      {currentWorld === 'evolve' && <EvolveCanvas />}
    </div>
  )
}

/* ============================================
   EXPLORE CANVAS - "What exists?"
   Vajra-centered architecture topology
   ============================================ */

function ExploreCanvas() {
  const setSelection = useAppStore((s) => s.setSelection)
  const selection = useAppStore((s) => s.selection)

  // Vajra at center, others around it
  const layout: Record<string, { x: number; y: number; scale: number }> = {
    vajra: { x: 50, y: 40, scale: 1.5 },
    piras: { x: 25, y: 65, scale: 1 },
    client: { x: 75, y: 65, scale: 1 },
    scada: { x: 25, y: 85, scale: 0.8 },
    business: { x: 75, y: 85, scale: 0.8 },
  }

  return (
    <div className="h-full w-full flex items-center justify-center relative overflow-hidden">
      {/* Background grid */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(var(--border-subtle) 1px, transparent 1px),
            linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Connection lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {/* Vajra to PIRAS */}
        <line 
          x1="50%" y1="40%" 
          x2="25%" y2="65%" 
          stroke="var(--cortex-vajra)" 
          strokeWidth="1" 
          strokeOpacity="0.2"
          strokeDasharray="4 4"
        />
        {/* Vajra to Client */}
        <line 
          x1="50%" y1="40%" 
          x2="75%" y2="65%" 
          stroke="var(--cortex-vajra)" 
          strokeWidth="1" 
          strokeOpacity="0.2"
          strokeDasharray="4 4"
        />
        {/* PIRAS to Client */}
        <line 
          x1="25%" y1="65%" 
          x2="75%" y2="65%" 
          stroke="var(--cortex-piras)" 
          strokeWidth="1" 
          strokeOpacity="0.15"
          strokeDasharray="4 4"
        />
      </svg>

      {/* Cortex Nodes */}
      {CORTEXES.map((cortex) => {
        const pos = layout[cortex.id]
        const isSelected = selection?.cortexId === cortex.id
        const isPlanned = cortex.status === 'planned'
        
        return (
          <div
            key={cortex.id}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 cursor-pointer group ${isPlanned ? 'opacity-40' : ''}`}
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
            }}
            onClick={() => setSelection({ type: 'cortex', id: cortex.id, cortexId: cortex.id })}
          >
            {/* Outer ring (selection indicator) */}
            <div
              className={`absolute inset-0 rounded-full transition-all duration-300 ${isSelected ? 'scale-125 opacity-100' : 'scale-100 opacity-0 group-hover:opacity-50'}`}
              style={{
                backgroundColor: cortex.colorSubtle,
                transform: `scale(${pos.scale * 1.3})`,
                width: `${80 * pos.scale}px`,
                height: `${80 * pos.scale}px`,
                marginLeft: `${-40 * pos.scale}px`,
                marginTop: `${-40 * pos.scale}px`,
              }}
            />
            
            {/* Main node */}
            <div
              className={`relative rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${isSelected ? 'scale-110' : ''}`}
              style={{
                width: `${64 * pos.scale}px`,
                height: `${64 * pos.scale}px`,
                backgroundColor: isPlanned ? 'transparent' : cortex.colorSubtle,
                border: `2px solid ${cortex.color}`,
                borderStyle: isPlanned ? 'dashed' : 'solid',
                boxShadow: isSelected ? `0 0 30px ${cortex.colorSubtle}` : 'none',
              }}
            >
              {/* Inner core */}
              {!isPlanned && (
                <div
                  className="rounded-full"
                  style={{
                    width: `${24 * pos.scale}px`,
                    height: `${24 * pos.scale}px`,
                    backgroundColor: cortex.color,
                  }}
                />
              )}
            </div>

            {/* Label */}
            <div 
              className="absolute left-1/2 transform -translate-x-1/2 text-center whitespace-nowrap"
              style={{ top: `${40 * pos.scale + 16}px` }}
            >
              <div 
                className="text-sm font-medium"
                style={{ color: cortex.color }}
              >
                {cortex.name}
              </div>
              <div className="text-xs text-tertiary">
                {cortex.role}
              </div>
              {isPlanned && (
                <div className="text-[10px] text-tertiary mt-1">
                  [planned]
                </div>
              )}
            </div>
          </div>
        )
      })}

      {/* World label */}
      <WorldLabel world="explore" />
    </div>
  )
}

/* ============================================
   OBSERVE CANVAS - "What is happening?"
   Runtime visualization placeholder
   ============================================ */

function ObserveCanvas() {
  const addEvent = useAppStore((s) => s.addEvent)

  // Simulate adding an event
  const simulateEvent = () => {
    const sources = ['vajra', 'piras', 'client'] as const
    const categories = ['perception', 'reasoning', 'decision', 'retrieval', 'execution'] as const
    const types = [
      'inspection.started', 'signal.extracted', 'energy.converged',
      'decision.made', 'query.classified', 'retrieval.complete'
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

  return (
    <div className="h-full w-full flex flex-col items-center justify-center relative">
      {/* Background animation - subtle pulse grid */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.02]">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute w-[400px] h-[400px] rounded-full border border-white/20"
              style={{
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                animation: `pulse ${3 + i}s ease-in-out infinite`,
                animationDelay: `${i * 0.5}s`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="text-center z-10">
        <div className="text-6xl mb-4 opacity-20">◎</div>
        <h2 className="heading-lg mb-2">Runtime Observation</h2>
        <p className="text-secondary mb-6">Watching system execution in real-time</p>
        
        <button
          onClick={simulateEvent}
          className="px-4 py-2 rounded surface-elevated hover:bg-white/5 transition-colors text-sm"
        >
          Simulate Event
        </button>
      </div>

      <WorldLabel world="observe" />
    </div>
  )
}

/* ============================================
   UNDERSTAND CANVAS - "Why is it happening?"
   Reasoning visualization placeholder
   ============================================ */

function UnderstandCanvas() {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center relative">
      <div className="text-center">
        <div className="text-6xl mb-4 opacity-20">◇</div>
        <h2 className="heading-lg mb-2">Reasoning Comprehension</h2>
        <p className="text-secondary mb-2">Understanding why decisions are made</p>
        <p className="caption">Energy convergence • Signal agreement • Root causes</p>
      </div>

      {/* Placeholder for reasoning visualization */}
      <div className="mt-12 flex gap-8">
        {['Energy', 'Signals', 'Confidence'].map((label) => (
          <div key={label} className="text-center">
            <div className="w-24 h-24 rounded-lg surface flex items-center justify-center mb-2">
              <div className="text-2xl text-tertiary">—</div>
            </div>
            <span className="text-xs text-tertiary">{label}</span>
          </div>
        ))}
      </div>

      <WorldLabel world="understand" />
    </div>
  )
}

/* ============================================
   EVOLVE CANVAS - "Where is it going?"
   Roadmap visualization placeholder
   ============================================ */

function EvolveCanvas() {
  const stages = [
    { name: 'Signal System', status: 'complete', color: 'var(--status-success)' },
    { name: 'Process Intelligence', status: 'complete', color: 'var(--status-success)' },
    { name: 'Energy Reasoning', status: 'active', color: 'var(--cortex-vajra)' },
    { name: 'Vajra Cortex', status: 'active', color: 'var(--cortex-vajra)' },
    { name: 'Client Cortex', status: 'active', color: 'var(--cortex-client)' },
    { name: 'SCADA Cortex', status: 'planned', color: 'var(--text-tertiary)' },
    { name: 'Business Cortex', status: 'planned', color: 'var(--text-tertiary)' },
    { name: 'Industrial Runtime', status: 'future', color: 'var(--text-muted)' },
  ]

  return (
    <div className="h-full w-full flex flex-col items-center justify-center relative p-8">
      <div className="text-center mb-12">
        <h2 className="heading-lg mb-2">System Evolution</h2>
        <p className="text-secondary">The path to industrial cognition</p>
      </div>

      {/* Roadmap visualization */}
      <div className="flex flex-col gap-2 max-w-md w-full">
        {stages.map((stage, i) => (
          <div key={stage.name} className="flex items-center gap-4">
            {/* Timeline dot */}
            <div className="relative">
              <div 
                className={`w-3 h-3 rounded-full ${stage.status === 'active' ? 'animate-pulse' : ''}`}
                style={{ backgroundColor: stage.color }}
              />
              {i < stages.length - 1 && (
                <div 
                  className="absolute left-1/2 top-full w-px h-6 -translate-x-1/2"
                  style={{ backgroundColor: stages[i + 1].color, opacity: 0.3 }}
                />
              )}
            </div>
            
            {/* Stage info */}
            <div className="flex-1 py-2">
              <span 
                className="text-sm"
                style={{ color: stage.status === 'future' ? 'var(--text-muted)' : 'var(--text-primary)' }}
              >
                {stage.name}
              </span>
            </div>
            
            {/* Status badge */}
            <span 
              className="text-xs px-2 py-0.5 rounded"
              style={{ 
                backgroundColor: `${stage.color}20`,
                color: stage.color,
              }}
            >
              {stage.status}
            </span>
          </div>
        ))}
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
    <div className="absolute bottom-6 left-6 text-left">
      <div className="heading-sm mb-1">{meta.question}</div>
      <div className="caption">{meta.description}</div>
    </div>
  )
}
