// PIRAS Cortex Pipeline Schema — derived from actual codebase analysis

export interface PipelineStage {
  id: string
  name: string
  description: string
  color: string
  latencyMs: [number, number] // min, max
  healthStatus: 'OK' | 'DEGRADED' | 'FAILED'
  inputs: string[]
  outputs: string[]
  semanticMeaning: string
}

export const PIRAS_PIPELINE_STAGES: PipelineStage[] = [
  {
    id: 'stage-0',
    name: 'Quality Gate',
    description: 'Pre-pipeline validation: blur, brightness, contrast, resolution',
    color: '#3b82f6',
    latencyMs: [1, 5],
    healthStatus: 'OK',
    inputs: ['raw_image'],
    outputs: ['image_quality', 'quality_health'],
    semanticMeaning: 'Input integrity verification'
  },
  {
    id: 'stage-1',
    name: 'YOLO Detection',
    description: 'Casting localization + defect region proposals (0% fusion weight)',
    color: '#6366f1',
    latencyMs: [50, 150],
    healthStatus: 'OK',
    inputs: ['validated_image'],
    outputs: ['bounding_boxes', 'detection_health'],
    semanticMeaning: 'Spatial perception'
  },
  {
    id: 'stage-2',
    name: 'Patch Classification',
    description: '256×256 sliding window, stride 128px, CNN inference',
    color: '#8b5cf6',
    latencyMs: [200, 750],
    healthStatus: 'OK',
    inputs: ['casting_crop'],
    outputs: ['patch_grid', 'patch_probabilities'],
    semanticMeaning: 'Dense perception analysis'
  },
  {
    id: 'stage-2b',
    name: 'Signal Extraction',
    description: '15-dim features: LBP, GLCM, edge, blob, geometry',
    color: '#a78bfa',
    latencyMs: [10, 30],
    healthStatus: 'OK',
    inputs: ['patch_grid'],
    outputs: ['feature_vectors'],
    semanticMeaning: 'Physics-grounded feature computation'
  },
  {
    id: 'stage-2c',
    name: 'Signal Classification',
    description: 'PRIMARY classifier (40% weight) — hard threshold rules on signals',
    color: '#22c55e',
    latencyMs: [5, 15],
    healthStatus: 'OK',
    inputs: ['feature_vectors'],
    outputs: ['signal_class', 'signal_confidence'],
    semanticMeaning: 'Signal-first defect identification'
  },
  {
    id: 'stage-3',
    name: 'Consolidation',
    description: 'Zone mapping, merge, SCRATA integration, topology score',
    color: '#f59e0b',
    latencyMs: [10, 30],
    healthStatus: 'OK',
    inputs: ['signal_class', 'patch_grid', 'scrata_db'],
    outputs: ['defect_profile', 'topology_score', 'causes'],
    semanticMeaning: 'Perception synthesis'
  },
  {
    id: 'stage-4',
    name: 'Multi-Signal Fusion',
    description: 'Signal(45%) + LLM(35%) + Agreement(20%) → fused score',
    color: '#00ffff',
    latencyMs: [5, 10],
    healthStatus: 'OK',
    inputs: ['signal_score', 'llm_score', 'agreement_score'],
    outputs: ['fused_confidence', 'fusion_breakdown'],
    semanticMeaning: 'Multi-modal consensus'
  },
  {
    id: 'stage-5',
    name: 'Topology Integration',
    description: 'Cluster density, coverage, anomaly distribution metrics',
    color: '#06b6d4',
    latencyMs: [5, 10],
    healthStatus: 'OK',
    inputs: ['topology_score', 'anomaly_distribution'],
    outputs: ['enriched_state'],
    semanticMeaning: 'Spatial coherence assessment'
  },
  {
    id: 'stage-6',
    name: 'Energy Reasoning',
    description: 'Phase-K: E=-log(p+ε), additive forces, Lyapunov stability',
    color: '#ec4899',
    latencyMs: [50, 150],
    healthStatus: 'OK',
    inputs: ['enriched_state', 'topology_force', 'scrata_force', 'anomaly_force', 'llm_force'],
    outputs: ['energy_landscape', 'final_probabilities', 'stability_status'],
    semanticMeaning: 'Dynamical convergence to equilibrium'
  },
  {
    id: 'stage-7',
    name: 'Decision',
    description: '3-tier: REJECT(≥0.70) | REVIEW | ACCEPT(≤0.30)',
    color: '#ef4444',
    latencyMs: [1, 5],
    healthStatus: 'OK',
    inputs: ['final_probabilities', 'review_triggers'],
    outputs: ['decision', 'confidence'],
    semanticMeaning: 'Actionable determination'
  },
  {
    id: 'stage-8',
    name: 'Visualization',
    description: 'Heatmaps, PDFs, annotated images',
    color: '#6b7280',
    latencyMs: [50, 200],
    healthStatus: 'OK',
    inputs: ['decision', 'patch_grid'],
    outputs: ['reports', 'heatmap'],
    semanticMeaning: 'Human-readable output'
  },
  {
    id: 'stage-9',
    name: 'Telemetry',
    description: 'Run logging, signal traces, feedback',
    color: '#6b7280',
    latencyMs: [1, 5],
    healthStatus: 'OK',
    inputs: ['full_state'],
    outputs: ['telemetry_logs'],
    semanticMeaning: 'Observability capture'
  },
  {
    id: 'stage-10',
    name: 'Persistence + PI',
    description: 'SQL, fingerprinting, defect graph, process intelligence',
    color: '#22c55e',
    latencyMs: [20, 100],
    healthStatus: 'OK',
    inputs: ['decision', 'defect_profile', 'erp_context'],
    outputs: ['persisted_record', 'fingerprint', 'pi_update'],
    semanticMeaning: 'Industrial memory formation'
  },
]

export interface EnergyForce {
  name: string
  weight: number
  value: number
  color: string
}

export interface EnergyState {
  forces: EnergyForce[]
  totalEnergy: number
  lyapunovStable: boolean
  convergenceRate: number
}

export const DEFAULT_ENERGY_STATE: EnergyState = {
  forces: [
    { name: 'Topology', weight: 0.30, value: 0.52, color: '#00ffff' },
    { name: 'SCRATA', weight: 0.25, value: 0.68, color: '#8b5cf6' },
    { name: 'Anomaly', weight: 0.20, value: 0.35, color: '#f59e0b' },
    { name: 'LLM', weight: 0.25, value: 0.72, color: '#ec4899' },
  ],
  totalEnergy: 0.287,
  lyapunovStable: true,
  convergenceRate: 0.94,
}
