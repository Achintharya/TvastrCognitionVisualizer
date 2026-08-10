import { useAppStore, WORLD_META } from '../stores/appStore'
import type { World } from '../stores/appStore'

const WORLDS: World[] = ['explore', 'observe', 'understand', 'evolve']

export function WorldNav() {
  const currentWorld = useAppStore((s) => s.currentWorld)
  const setWorld = useAppStore((s) => s.setWorld)

  return (
    <nav className="flex items-center h-full">
      {WORLDS.map((world) => {
        const meta = WORLD_META[world]
        const isActive = currentWorld === world
        
        return (
          <button
            key={world}
            onClick={() => setWorld(world)}
            className={`world-tab ${isActive ? 'active' : ''}`}
            title={meta.description}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1px' }}
          >
            <span className="capitalize">{world}</span>
            <span 
              className="text-[10px] opacity-50 hidden lg:block"
              style={{ fontWeight: 400 }}
            >
              {meta.question}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
