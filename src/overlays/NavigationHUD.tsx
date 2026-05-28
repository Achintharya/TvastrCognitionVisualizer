import { useCortexStore } from '../core/store/cortexStore'
import { motion } from 'framer-motion'

const MODE_TITLES: Record<string, string> = {
  'cortex-topology': 'CORTEX TOPOLOGY',
  'piras-runtime': 'PIRAS RUNTIME',
  'vajra-executive': 'VAJRA EXECUTIVE',
  'client-context': 'CLIENT CORTEX',
  'process-intelligence': 'PROCESS INTELLIGENCE',
}

export function NavigationHUD() {
  const mode = useCortexStore((s) => s.mode)
  const selectedCortex = useCortexStore((s) => s.selectedCortex)
  const cortexes = useCortexStore((s) => s.cortexes)
  const selected = cortexes.find((c) => c.id === selectedCortex)

  return (
    <div className="flex items-center justify-between px-6 py-3">
      {/* Left: System title */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-xs text-cyan-400/80 tracking-[0.3em] uppercase font-light">
            Tvastr
          </span>
        </div>
        <span className="text-[10px] text-white/50 tracking-wider">
          COGNITION VISUALIZER v1.0
        </span>
      </div>

      {/* Center: Mode indicator */}
      <motion.div
        key={mode}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="text-sm tracking-[0.4em] text-white/70 holo-text">
          {MODE_TITLES[mode]}
        </div>
      </motion.div>

      {/* Right: Selected cortex info */}
      <div className="text-right">
        {selected ? (
          <div>
            <div className="text-xs" style={{ color: selected.color }}>
              {selected.name}
            </div>
            <div className="text-[10px] text-white/50">{selected.role}</div>
          </div>
        ) : (
          <div className="text-[10px] text-white/50">
            {cortexes.filter(c => c.status === 'active').length} CORTEXES ACTIVE
          </div>
        )}
      </div>
    </div>
  )
}
