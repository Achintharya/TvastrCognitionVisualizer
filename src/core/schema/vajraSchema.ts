// Vajra Cortex Cognition Flow Schema — derived from actual codebase analysis

export interface CognitionStage {
  id: string
  name: string
  description: string
  color: string
  type: 'input' | 'process' | 'decision' | 'output'
}

export const VAJRA_COGNITION_FLOW: CognitionStage[] = [
  {
    id: 'query-input',
    name: 'Query Input',
    description: 'User submits natural language query via /api/v1/cognition',
    color: '#ffffff',
    type: 'input'
  },
  {
    id: 'query-classify',
    name: 'Query Classifier',
    description: 'LLM classifies query → structured JSON (type, domains, depth)',
    color: '#00ffff',
    type: 'process'
  },
  {
    id: 'query-route',
    name: 'Query Router',
    description: 'Routes to: Full Pipeline | Direct LLM | Moderate Retrieval',
    color: '#8b5cf6',
    type: 'decision'
  },
  {
    id: 'intent-parse',
    name: 'Intent Parser',
    description: 'Extract entities, temporal references, investigation targets',
    color: '#6366f1',
    type: 'process'
  },
  {
    id: 'retrieval',
    name: 'Retrieval Engine',
    description: 'Multi-source fusion: PIRAS, SQL, vectors, client context',
    color: '#3b82f6',
    type: 'process'
  },
  {
    id: 'context-compile',
    name: 'Context Compiler',
    description: 'Assemble cognition packets within token budget (8192)',
    color: '#22c55e',
    type: 'process'
  },
  {
    id: 'reasoning',
    name: 'Reasoning Engine',
    description: 'Hypothesis tracking, evidence correlation, root cause analysis',
    color: '#ec4899',
    type: 'process'
  },
  {
    id: 'llm-synthesize',
    name: 'LLM Synthesis',
    description: 'Generate evidence-grounded response (Mistral API / Ollama local)',
    color: '#f59e0b',
    type: 'process'
  },
  {
    id: 'response',
    name: 'Vajra Response',
    description: 'Evidence-grounded synthesis with provenance preservation',
    color: '#00ffff',
    type: 'output'
  },
]

export type QueryType = 'investigation' | 'debugging' | 'telemetry' | 'analytics' | 'operational' | 'architecture' | 'conversational' | 'general'

export interface QueryRoute {
  type: QueryType
  handling: 'full_pipeline' | 'moderate_retrieval' | 'direct_llm'
  retrieval: 'deep' | 'moderate' | 'none'
  color: string
}

export const QUERY_ROUTES: QueryRoute[] = [
  { type: 'investigation', handling: 'full_pipeline', retrieval: 'deep', color: '#ef4444' },
  { type: 'debugging', handling: 'full_pipeline', retrieval: 'deep', color: '#f97316' },
  { type: 'telemetry', handling: 'full_pipeline', retrieval: 'deep', color: '#f59e0b' },
  { type: 'analytics', handling: 'moderate_retrieval', retrieval: 'moderate', color: '#22c55e' },
  { type: 'operational', handling: 'moderate_retrieval', retrieval: 'moderate', color: '#3b82f6' },
  { type: 'architecture', handling: 'moderate_retrieval', retrieval: 'moderate', color: '#6366f1' },
  { type: 'conversational', handling: 'direct_llm', retrieval: 'none', color: '#8b5cf6' },
  { type: 'general', handling: 'direct_llm', retrieval: 'none', color: '#6b7280' },
]

export interface RetrievalSource {
  id: string
  name: string
  type: 'vector' | 'sql' | 'api' | 'context'
  color: string
}

export const RETRIEVAL_SOURCES: RetrievalSource[] = [
  { id: 'piras-api', name: 'PIRAS Runtime', type: 'api', color: '#8b5cf6' },
  { id: 'sql-store', name: 'SQL Storage', type: 'sql', color: '#3b82f6' },
  { id: 'turbovec', name: 'TurboVec Memory', type: 'vector', color: '#00ffff' },
  { id: 'client-ctx', name: 'Client Context', type: 'context', color: '#22c55e' },
  { id: 'episodic', name: 'Episodic Memory', type: 'vector', color: '#ec4899' },
]
