import { create } from 'zustand'

export type VisualizationMode = 
  | 'cortex-topology'
  | 'piras-runtime'
  | 'vajra-executive'
  | 'client-context'
  | 'process-intelligence'

export type CortexId = 'vajra' | 'piras' | 'client' | 'scada' | 'business'

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
      role: 'Executive Intelligence',
      status: 'active',
      color: '#00ffff',
      position: [0, 2.5, 0],
      modules: [
        'Query Classifier', 'Query Router', 'Retrieval Engine',
        'Context Compiler', 'Reasoning Engine', 'LLM Runtime',
        'Memory System', 'Introspection', 'Investigation'
      ],
      connections: [
        { target: 'piras', type: 'orchestration', strength: 0.9 },
        { target: 'client', type: 'retrieval', strength: 0.7 },
      ]
    },
    {
      id: 'piras',
      name: 'The PIRAS Cortex',
      role: 'Perception & Reasoning',
      status: 'active',
      color: '#8b5cf6',
      position: [-3.5, -1, 0],
      modules: [
        'Quality Gate', 'YOLO Detection', 'Patch Classification',
        'Signal Extraction', 'Signal Classification', 'Consolidation',
        'Multi-Signal Fusion', 'Energy Reasoning', 'Decision Engine',
        'Telemetry', 'Persistence', 'Plant Intelligence'
      ],
      connections: [
        { target: 'client', type: 'context_mount', strength: 0.8 },
        { target: 'vajra', type: 'event_stream', strength: 0.6 },
      ]
    },
    {
      id: 'client',
      name: 'The Client Cortex',
      role: 'Semantic Factory Memory',
      status: 'stable',
      color: '#22c55e',
      position: [3.5, -1, 0],
      modules: [
        'Identity', 'Calibration', 'Knowledge Domains',
        'Quality Gates', 'SOPs', 'ERP Mappings',
        'CAD References', 'Runtime Context'
      ],
      connections: []
    },
    {
      id: 'scada',
      name: 'The SCADA Cortex',
      role: 'Industrial Automation',
      status: 'planned',
      color: '#f59e0b',
      position: [-2, -4, -2],
      modules: ['PLC Integration', 'Sensor Fusion', 'Automation Control'],
      connections: []
    },
    {
      id: 'business',
      name: 'The Business Cortex',
      role: 'Enterprise Intelligence',
      status: 'planned',
      color: '#f59e0b',
      position: [2, -4, -2],
      modules: ['ERP Analytics', 'MES Integration', 'Business Intelligence'],
      connections: []
    },
  ],
}))
