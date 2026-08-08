import { useAppStore, WORLD_META } from '../stores/appStore'
import type { World } from '../stores/appStore'
import type { ReactElement } from 'react'

/* ============================================
   MOBILE BOTTOM NAVIGATION
   Fixed bottom tab bar for world navigation on mobile
   ============================================ */

const WORLDS: World[] = ['explore', 'observe', 'understand', 'evolve']

// World icons (simple, recognizable shapes)
const WORLD_ICONS: Record<World, ReactElement> = {
  explore: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  observe: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  understand: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  evolve: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
}

export function MobileBottomNav() {
  const currentWorld = useAppStore((s) => s.currentWorld)
  const setWorld = useAppStore((s) => s.setWorld)
  const isMobile = useAppStore((s) => s.isMobile)

  // Only render on mobile
  if (!isMobile) return null

  return (
    <nav className="mobile-bottom-nav hide-desktop">
      {WORLDS.map((world) => {
        const isActive = currentWorld === world
        const meta = WORLD_META[world]
        
        return (
          <button
            key={world}
            onClick={() => setWorld(world)}
            className={`mobile-bottom-nav-item ${isActive ? 'active' : ''}`}
            title={meta.description}
          >
            <span className="icon">{WORLD_ICONS[world]}</span>
            <span>{world}</span>
          </button>
        )
      })}
    </nav>
  )
}
