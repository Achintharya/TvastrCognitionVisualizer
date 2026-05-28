import { useCortexStore } from '../core/store/cortexStore'
import type { VisualizationMode } from '../core/store/cortexStore'
import { motion } from 'framer-motion'

const MODES: { id: VisualizationMode; label: string; icon: string }[] = [
  { id: 'cortex-topology', label: 'Topology', icon: '◈' },
  { id: 'piras-runtime', label: 'PIRAS', icon: '⬡' },
  { id: 'vajra-executive', label: 'Vajra', icon: '◉' },
  { id: 'client-context', label: 'Client', icon: '◧' },
  { id: 'process-intelligence', label: 'Process', icon: '◬' },
]

export function ModeSelector() {
  const mode = useCortexStore((s) => s.mode)
  const setMode = useCortexStore((s) => s.setMode)

  return (
    <div className="flex justify-start pl-4 pt-2">
      <div className="holo-panel px-3 py-2 flex gap-1.5 backdrop-blur-md bg-black/60 border border-white/15 rounded-lg">
        {MODES.map((m) => (
          <motion.button
            key={m.id}
            onClick={() => setMode(m.id)}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            className={`px-4 py-2 rounded-md text-sm font-medium tracking-wider transition-all duration-300 ${
              mode === m.id
                ? 'bg-cyan-400/15 text-cyan-400 border border-cyan-400/50 shadow-[0_0_12px_rgba(0,255,255,0.2)]'
                : 'text-white hover:text-white border border-white/10 hover:border-white/30 hover:bg-white/5'
            }`}
          >
            <span className="mr-1.5 text-base">{m.icon}</span>
            {m.label}
          </motion.button>
        ))}
      </div>
    </div>
  )
}
