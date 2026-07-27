import { create } from 'zustand'

export type VisualizationMode = 
  | 'cortex-topology'
  | 'piras-runtime'
  | 'vajra-executive'
  | 'client-context'
  | 'process-intelligence'

export type CortexId = 'vajra' | 'piras' | 'client' | 'scada' | 'business' | 'mis'

export interface CortexNode {
  id: CortexId
  name: string
  role: string
  status: 'active' | 'stable' | 'experimental' | 'planned'
  color: string
  modules: string[]
  position: [number, number, number]
  connections: { target: CortexId; type: string; strength: number }[]
}

export interface RuntimeEvent {
  id: string
  source: CortexId
  target?: CortexId
  type: string
  data: Record<string, unknown>
  timestamp: number
  confidence?: number
}

interface CortexState {
  mode: VisualizationMode
  setMode: (mode: VisualizationMode) => void
  selectedCortex: CortexId | null
  selectCortex: (id: CortexId | null) => void
  cortexes: CortexNode[]
  events: RuntimeEvent[]
  addEvent: (event: RuntimeEvent) => void
  hoveredNode: string | null
  setHoveredNode: (id: string | null) => void
  inspectionActive: boolean
  setInspectionActive: (active: boolean) => void
  energyLevel: number
  setEnergyLevel: (level: number) => void
}

