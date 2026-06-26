import { create } from 'zustand'

/* ============================================
   WORLD TYPES
   ============================================ */

export type World = 'explore' | 'observe' | 'understand' | 'evolve'

export const WORLD_META: Record<World, { question: string; description: string }> = {
  explore: {
    question: 'What exists?',
    description: 'Architecture, systems, relationships',
  },
  observe: {
    question: 'What is happening?',
    description: 'Runtime, events, execution',
  },
  understand: {
    question: 'Why is it happening?',
    description: 'Reasoning, energy, root causes',
  },
  evolve: {
    question: 'Where is it going?',
    description: 'Roadmap, research, future',
  },
}

/* ============================================
   CORTEX TYPES
   ============================================ */

export type CortexId = 'vajra' | 'piras' | 'client' | 'scada' | 'business'

export interface Cortex {
  id: CortexId
  name: string
  fullName: string
  role: string
  status: 'active' | 'stable' | 'experimental' | 'planned'
  color: string
  colorSubtle: string
  domains: Domain[]
  connections: Connection[]
}

export interface Domain {
  id: string
  name: string
  modules: Module[]
}

export interface Module {
  id: string
  name: string
  description?: string
}

export interface Connection {
  target: CortexId
  type: 'orchestration' | 'retrieval' | 'context' | 'event' | 'automation'
  label: string
  strength: number
}

/* ============================================
   NAVIGATION TYPES
   ============================================ */

export type NavItemType = 'cortex' | 'domain' | 'module' | 'pipeline' | 'process' | 'system'

export interface NavSelection {
  type: NavItemType
  id: string
  cortexId?: CortexId
  domainId?: string
}

/* ============================================
   ZOOM LEVELS (Semantic Zoom)
   ============================================ */

export type ZoomLevel = 'orbit' | 'cortex' | 'domain' | 'module'

export const ZOOM_LEVELS: ZoomLevel[] = ['orbit', 'cortex', 'domain', 'module']

/* ============================================
   RUNTIME EVENT TYPES
   ============================================ */

export interface RuntimeEvent {
  id: string
  timestamp: number
  source: CortexId
  target?: CortexId
  type: string
  category: 'perception' | 'reasoning' | 'decision' | 'retrieval' | 'execution'
  data?: Record<string, unknown>
  confidence?: number
  duration?: number
}

/* ============================================
   TIMELINE TYPES
   ============================================ */

export interface TimelineSpan {
  id: string
  name: string
  start: number
  end: number
  cortex: CortexId
  children?: TimelineSpan[]
}

/* ============================================
   CORTEX DATA
   ============================================ */

