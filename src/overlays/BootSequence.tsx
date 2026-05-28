import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  onComplete: () => void
}

const BOOT_LINES = [
  { text: 'TVASTR INDUSTRIAL COGNITION RUNTIME', delay: 0, color: '#00ffff' },
  { text: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', delay: 200, color: '#00ffff20' },
  { text: '', delay: 300, color: '' },
  { text: 'Initializing cognition substrate...', delay: 400, color: '#ffffff80' },
  { text: '  → PIRAS Cortex [ONLINE]', delay: 700, color: '#8b5cf6' },
  { text: '  → Vajra Cortex [ONLINE]', delay: 1000, color: '#00ffff' },
  { text: '  → Client Cortex [MOUNTED]', delay: 1300, color: '#22c55e' },
  { text: '  → SCADA Cortex [PLANNED]', delay: 1500, color: '#f59e0b80' },
  { text: '  → Business Cortex [PLANNED]', delay: 1650, color: '#f59e0b80' },
  { text: '', delay: 1800, color: '' },
  { text: 'Loading pipeline schemas...', delay: 1900, color: '#ffffff80' },
  { text: '  → 13 inspection stages loaded', delay: 2100, color: '#ffffff60' },
  { text: '  → Energy reasoning (Phase-K) ready', delay: 2300, color: '#ec4899' },
  { text: '  → Lyapunov stability checks active', delay: 2450, color: '#22c55e' },
  { text: '', delay: 2600, color: '' },
  { text: 'Establishing neural pathways...', delay: 2700, color: '#ffffff80' },
  { text: '  → 4 inter-cortex connections', delay: 2900, color: '#ffffff60' },
  { text: '  → Event subscription active', delay: 3050, color: '#ffffff60' },
  { text: '', delay: 3200, color: '' },
  { text: 'COGNITION VISUALIZER v1.0 — READY', delay: 3400, color: '#00ffff' },
  { text: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', delay: 3500, color: '#00ffff20' },
]

export function BootSequence({ onComplete }: Props) {
  const [visibleLines, setVisibleLines] = useState<number>(0)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    const timers: NodeJS.Timeout[] = []
    BOOT_LINES.forEach((line, i) => {
      timers.push(setTimeout(() => setVisibleLines(i + 1), line.delay))
    })
    // Fade out after all lines
    timers.push(setTimeout(() => setFadeOut(true), 3800))
    timers.push(setTimeout(() => onComplete(), 4500))
    return () => timers.forEach(clearTimeout)
  }, [onComplete])

  return (
    <AnimatePresence>
      {!fadeOut && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="w-full h-full bg-[#000008] flex items-center justify-center"
        >
          <div className="max-w-lg w-full px-8">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8 text-center"
            >
              <div className="text-[10px] tracking-[0.5em] text-white/20 mb-2">
                INDUSTRIAL COGNITION SYSTEM
              </div>
              <div className="text-2xl tracking-[0.4em] text-cyan-400 font-light holo-text">
                TVASTR
              </div>
            </motion.div>

            {/* Boot log */}
            <div className="font-mono text-[11px] leading-relaxed space-y-0.5">
              {BOOT_LINES.slice(0, visibleLines).map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.15 }}
                  style={{ color: line.color }}
                >
                  {line.text || '\u00A0'}
                </motion.div>
              ))}
            </div>

            {/* Progress bar */}
            <div className="mt-8 w-full h-[2px] bg-white/5 rounded overflow-hidden">
              <motion.div
                className="h-full bg-cyan-400/60"
                initial={{ width: '0%' }}
                animate={{ width: `${(visibleLines / BOOT_LINES.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
