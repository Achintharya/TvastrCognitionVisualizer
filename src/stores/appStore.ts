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

export type CortexId = 'vajra' | 'piras' | 'client' | 'scada' | 'business' | 'mis'

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
  {
    id: 'mis',
    name: 'MIS',
    fullName: 'The MIS Cortex',
    role: 'Executive Management Information System',
    status: 'active',
    color: '#EC4899',
    colorSubtle: 'rgba(236, 72, 153, 0.15)',
    domains: [
      {
        id: 'dashboards',
        name: 'Dashboards',
        modules: [
          { id: 'plant-dashboards', name: 'Plant Dashboards', description: 'Per-plant executive KPI dashboards' },
          { id: 'dept-dashboards', name: 'Department Dashboards', description: 'Production, Quality, Maintenance, Sales, Finance' },
          { id: 'kpi-cards', name: 'KPI Cards', description: 'Real-time metric display with trends and status' },
        ],
      },
      {
        id: 'plants',
        name: 'Plants',
        modules: [
          { id: 'castco', name: 'Castco', description: 'Casting operations plant' },
          { id: 'cpl', name: 'CPL', description: 'Central processing plant' },
          { id: 'alloy-steels', name: 'Alloy Steels', description: 'Specialty alloys plant' },
          { id: 'veecast', name: 'VeeCast', description: 'Advanced casting plant' },
          { id: 'sipl', name: 'SIPL', description: 'Steel integrated plant' },
        ],
      },
      {
        id: 'departments',
        name: 'Departments',
        modules: [
          { id: 'production', name: 'Production', description: 'Output, OEE, utilization, efficiency' },
          { id: 'quality', name: 'Quality', description: 'Defect rates, yield, customer complaints' },
          { id: 'maintenance', name: 'Maintenance', description: 'Uptime, MTBF, costs, work orders' },
          { id: 'sales', name: 'Sales', description: 'Revenue, fulfillment, satisfaction' },
          { id: 'finance', name: 'Finance', description: 'Revenue, margins, costs, receivables' },
        ],
      },
      {
        id: 'reporting',
        name: 'Reporting',
        modules: [
          { id: 'pdf-generation', name: 'PDF Generation', description: 'HTML → PDF via WeasyPrint + Jinja2 templates' },
          { id: 'scheduler', name: 'Daily Scheduler', description: 'APScheduler cron at 08:00 — previous day data' },
          { id: 'email-delivery', name: 'Email Delivery', description: 'SMTP delivery to executive recipients' },
          { id: 'enterprise-report', name: 'Enterprise Report', description: 'All-plants consolidated executive report' },
          { id: 'plant-reports', name: 'Plant Reports', description: 'Per-plant PDF reports (5 plants)' },
          { id: 'manual-trigger', name: 'Manual Trigger', description: 'POST /api/reports/generate endpoint' },
        ],
      },
      {
        id: 'data',
        name: 'Data',
        modules: [
          { id: 'sql-server', name: 'SQL Server', description: 'Primary production data source (read-only)' },
          { id: 'demo-mode', name: 'DEMO Mode', description: 'Mock data engine for development/testing' },
          { id: 'report-period', name: 'Report Period', description: 'Date range helper (yesterday, last_week, custom)' },
        ],
      },
      {
        id: 'authentication',
        name: 'Authentication',
        modules: [
          { id: 'jwt-auth', name: 'JWT Authentication', description: 'Token-based auth, 480-minute expiry' },
          { id: 'sqlite-users', name: 'SQLite User DB', description: 'Local user management database' },
          { id: 'user-management', name: 'User Management CLI', description: 'Add/list/activate/deactivate/change-password' },
        ],
      },
      {
        id: 'api',
        name: 'API',
        modules: [
          { id: 'fastapi-backend', name: 'FastAPI Backend', description: 'Python FastAPI, port 9000' },
          { id: 'plant-routes', name: 'Plant Routes', description: 'GET /api/plants, GET /api/plants/{id}' },
          { id: 'dashboard-routes', name: 'Dashboard Routes', description: 'GET /api/dashboards/{plant}/{dept}' },
          { id: 'report-routes', name: 'Report Routes', description: 'POST /api/reports/generate' },
        ],
      },
      {
        id: 'frontend',
        name: 'Frontend',
        modules: [
          { id: 'nextjs', name: 'Next.js 14', description: 'App Router, TypeScript, port 3001' },
          { id: 'zustand-state', name: 'Zustand State', description: 'Auth, plant selection, sidebar state' },
          { id: 'recharts', name: 'Recharts', description: 'KPI trend visualizations' },
          { id: 'plant-selection', name: 'Plant Selection', description: 'Multi-plant card-based navigation' },
        ],
      },
      {
        id: 'medhas-integration',
        name: 'Medhas Integration',
        modules: [
          { id: 'ai-summaries', name: 'AI Summaries', description: 'Medhas Executive API — AI-generated insights (planned)' },
          { id: 'risk-alerts', name: 'Risk Alerts', description: 'Predictive warnings for critical events (planned)' },
          { id: 'anomaly-detection', name: 'Anomaly Detection', description: 'Unusual pattern detection (planned)' },
          { id: 'recommendations', name: 'Recommendations', description: 'Actionable executive suggestions (planned)' },
        ],
      },
    ],
    connections: [
      { target: 'vajra', type: 'retrieval', label: 'Queries Vajra for AI executive insights', strength: 0.7 },
      { target: 'piras', type: 'retrieval', label: 'Reads quality & inspection metrics', strength: 0.6 },
    ],
  },
]

