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
    role: 'Retrieval-First Executive Cognition',
    status: 'active',
    color: '#D97706',
    colorSubtle: 'rgba(217, 119, 6, 0.15)',
    domains: [
      {
        id: 'cognition',
        name: 'Cognition',
        modules: [
          { id: 'intent-classification', name: 'Intent Classification', description: 'Query classification and routing' },
          { id: 'reasoning-chains', name: 'Reasoning Chains', description: 'Structured reasoning logic' },
          { id: 'response-generation', name: 'Response Generation', description: 'Response synthesis' },
          { id: 'llm-runtime', name: 'LLM Runtime', description: 'Groq, OpenAI inference' },
        ],
      },
      {
        id: 'retrieval',
        name: 'Retrieval',
        modules: [
          { id: 'retrieval-engine', name: 'Retrieval Engine', description: 'Evidence retrieval orchestration' },
          { id: 'retrieval-planner', name: 'Retrieval Planner', description: 'Query planning' },
          { id: 'database-cognition', name: 'Database Cognition', description: 'Schema-aware SQL generation (read-only)' },
          { id: 'adapters', name: 'Adapters', description: 'PIRAS, ERP, Document adapters' },
        ],
      },
      {
        id: 'context',
        name: 'Context',
        modules: [
          { id: 'context-compiler', name: 'Context Compiler', description: 'Context packet assembly' },
          { id: 'provenance', name: 'Provenance', description: 'Evidence tracking' },
          { id: 'client-integration', name: 'ClientCortex Integration', description: 'Client knowledge mounting' },
        ],
      },
      {
        id: 'executive',
        name: 'Executive',
        modules: [
          { id: 'orchestrator', name: 'Orchestrator', description: 'Main investigation orchestrator' },
        ],
      },
      {
        id: 'investigation',
        name: 'Investigation',
        modules: [
          { id: 'audit-generation', name: 'Audit Generation', description: 'Debugging audit reports' },
          { id: 'investigation-tracking', name: 'Investigation Tracking', description: 'Session management' },
        ],
      },
      {
        id: 'voice',
        name: 'Voice',
        modules: [
          { id: 'tts-runtime', name: 'TTS Runtime', description: 'Sarvam, Kokoro providers' },
          { id: 'stt-runtime', name: 'STT Runtime', description: 'Speech-to-text' },
          { id: 'wake-word', name: 'Wake Word Detection', description: 'Voice activation' },
          { id: 'voice-orchestration', name: 'Voice Orchestration', description: 'Multilingual routing (11 languages)' },
        ],
      },
      {
        id: 'introspection',
        name: 'Introspection',
        modules: [
          { id: 'ast-analysis', name: 'AST Analysis', description: 'Code structure parsing' },
          { id: 'dependency-graphs', name: 'Dependency Graphs', description: 'Module dependencies' },
          { id: 'telemetry', name: 'Telemetry', description: 'Runtime metrics' },
        ],
      },
      {
        id: 'memory',
        name: 'Memory',
        modules: [
          { id: 'session-memory', name: 'Session Memory', description: 'Executive cognition memory' },
        ],
      },
      {
        id: 'observability',
        name: 'Observability',
        modules: [
          { id: 'logging', name: 'Logging', description: 'Structured logging' },
          { id: 'metrics', name: 'Metrics', description: 'Performance metrics' },
          { id: 'tracing', name: 'Tracing', description: 'Request tracing' },
        ],
      },
    ],
    connections: [
      { target: 'piras', type: 'orchestration', label: 'Orchestrates via HTTP', strength: 0.9 },
      { target: 'piras', type: 'retrieval', label: 'Retrieves inspection data', strength: 0.8 },
      { target: 'client', type: 'retrieval', label: 'Mounts client knowledge', strength: 0.85 },
    ],
  },
  {
    id: 'piras',
    name: 'PIRAS',
    fullName: 'The PIRAS Cortex (TvastrRAS)',
    role: 'AI-Powered Casting Defect Detection & Root Cause Analysis',
    status: 'active',
    color: '#3B82F6',
    colorSubtle: 'rgba(59, 130, 246, 0.15)',
    domains: [
      {
        id: 'vision',
        name: 'Vision',
        modules: [
          { id: 'yolo-detection', name: 'YOLO Detection', description: 'Object detection' },
          { id: 'patch-system', name: 'Patch System', description: 'Sliding window 256×256, 128px stride' },
          { id: 'anomaly-detection', name: 'Anomaly Detection', description: 'Feature extraction (70% weight)' },
        ],
      },
      {
        id: 'signals',
        name: 'Signals',
        modules: [
          { id: 'signal-extraction', name: 'Signal Extraction', description: '11 production signals' },
          { id: 'signal-classification', name: 'Signal Classification', description: 'PRIMARY classifier (40% weight)' },
          { id: 'multi-signal-fusion', name: 'Multi-Signal Fusion', description: 'Weighted fusion logic' },
        ],
      },
      {
        id: 'reasoning',
        name: 'Reasoning',
        modules: [
          { id: 'energy-reasoning', name: 'Energy Reasoning', description: 'Physics-inspired classification' },
          { id: 'ownership-classifier', name: 'Ownership Classifier', description: 'Gen 3: 6 ownership contracts (PTD, Porosity, Sand, Slag)' },
          { id: 'consolidation', name: 'Consolidation', description: 'Four-gate reasoning pipeline' },
          { id: 'decision-engine', name: 'Decision Engine', description: 'Final decision logic' },
        ],
      },
      {
        id: 'pipeline',
        name: 'Pipeline',
        modules: [
          { id: 'stage-0-10', name: '11-Stage Pipeline', description: 'Stage 0–10 flow (with 2b, 2c sub-stages = 13 nodes)' },
          { id: 'fast-path', name: 'Fast Path', description: '90% fast (<100ms)' },
          { id: 'slow-path', name: 'Slow Path', description: '10% slow (<250ms)' },
        ],
      },
      {
        id: 'intelligence',
        name: 'Intelligence',
        modules: [
          { id: 'auto-calibration', name: 'Auto-Calibration', description: 'ACO/MOS weight optimization' },
          { id: 'fingerprinting', name: 'Fingerprinting', description: 'DBSCAN clustering, pattern recognition' },
          { id: 'prototype-system', name: 'Prototype System', description: 'Continuous learning (max 50/type)' },
          { id: 'scrata', name: 'SCRATA System', description: 'Ground-truth recovery' },
          { id: 'plant-intelligence', name: 'Plant Intelligence', description: 'TIER_3: 25 REST endpoints, SPC, dashboard' },
        ],
      },
      {
        id: 'traceability',
        name: 'Traceability',
        modules: [
          { id: 'heat-resolver', name: 'Heat Resolver', description: 'Heat number correlation' },
          { id: 'erp-integration', name: 'ERP Integration', description: 'Production context loading' },
          { id: 'traceability-engine', name: 'Traceability Engine', description: 'FH_ fallback, lineage tracking' },
        ],
      },
      {
        id: 'persistence',
        name: 'Persistence',
        modules: [
          { id: 'database', name: 'Database', description: 'Inspection storage' },
          { id: 'telemetry', name: 'Telemetry', description: 'Runtime metrics' },
          { id: 'failure-memory', name: 'Failure Memory', description: 'Failure pattern storage' },
        ],
      },
      {
        id: 'api',
        name: 'API',
        modules: [
          { id: 'rest-api', name: 'REST API', description: 'Inspection endpoints' },
          { id: 'batch-processing', name: 'Batch Processing', description: 'Bulk inspection' },
        ],
      },
      {
        id: 'deployment',
        name: 'Deployment',
        modules: [
          { id: 'embedded-python', name: 'Embedded Python', description: 'v2.0 build system' },
          { id: 'ota-updates', name: 'OTA Updates', description: 'Software update system' },
          { id: 'licensing', name: 'Licensing', description: 'TIER_1/2/3 capability gating' },
        ],
      },
    ],
    connections: [
      { target: 'client', type: 'context', label: 'Mounts context from', strength: 0.8 },
      { target: 'vajra', type: 'event', label: 'Streams events to', strength: 0.7 },
    ],
  },
  {
    id: 'client',
    name: 'Client',
    fullName: 'The Client Cortex',
    role: 'Semantic Factory Memory (Customer Knowledge Layer)',
    status: 'stable',
    color: '#10B981',
    colorSubtle: 'rgba(16, 185, 129, 0.15)',
    domains: [
      {
        id: 'identity',
        name: 'Identity Context',
        modules: [
          { id: 'client-profile', name: 'Client Profile', description: 'Client ID, name, industry, deployment type' },
          { id: 'factory-identity', name: 'Factory Identity', description: 'Deployment identification' },
        ],
      },
      {
        id: 'process',
        name: 'Process Context',
        modules: [
          { id: 'shifts', name: 'Shifts', description: 'Shift definitions, start/end times' },
          { id: 'schedules', name: 'Schedules', description: 'Production schedules' },
          { id: 'process-parameters', name: 'Process Parameters', description: 'Manufacturing settings' },
        ],
      },
      {
        id: 'quality',
        name: 'Quality Context',
        modules: [
          { id: 'quality-gates', name: 'Quality Gates', description: 'Gate definitions, thresholds' },
          { id: 'acceptance-criteria', name: 'Acceptance Criteria', description: 'Part acceptance rules' },
          { id: 'rejection-criteria', name: 'Rejection Criteria', description: 'Part rejection rules' },
        ],
      },
      {
        id: 'topology',
        name: 'Topology Context',
        modules: [
          { id: 'cad-models', name: 'CAD Models', description: '3D geometry data (STEP/IGES)' },
          { id: 'critical-regions', name: 'Critical Regions', description: 'Areas requiring special attention' },
          { id: 'part-topology', name: 'Part Topology', description: 'Spatial relationships' },
        ],
      },
      {
        id: 'product',
        name: 'Product Context',
        modules: [
          { id: 'product-types', name: 'Product Types', description: 'Product definitions' },
          { id: 'part-definitions', name: 'Part Definitions', description: 'Part type specifications' },
        ],
      },
      {
        id: 'operator',
        name: 'Operator Context',
        modules: [
          { id: 'workforce-metadata', name: 'Workforce Metadata', description: 'Operator information' },
          { id: 'shift-assignments', name: 'Shift Assignments', description: 'Operator-shift mapping' },
        ],
      },
      {
        id: 'erp',
        name: 'ERP Context',
        modules: [
          { id: 'field-mappings', name: 'Field Mappings', description: 'Canonical to ERP schema mapping' },
          { id: 'column-schema', name: 'Column Schema', description: 'Database field definitions' },
        ],
      },
      {
        id: 'sop',
        name: 'SOP Context',
        modules: [
          { id: 'operator-sops', name: 'Operator SOPs', description: 'Production operator procedures' },
          { id: 'escalation-sops', name: 'Escalation SOPs', description: 'Quality escalation procedures' },
          { id: 'recovery-sops', name: 'Recovery SOPs', description: 'Error recovery procedures' },
        ],
      },
      {
        id: 'visual-references',
        name: 'Visual References',
        modules: [
          { id: 'reference-parts', name: 'Reference Parts', description: 'Images of acceptable parts' },
          { id: 'defect-examples', name: 'Defect Examples', description: 'Images showing defect types' },
          { id: 'annotations', name: 'Annotations', description: 'Marked-up reference images' },
        ],
      },
      {
        id: 'knowledge-domains',
        name: 'Knowledge Domains',
        modules: [
          { id: 'defect-kb', name: 'Defect Knowledge Base', description: 'Complete defect taxonomy' },
          { id: 'cause-mappings', name: 'Cause Mappings', description: 'Defect → root cause relationships' },
          { id: 'remediation', name: 'Remediation', description: 'Preventive actions' },
        ],
      },
      {
        id: 'ppap',
        name: 'PPAP',
        modules: [
          { id: 'ppap-packages', name: 'PPAP Packages', description: 'Part approval process documents' },
          { id: 'approval-records', name: 'Approval Records', description: 'Approval history' },
        ],
      },
      {
        id: 'sources',
        name: 'Sources',
        modules: [
          { id: 'raw-documents', name: 'Raw Documents', description: 'Original PDFs, DOCX, XLSX' },
          { id: 'cad-sources', name: 'CAD Sources', description: 'Original CAD files' },
          { id: 'source-metadata', name: 'Source Metadata', description: 'Document provenance' },
        ],
      },
      {
        id: 'retrieval',
        name: 'Retrieval',
        modules: [
          { id: 'knowledge-indexes', name: 'Knowledge Indexes', description: 'Optimized for retrieval' },
          { id: 'metadata-indexes', name: 'Metadata Indexes', description: 'Source provenance tracking' },
          { id: 'processing-state', name: 'Processing State', description: 'Pipeline status' },
        ],
      },
      {
        id: 'runtime',
        name: 'Runtime Context',
        modules: [
          { id: 'active-context', name: 'Active Context', description: 'Runtime state (cognition-writable)' },
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