export const CORTEXES: Cortex[] = [
  {
    id: 'vajra',
    name: 'Vajra',
    fullName: 'The Vajra Cortex',
    role: 'Executive Intelligence',
    status: 'active',
    color: '#D97706',
    colorSubtle: 'rgba(217, 119, 6, 0.15)',
    domains: [
      {
        id: 'cognition',
        name: 'Cognition',
        modules: [
          { id: 'query-classifier', name: 'Query Classifier' },
          { id: 'query-router', name: 'Query Router' },
          { id: 'reasoning-engine', name: 'Reasoning Engine' },
        ],
      },
      {
        id: 'retrieval',
        name: 'Retrieval',
        modules: [
          { id: 'retrieval-engine', name: 'Retrieval Engine' },
          { id: 'context-compiler', name: 'Context Compiler' },
          { id: 'memory-system', name: 'Memory System' },
        ],
      },
      {
        id: 'execution',
        name: 'Execution',
        modules: [
          { id: 'llm-runtime', name: 'LLM Runtime' },
          { id: 'introspection', name: 'Introspection' },
          { id: 'investigation', name: 'Investigation' },
        ],
      },
    ],
    connections: [
      { target: 'piras', type: 'orchestration', label: 'Orchestrates', strength: 0.9 },
      { target: 'client', type: 'retrieval', label: 'Retrieves from', strength: 0.8 },
    ],
  },
  {
    id: 'piras',
    name: 'PIRAS',
    fullName: 'The PIRAS Cortex',
    role: 'Perception & Reasoning',
    status: 'active',
    color: '#3B82F6',
    colorSubtle: 'rgba(59, 130, 246, 0.15)',
    domains: [
      {
        id: 'perception',
        name: 'Perception',
        modules: [
          { id: 'quality-gate', name: 'Quality Gate' },
          { id: 'yolo-detection', name: 'YOLO Detection' },
          { id: 'patch-classification', name: 'Patch Classification' },
        ],
      },
      {
        id: 'signals',
        name: 'Signals',
        modules: [
          { id: 'signal-extraction', name: 'Signal Extraction' },
          { id: 'signal-classification', name: 'Signal Classification' },
          { id: 'multi-signal-fusion', name: 'Multi-Signal Fusion' },
        ],
      },
      {
        id: 'reasoning',
        name: 'Reasoning',
        modules: [
          { id: 'energy-reasoning', name: 'Energy Reasoning' },
          { id: 'consolidation', name: 'Consolidation' },
          { id: 'decision-engine', name: 'Decision Engine' },
        ],
      },
      {
        id: 'intelligence',
        name: 'Intelligence',
        modules: [
          { id: 'telemetry', name: 'Telemetry' },
          { id: 'persistence', name: 'Persistence' },
          { id: 'plant-intelligence', name: 'Plant Intelligence' },
        ],
      },
    ],
    connections: [
      { target: 'client', type: 'context', label: 'Mounts context from', strength: 0.8 },
      { target: 'vajra', type: 'event', label: 'Streams events to', strength: 0.6 },
    ],
  },
  {
    id: 'client',
    name: 'Client',
    fullName: 'The Client Cortex',
    role: 'Semantic Factory Memory',
    status: 'stable',
    color: '#10B981',
    colorSubtle: 'rgba(16, 185, 129, 0.15)',
    domains: [
      {
        id: 'identity',
        name: 'Identity',
        modules: [
          { id: 'factory-identity', name: 'Factory Identity' },
          { id: 'calibration', name: 'Calibration' },
        ],
      },
      {
        id: 'knowledge',
        name: 'Knowledge',
        modules: [
          { id: 'knowledge-domains', name: 'Knowledge Domains' },
          { id: 'sops', name: 'SOPs' },
          { id: 'ppap', name: 'PPAP' },
        ],
      },
      {
        id: 'quality',
        name: 'Quality',
        modules: [
          { id: 'quality-gates', name: 'Quality Gates' },
          { id: 'visual-references', name: 'Visual References' },
          { id: 'cad-references', name: 'CAD References' },
        ],
      },
      {
        id: 'integration',
        name: 'Integration',
        modules: [
          { id: 'erp-mappings', name: 'ERP Mappings' },
          { id: 'runtime-context', name: 'Runtime Context' },
        ],
      },
    ],
    connections: [],
  },
  {
    id: 'scada',
    name: 'SCADA',
    fullName: 'The SCADA Cortex',
    role: 'Industrial Automation',
    status: 'planned',
    color: '#06B6D4',
    colorSubtle: 'rgba(6, 182, 212, 0.15)',
    domains: [
      {
        id: 'automation',
        name: 'Automation',
        modules: [
          { id: 'plc-integration', name: 'PLC Integration' },
          { id: 'sensor-fusion', name: 'Sensor Fusion' },
          { id: 'automation-control', name: 'Automation Control' },
        ],
      },
    ],
    connections: [
      { target: 'piras', type: 'automation', label: 'Feeds data to', strength: 0.7 },
    ],
  },
  {
    id: 'business',
    name: 'Business',
    fullName: 'The Business Cortex',
    role: 'Enterprise Intelligence',
    status: 'planned',
    color: '#8B5CF6',
    colorSubtle: 'rgba(139, 92, 246, 0.15)',
    domains: [
      {
        id: 'enterprise',
        name: 'Enterprise',
        modules: [
          { id: 'erp-analytics', name: 'ERP Analytics' },
          { id: 'mes-integration', name: 'MES Integration' },
          { id: 'business-intelligence', name: 'Business Intelligence' },
        ],
      },
    ],
    connections: [
      { target: 'vajra', type: 'retrieval', label: 'Queries', strength: 0.6 },
    ],
  },
]