/* ============================================
   APP STORE
   ============================================ */

/* ============================================
   LAYOUT MODES
   ============================================ */

export type LayoutMode = 'architecture' | 'dependencies' | 'dataflow' | 'runtime' | 'package'

export const LAYOUT_MODE_META: Record<LayoutMode, { label: string; shortcut: string; description: string }> = {
  architecture: { label: 'Architecture', shortcut: 'A', description: 'Hierarchical cortex topology' },
  dependencies:  { label: 'Dependencies',  shortcut: 'D', description: 'Dependency graph view' },
  dataflow:      { label: 'Data Flow',      shortcut: 'F', description: 'Data movement through system' },
  runtime:       { label: 'Runtime',        shortcut: 'R', description: 'Live runtime connections' },
  package:       { label: 'Package',        shortcut: 'P', description: 'Module & package breakdown' },
}

export type RuntimeStatus = 'running' | 'stopped' | 'warning' | 'initializing' | 'planned'

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

  // Focus mode (dims unrelated nodes)
  focusMode: boolean
  setFocusMode: (on: boolean) => void

  // Layout
  layoutMode: LayoutMode
  setLayoutMode: (mode: LayoutMode) => void

  // Search
  searchQuery: string
  setSearchQuery: (q: string) => void

  // Graph viewport
  graphZoom: number
  setGraphZoom: (z: number) => void
  graphPan: { x: number; y: number }
  setGraphPan: (pan: { x: number; y: number }) => void

  // Hovered node
  hoveredNode: string | null
  setHoveredNode: (id: string | null) => void

  // Runtime status per cortex
  runtimeStatus: Record<CortexId, RuntimeStatus>
  setRuntimeStatus: (id: CortexId, status: RuntimeStatus) => void

  // Minimap
  minimapVisible: boolean
  setMinimapVisible: (v: boolean) => void

  // Inspector
  inspectorOpen: boolean
  setInspectorOpen: (open: boolean) => void

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

  // Focus mode
  focusMode: false,
  setFocusMode: (on) => set({ focusMode: on }),

  // Layout
  layoutMode: 'architecture',
  setLayoutMode: (mode) => set({ layoutMode: mode }),

  // Search
  searchQuery: '',
  setSearchQuery: (q) => set({ searchQuery: q }),

  // Graph viewport
  graphZoom: 1,
  setGraphZoom: (z) => set({ graphZoom: z }),
  graphPan: { x: 0, y: 0 },
  setGraphPan: (pan) => set({ graphPan: pan }),

  // Hovered node
  hoveredNode: null,
  setHoveredNode: (id) => set({ hoveredNode: id }),

  // Runtime status
  runtimeStatus: {
    vajra: 'running',
    piras: 'running',
    client: 'running',
    scada: 'planned',
    business: 'planned',
    mis: 'running',
  },
  setRuntimeStatus: (id, status) =>
    set((s) => ({ runtimeStatus: { ...s.runtimeStatus, [id]: status } })),

  // Minimap
  minimapVisible: true,
  setMinimapVisible: (v) => set({ minimapVisible: v }),

  // Inspector
  inspectorOpen: true,
  setInspectorOpen: (open) => set({ inspectorOpen: open }),

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
