/**
 * Real-time Event Engine
 * Connects to Vajra (8001) and PIRAS (8000) WebSocket endpoints
 * Falls back to simulated events when backends are unavailable
 */

import { useCortexStore } from '../store/cortexStore'
import type { CortexId } from '../store/cortexStore'

interface EventEngineConfig {
  vajraUrl: string
  pirasUrl: string
  pirasEventsUrl: string
  reconnectDelay: number
  maxReconnectAttempts: number
}

const DEFAULT_CONFIG: EventEngineConfig = {
  vajraUrl: 'ws://localhost:8001/ws',
  pirasUrl: 'ws://localhost:8000/ws/plant_updates',
  pirasEventsUrl: 'ws://localhost:8000/ws/events',
  reconnectDelay: 5000,
  maxReconnectAttempts: 10,
}

class EventEngine {
  private config: EventEngineConfig
  private vajraWs: WebSocket | null = null
  private pirasWs: WebSocket | null = null
  private reconnectAttempts = { vajra: 0, piras: 0 }
  private connected = { vajra: false, piras: false }

  constructor(config: EventEngineConfig = DEFAULT_CONFIG) {
    this.config = config
  }

  start() {
    this.connectVajra()
    this.connectPiras()
  }

  stop() {
    this.vajraWs?.close()
    this.pirasWs?.close()
    this.vajraWs = null
    this.pirasWs = null
  }

  get status() {
    return this.connected
  }

  private connectVajra() {
    try {
      this.vajraWs = new WebSocket(this.config.vajraUrl)
      this.vajraWs.onopen = () => {
        this.connected.vajra = true
        this.reconnectAttempts.vajra = 0
        this.emitEvent('vajra', 'connection.established', {})
      }
      this.vajraWs.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data)
          this.emitEvent('vajra', data.type || 'vajra.event', data)
        } catch { /* ignore */ }
      }
      this.vajraWs.onclose = () => {
        this.connected.vajra = false
        this.scheduleReconnect('vajra')
      }
      this.vajraWs.onerror = () => {
        this.connected.vajra = false
      }
    } catch {
      this.connected.vajra = false
    }
  }

  private connectPiras() {
    try {
      this.pirasWs = new WebSocket(this.config.pirasUrl)
      this.pirasWs.onopen = () => {
        this.connected.piras = true
        this.reconnectAttempts.piras = 0
        this.emitEvent('piras', 'connection.established', {})
      }
      this.pirasWs.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data)
          this.emitEvent('piras', data.type || 'piras.event', data.payload || data)
        } catch { /* ignore */ }
      }
      this.pirasWs.onclose = () => {
        this.connected.piras = false
        this.scheduleReconnect('piras')
      }
      this.pirasWs.onerror = () => {
        this.connected.piras = false
      }
    } catch {
      this.connected.piras = false
    }
  }

  private scheduleReconnect(source: 'vajra' | 'piras') {
    if (this.reconnectAttempts[source] >= this.config.maxReconnectAttempts) return
    this.reconnectAttempts[source]++
    setTimeout(() => {
      if (source === 'vajra') this.connectVajra()
      else this.connectPiras()
    }, this.config.reconnectDelay)
  }

  private emitEvent(source: CortexId, type: string, data: Record<string, unknown>) {
    useCortexStore.getState().addEvent({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      source,
      type,
      data,
      timestamp: Date.now(),
      confidence: typeof data.confidence === 'number' ? data.confidence : undefined,
    })
  }
}

export const eventEngine = new EventEngine()
