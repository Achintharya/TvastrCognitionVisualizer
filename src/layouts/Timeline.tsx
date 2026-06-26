import { useState } from 'react'
import { useAppStore, CORTEXES } from '../stores/appStore'

/* ============================================
   TIMELINE PANEL
   Bottom execution trace / event flow
   Inspired by: Unreal Sequencer, Datadog, Chrome DevTools
   ============================================ */

export function Timeline() {
  const events = useAppStore((s) => s.events)
  const timelineExpanded = useAppStore((s) => s.timelineExpanded)
  const setTimelineExpanded = useAppStore((s) => s.setTimelineExpanded)
  const currentWorld = useAppStore((s) => s.currentWorld)
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null)

  // Calculate time range
  const now = Date.now()
  const timeRange = 60000 // 60 seconds window
  const startTime = now - timeRange

  // Filter events in range
  const visibleEvents = events.filter(e => e.timestamp > startTime)

  return (
    <div 
      className="surface border-t border-t-[var(--border-default)] flex flex-col"
      style={{ height: timelineExpanded ? 'var(--timeline-height)' : '48px' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-12 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setTimelineExpanded(!timelineExpanded)}
            className="p-1 hover:bg-white/5 rounded transition-colors"
          >
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 16 16" 
              fill="none"
              className={`transition-transform duration-200 ${timelineExpanded ? 'rotate-180' : ''}`}
            >
              <path 
                d="M4 10L8 6L12 10" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <span className="heading-sm">Timeline</span>
          <span className="caption ml-2">{visibleEvents.length} events</span>
        </div>

        <div className="flex items-center gap-4">
          {/* Time markers */}
          <div className="flex items-center gap-2 text-[10px] text-tertiary">
            <span>-60s</span>
            <div className="w-24 h-px bg-white/10" />
            <span>now</span>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1">
            <TimelineControl icon="⏸" label="Pause" />
            <TimelineControl icon="🔄" label="Reset" />
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {timelineExpanded && (
        <div className="flex-1 overflow-hidden px-4 pb-3">
          <div className="h-full flex flex-col gap-2">
            {/* Cortex Tracks */}
            {['vajra', 'piras', 'client'].map((cortexId) => {
              const cortex = CORTEXES.find(c => c.id === cortexId)
              if (!cortex) return null
              
              const cortexEvents = visibleEvents.filter(e => e.source === cortexId)
              
              return (
                <div key={cortexId} className="flex items-center gap-3">
                  {/* Track Label */}
                  <div className="w-20 flex-shrink-0 flex items-center gap-2">
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: cortex.color }}
                    />
                    <span className="text-xs text-secondary truncate">{cortex.name}</span>
                  </div>
                  
                  {/* Track */}
                  <div className="flex-1 timeline-track relative">
                    {cortexEvents.map((event) => {
                      const position = ((event.timestamp - startTime) / timeRange) * 100
                      const isSelected = selectedEvent === event.id
                      
                      return (
                        <div
                          key={event.id}
                          className={`timeline-event cursor-pointer ${isSelected ? 'ring-1 ring-white/50' : ''}`}
                          style={{
                            left: `${position}%`,
                            width: '8px',
                            backgroundColor: cortex.color,
                          }}
                          onClick={() => setSelectedEvent(isSelected ? null : event.id)}
                          title={`${event.type} - ${event.category}`}
                        />
                      )
                    })}
                  </div>
                </div>
              )
            })}

            {/* Event Details (when selected) */}
            {selectedEvent && (
              <EventDetails 
                eventId={selectedEvent} 
                onClose={() => setSelectedEvent(null)} 
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/* ============================================
   EVENT DETAILS
   ============================================ */

function EventDetails({ eventId, onClose }: { eventId: string; onClose: () => void }) {
  const events = useAppStore((s) => s.events)
  const event = events.find(e => e.id === eventId)
  
  if (!event) return null
  
  const cortex = CORTEXES.find(c => c.id === event.source)
  const targetCortex = event.target ? CORTEXES.find(c => c.id === event.target) : null

  return (
    <div className="surface-elevated rounded p-3 flex items-center gap-4 animate-slide-in-up">
      <div className="flex items-center gap-2">
        <div 
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: cortex?.color }}
        />
        <span className="text-sm font-medium">{event.type}</span>
      </div>
      
      <div className="divider-vertical h-4" />
      
      <div className="flex items-center gap-4 text-sm text-secondary">
        <span>{event.category}</span>
        {targetCortex && (
          <>
            <span className="text-tertiary">→</span>
            <span style={{ color: targetCortex.color }}>{targetCortex.name}</span>
          </>
        )}
        {event.confidence !== undefined && (
          <span className="text-xs bg-white/5 px-2 py-0.5 rounded">
            {(event.confidence * 100).toFixed(0)}% confidence
          </span>
        )}
      </div>
      
      <div className="ml-auto flex items-center gap-2">
        <span className="text-xs text-tertiary font-mono">
          {new Date(event.timestamp).toLocaleTimeString('en-US', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit',
            fractionalSecondDigits: 2
          })}
        </span>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-white/10 rounded"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M3 3L9 9M9 3L3 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  )
}

/* ============================================
   TIMELINE CONTROL BUTTON
   ============================================ */

function TimelineControl({ icon, label }: { icon: string; label: string }) {
  return (
    <button 
      className="w-7 h-7 flex items-center justify-center rounded hover:bg-white/5 transition-colors text-xs"
      title={label}
    >
      {icon}
    </button>
  )
}