/* ============================================
   APP STORE
   ============================================ */

interface AppState {
  // World Navigation
  currentWorld: World
  setWorld: (world: World) => void

  // Selection
  selection: NavSelection | null
  setSelection: (selection: NavSelection | null) => void

  // Semantic Zoom
  zoomLevel: ZoomLevel
  setZoomLevel: (level: ZoomLevel) => void
  focusedCortex: CortexId | null
  setFocusedCortex: (cortex: CortexId | null) => void

  // Inspector
  inspectorOpen: boolean
  setInspectorOpen: (open: boolean) => void

  // Timeline
  timelineExpanded: boolean
  setTimelineExpanded: (expanded: boolean) => void

  // Runtime Events (for Observe world)
  events: RuntimeEvent[]
  addEvent: (event: RuntimeEvent) => void
  clearEvents: () => void

  // UI State
  navCollapsed: boolean
  setNavCollapsed: (collapsed: boolean) => void

  // Theme
  theme: 'light' | 'dark'
  toggleTheme: () => void

  // Cortex Data Access
  getCortex: (id: CortexId) => Cortex | undefined
  getActiveCortexes: () => Cortex[]
  getPlannedCortexes: () => Cortex[]
}

export const useAppStore = create<AppState>((set, get) => ({
  // World Navigation
  currentWorld: 'explore',
  setWorld: (world) => set({ currentWorld: world }),

  // Selection
  selection: null,
  setSelection: (selection) => set({ selection }),

  // Semantic Zoom
  zoomLevel: 'orbit',
  setZoomLevel: (level) => set({ zoomLevel: level }),
  focusedCortex: null,
  setFocusedCortex: (cortex) => set({ focusedCortex: cortex }),

  // Inspector
  inspectorOpen: true,
  setInspectorOpen: (open) => set({ inspectorOpen: open }),

  // Timeline
  timelineExpanded: false,
  setTimelineExpanded: (expanded) => set({ timelineExpanded: expanded }),

  // Runtime Events
  events: [],
  addEvent: (event) => set((s) => ({ events: [...s.events.slice(-100), event] })),
  clearEvents: () => set({ events: [] }),

  // UI State
  navCollapsed: false,
  setNavCollapsed: (collapsed) => set({ navCollapsed: collapsed }),

  // Theme (initialize from localStorage or default to dark)
  theme: (typeof window !== 'undefined' && localStorage.getItem('theme') as 'light' | 'dark') || 'dark',
  toggleTheme: () => {
    const newTheme = get().theme === 'dark' ? 'light' : 'dark'
    localStorage.setItem('theme', newTheme)
    // Apply class to document
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    set({ theme: newTheme })
  },

  // Cortex Data Access
  getCortex: (id) => CORTEXES.find((c) => c.id === id),
  getActiveCortexes: () => CORTEXES.filter((c) => c.status === 'active' || c.status === 'stable'),
  getPlannedCortexes: () => CORTEXES.filter((c) => c.status === 'planned'),
}))

/* ============================================
   SELECTORS
   ============================================ */

export const selectCurrentCortex = (state: AppState) => {
  if (state.selection?.type === 'cortex' && state.selection.cortexId) {
    return CORTEXES.find((c) => c.id === state.selection!.cortexId)
  }
  return null
}

export const selectCurrentDomain = (state: AppState) => {
  if (state.selection?.type === 'domain' && state.selection.cortexId && state.selection.domainId) {
    const cortex = CORTEXES.find((c) => c.id === state.selection!.cortexId)
    return cortex?.domains.find((d) => d.id === state.selection!.domainId)
  }
  return null
}
