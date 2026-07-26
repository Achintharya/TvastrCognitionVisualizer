import { type ReactNode, useEffect } from 'react'
import { useAppStore } from '../stores/appStore'
import { WorldNav } from './WorldNav'
import { NavTree } from './NavTree'
import { Inspector } from './Inspector'
import { Timeline } from './Timeline'

/* ============================================
   APP SHELL
   Main application layout structure
   
   ┌──────────────────────────────────────────┐
   │  HEADER: Logo + World Navigation         │
   ├──────┬─────────────────────────┬─────────┤
   │      │                         │         │
   │ NAV  │     MAIN CANVAS         │INSPECTOR│
   │ TREE │     (children)          │         │
   │      │                         │         │
   ├──────┴─────────────────────────┴─────────┤
   │  TIMELINE                                │
   └──────────────────────────────────────────┘
   ============================================ */

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const setWorld          = useAppStore((s) => s.setWorld)
  const setSelection      = useAppStore((s) => s.setSelection)
  const navCollapsed      = useAppStore((s) => s.navCollapsed)
  const inspectorOpen     = useAppStore((s) => s.inspectorOpen)
  const setNavCollapsed   = useAppStore((s) => s.setNavCollapsed)
  const setInspectorOpen  = useAppStore((s) => s.setInspectorOpen)
  const setLayoutMode     = useAppStore((s) => s.setLayoutMode)
  const focusMode         = useAppStore((s) => s.focusMode)
  const setFocusMode      = useAppStore((s) => s.setFocusMode)
  const minimapVisible    = useAppStore((s) => s.minimapVisible)
  const setMinimapVisible = useAppStore((s) => s.setMinimapVisible)

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const isTyping = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement

      // Search focus: / key (even outside input)
      if (e.key === '/' && !isTyping) {
        e.preventDefault()
        // Focus the search input in NavTree via a custom event
        window.dispatchEvent(new CustomEvent('focus-search'))
        return
      }

      // Ignore remaining shortcuts if typing
      if (isTyping) return

      switch (e.key) {
        // World navigation
        case '1': setWorld('explore');    break
        case '2': setWorld('observe');    break
        case '3': setWorld('understand'); break
        case '4': setWorld('evolve');     break

        // Layout modes (in Explore world)
        case 'a': case 'A': setLayoutMode('architecture'); break
        case 'd': case 'D': setLayoutMode('dependencies'); break
        case 'r': case 'R': setLayoutMode('runtime');      break
        case 'p': case 'P': setLayoutMode('package');      break

        // Focus mode toggle
        case 'f': case 'F':
          setFocusMode(!focusMode)
          break

        // Minimap toggle
        case 'm': case 'M':
          setMinimapVisible(!minimapVisible)
          break

        // Clear selection / focus
        case 'Escape':
          setSelection(null)
          if (focusMode) setFocusMode(false)
          break

        // Panel toggles
        case '[': setNavCollapsed(!navCollapsed);   break
        case ']': setInspectorOpen(!inspectorOpen); break
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [setWorld, setSelection, navCollapsed, setNavCollapsed, inspectorOpen, setInspectorOpen,
      setLayoutMode, setFocusMode, focusMode, setMinimapVisible, minimapVisible])

  return (
    <div className="h-full w-full flex flex-col bg-[var(--bg-space)]">
      {/* Header */}
      <Header />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigation — 30% */}
        {!navCollapsed && (
          <aside
            className="surface border-r border-r-[var(--border-subtle)] flex-shrink-0 animate-slide-in-left overflow-hidden"
            style={{ width: '30%', minWidth: 240, maxWidth: 480 }}
          >
            <NavTree />
          </aside>
        )}

        {/* Main Canvas — 40% (flex-1 between panels) */}
        <main className="flex-1 overflow-hidden relative">
          {children}
        </main>

        {/* Right Inspector — 30% */}
        {inspectorOpen && (
          <aside
            className="surface border-l border-l-[var(--border-subtle)] flex-shrink-0 animate-slide-in-right overflow-hidden"
            style={{ width: '30%', minWidth: 240, maxWidth: 480 }}
          >
            <Inspector />
          </aside>
        )}
      </div>

      {/* Bottom Timeline */}
      <Timeline />
    </div>
  )
}

/* ============================================
   HEADER COMPONENT
   ============================================ */

function Header() {
  const navCollapsed = useAppStore((s) => s.navCollapsed)
  const inspectorOpen = useAppStore((s) => s.inspectorOpen)
  const setNavCollapsed = useAppStore((s) => s.setNavCollapsed)
  const setInspectorOpen = useAppStore((s) => s.setInspectorOpen)
  const theme = useAppStore((s) => s.theme)
  const toggleTheme = useAppStore((s) => s.toggleTheme)

  // Apply theme class on initial mount
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  return (
    <header 
      className="surface border-b border-b-[var(--border-subtle)] flex items-center justify-between px-4 flex-shrink-0"
      style={{ height: 'var(--header-height)' }}
    >
      {/* Left: Logo & Nav Toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setNavCollapsed(!navCollapsed)}
          className="p-1.5 hover:bg-white/5 rounded transition-colors"
          title={navCollapsed ? 'Show navigation [' : 'Hide navigation ['}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="text-secondary">
            <path d="M3 4.5H15M3 9H15M3 13.5H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>

        <div className="flex items-center gap-2">
          {/* Vajra Symbol - Central identity */}
          <div className="w-6 h-6 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="3" fill="var(--cortex-vajra)" />
              <circle cx="12" cy="12" r="8" stroke="var(--cortex-vajra)" strokeWidth="1" strokeOpacity="0.3" />
              <path d="M12 4V8M12 16V20M4 12H8M16 12H20" stroke="var(--cortex-vajra)" strokeWidth="1" strokeOpacity="0.5" />
            </svg>
          </div>
          <div>
            <span className="text-sm font-medium tracking-wide">Tvastr</span>
            <span className="text-xs text-tertiary ml-2">Cognition Observatory</span>
          </div>
        </div>
      </div>

      {/* Center: World Navigation */}
      <WorldNav />

      {/* Right: Inspector Toggle & Settings */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setInspectorOpen(!inspectorOpen)}
          className={`p-1.5 rounded transition-colors ${inspectorOpen ? 'bg-white/5 text-primary' : 'hover:bg-white/5 text-secondary'}`}
          title={inspectorOpen ? 'Hide inspector ]' : 'Show inspector ]'}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <rect x="3" y="3" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
            <path d="M10.5 3V15" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </button>

        <div className="w-px h-5 bg-[var(--border-subtle)] mx-1" />

        {/* Theme Toggle: Sun/Moon */}
        <button
          onClick={toggleTheme}
          className="p-1.5 hover:bg-[var(--bg-elevated)] rounded transition-colors text-secondary"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? (
            /* Sun icon for dark mode (click to go light) */
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="9" r="3.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M9 2V4M9 14V16M16 9H14M4 9H2M14.24 3.76L12.83 5.17M5.17 12.83L3.76 14.24M14.24 14.24L12.83 12.83M5.17 5.17L3.76 3.76" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          ) : (
            /* Moon icon for light mode (click to go dark) */
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M15.5 10.5C14.5 13 12 15 9 15C5.13 15 2 11.87 2 8C2 5 4 2.5 6.5 1.5C5.5 3 5 4.5 5 6C5 9.87 8.13 13 12 13C13.5 13 15 12.5 16.5 11.5L15.5 10.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
      </div>
    </header>
  )
}