export const useCortexStore = create<CortexState>((set) => ({
  mode: 'cortex-topology',
  setMode: (mode) => set({ mode }),
  selectedCortex: null,
  selectCortex: (id) => set({ selectedCortex: id }),
  hoveredNode: null,
  setHoveredNode: (id) => set({ hoveredNode: id }),
  inspectionActive: false,
  setInspectionActive: (active) => set({ inspectionActive: active }),
  energyLevel: 0.7,
  setEnergyLevel: (level) => set({ energyLevel: level }),
  events: [],
  addEvent: (event) => set((s) => ({ events: [...s.events.slice(-50), event] })),

  cortexes: [
    {
      id: 'vajra',
      name: 'The Vajra Cortex',
      role: 'Retrieval-First Executive Cognition',
      status: 'active',
      color: '#f5a623',   // amber — matches design-system dark theme
      position: [0, 2.5, 0],
      modules: [
        // Cognition
        'Intent Classification', 'Reasoning Chains', 'Response Generation', 'LLM Runtime (Groq / OpenAI)',
        // Retrieval
        'Retrieval Engine', 'Retrieval Planner', 'Database Cognition', 'Adapters (PIRAS, ERP, Docs)',
        // Context
        'Context Compiler', 'Provenance', 'ClientCortex Integration',
        // Executive
        'Orchestrator',
        // Investigation
        'Audit Generation', 'Investigation Tracking',
        // Voice
        'TTS Runtime (Sarvam, Kokoro)', 'STT Runtime', 'Wake Word Detection', 'Voice Orchestration (11 langs)',
        // Introspection
        'AST Analysis', 'Dependency Graphs', 'Telemetry',
        // Memory
        'Session Memory',
        // Observability
        'Logging', 'Metrics', 'Tracing',
      ],
      connections: [
        { target: 'piras', type: 'orchestration', strength: 0.9 },
        { target: 'piras', type: 'retrieval', strength: 0.8 },
        { target: 'client', type: 'retrieval', strength: 0.85 },
      ],
    },
    {
      id: 'piras',
      name: 'The PIRAS Cortex (TvastrRAS)',
      role: 'AI-Powered Casting Defect Detection & RCA',
      status: 'active',
      color: '#5b9cf5',   // blue — matches design-system dark theme
      position: [-3.5, -1, 0],
      modules: [
        // Vision
        'YOLO Detection', 'Patch System (256×256 / 128px)', 'Anomaly Detection',
        // Signals
        'Signal Extraction (11 signals)', 'Signal Classification (40% weight)', 'Multi-Signal Fusion',
        // Reasoning
        'Energy Reasoning (Phase-K)', 'Ownership Classifier (6 contracts)', 'Consolidation', 'Decision Engine',
        // Pipeline
        '11-Stage Pipeline (Stage 0–10)', 'Fast Path (<100ms)', 'Slow Path (<250ms)',
        // Intelligence
        'Auto-Calibration (ACO/MOS)', 'Fingerprinting (DBSCAN)', 'Prototype System', 'SCRATA System', 'Plant Intelligence (TIER_3)',
        // Traceability
        'Heat Resolver', 'ERP Integration', 'Traceability Engine',
        // Persistence
        'Database', 'Failure Memory',
        // API & Deployment
        'REST API (25 endpoints)', 'Batch Processing', 'Embedded Python v2.0', 'OTA Updates', 'Licensing (TIER_1/2/3)',
      ],
      connections: [
        { target: 'client', type: 'context_mount', strength: 0.8 },
        { target: 'vajra', type: 'event_stream', strength: 0.7 },
      ],
    },
    {
      id: 'client',
      name: 'The Client Cortex',
      role: 'Semantic Factory Memory (Customer Knowledge Layer)',
      status: 'stable',
      color: '#4ade80',   // green — matches design-system dark theme
      position: [3.5, -1, 0],
      modules: [
        // Identity & Process
        'Client Profile', 'Factory Identity', 'Shifts & Schedules', 'Process Parameters',
        // Quality
        'Quality Gates', 'Acceptance Criteria', 'Rejection Criteria',
        // Topology & Product
        'CAD Models (STEP/IGES)', 'Critical Regions', 'Part Topology', 'Product Types', 'Part Definitions',
        // Operator
        'Workforce Metadata', 'Shift Assignments',
        // ERP & SOPs
        'Field Mappings', 'Column Schema', 'Operator SOPs', 'Escalation SOPs', 'Recovery SOPs',
        // Knowledge & References
        'Defect Knowledge Base', 'Cause Mappings', 'Remediation', 'Visual References', 'PPAP Packages',
        // Retrieval
        'Knowledge Indexes', 'Metadata Indexes', 'Processing State', 'Active Context',
      ],
      connections: [],
    },
    {
      id: 'scada',
      name: 'The SCADA Cortex',
      role: 'Industrial Automation',
      status: 'planned',
      color: '#22d3ee',   // cyan — matches design-system dark theme
      position: [-2, -4, -2],
      modules: ['PLC Integration', 'Sensor Fusion', 'Automation Control'],
      connections: [
        { target: 'piras', type: 'automation', strength: 0.7 },
      ],
    },
    {
      id: 'business',
      name: 'The Business Cortex',
      role: 'Enterprise Intelligence',
      status: 'planned',
      color: '#a78bfa',   // purple — matches design-system dark theme
      position: [2, -4, -2],
      modules: ['ERP Analytics', 'MES Integration', 'Business Intelligence'],
      connections: [
        { target: 'vajra', type: 'retrieval', strength: 0.6 },
      ],
    },
    {
      id: 'mis',
      name: 'The MIS Cortex',
      role: 'Executive Management Information System',
      status: 'active',
      color: '#f472b6',   // rose/pink
      position: [0, -4, 2],
      modules: [
        // Dashboards
        'Plant Dashboards', 'Department Dashboards', 'KPI Cards',
        // Plants
        'Castco', 'CPL', 'Alloy Steels', 'VeeCast', 'SIPL',
        // Departments
        'Production', 'Quality', 'Maintenance', 'Sales', 'Finance',
        // Reporting
        'PDF Generation (WeasyPrint)', 'Daily Scheduler (08:00)', 'Email Delivery (SMTP)', 'Enterprise Report', 'Plant Reports',
        // Data & Auth
        'SQL Server', 'DEMO Mode', 'JWT Authentication', 'SQLite User DB',
        // API & Frontend
        'FastAPI Backend (9000)', 'Plant Routes', 'Dashboard Routes', 'Next.js 14 (3001)', 'Zustand State', 'Recharts',
        // Future
        'Medhas AI Summaries', 'Risk Alerts', 'Anomaly Detection',
      ],
      connections: [
        { target: 'vajra', type: 'retrieval', strength: 0.7 },
        { target: 'piras', type: 'retrieval', strength: 0.6 },
      ],
    },
  ],
}))
