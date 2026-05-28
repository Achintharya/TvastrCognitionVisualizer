import { useEffect, useRef } from 'react'
import { useCortexStore } from '../core/store/cortexStore'
import { motion } from 'framer-motion'

// Simulated telemetry events
const EVENT_TYPES = [
  { type: 'inspection.started', source: 'piras' as const, color: '#8b5cf6' },
  { type: 'signal.extracted', source: 'piras' as const, color: '#22c55e' },
  { type: 'energy.converged', source: 'piras' as const, color: '#ec4899' },
  { type: 'decision.made', source: 'piras' as const, color: '#ef4444' },
  { type: 'query.classified', source: 'vajra' as const, color: '#00ffff' },
  { type: 'retrieval.complete', source: 'vajra' as const, color: '#3b82f6' },
  { type: 'context.mounted', source: 'client' as const, color: '#22c55e' },
  { type: 'telemetry.logged', source: 'piras' as const, color: '#6b7280' },
]

export function TelemetryStream() {
  const events = useCortexStore((s) => s.events)
  const addEvent = useCortexStore((s) => s.addEvent)
  const mode = useCortexStore((s) => s.mode)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Simulate events
  useEffect(() => {
    const interval = setInterval(() => {
      const evt = EVENT_TYPES[Math.floor(Math.random() * EVENT_TYPES.length)]
      addEvent({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        source: evt.source,
        type: evt.type,
        data: { confidence: Math.random() * 0.4 + 0.6 },
        timestamp: Date.now(),
        confidence: Math.random() * 0.4 + 0.6,
      })
    }, 2000 + Math.random() * 3000)
    return () => clearInterval(interval)
  }, [addEvent])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [events])

  return (
    <div className="p-3 h-full flex flex-col">
      <div className="holo-panel p-3 flex-1 flex flex-col overflow-hidden">
        <div className="text-sm text-white/60 tracking-wider mb-3 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          TELEMETRY STREAM
        </div>

        {/* Event metrics */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <MetricCard label="Events" value={events.length.toString()} color="#00ffff" />
          <MetricCard label="Mode" value={mode.split('-')[0].toUpperCase()} color="#8b5cf6" />
          <MetricCard
            label="Conf"
            value={events.length > 0 ? (events[events.length - 1].confidence || 0).toFixed(2) : '—'}
            color="#22c55e"
          />
        </div>

        {/* Event log */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-1">
          {events.slice(-20).map((event) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-start gap-2 py-1"
            >
              <div className="text-xs text-white/40 mt-0.5 shrink-0">
                {new Date(event.timestamp).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-white/70 truncate">
                  <span style={{ color: EVENT_TYPES.find(e => e.type === event.type)?.color || '#fff' }}>
                    {event.type}
                  </span>
                </div>
              </div>
              {event.confidence && (
                <div className="text-xs text-white/50 shrink-0">
                  {(event.confidence * 100).toFixed(0)}%
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

function MetricCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="text-center py-2 rounded border border-white/10 bg-white/[0.03]">
      <div className="text-base font-medium" style={{ color }}>{value}</div>
      <div className="text-xs text-white/50 uppercase">{label}</div>
    </div>
  )
}
