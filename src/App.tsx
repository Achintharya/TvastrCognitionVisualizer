import { Canvas } from '@react-three/fiber'
import { Suspense, useEffect, useState, lazy } from 'react'
import { useCortexStore } from './core/store/cortexStore'
import { CortexSpace } from './scene/CortexSpace'
import { BootSequence } from './overlays/BootSequence'
import { eventEngine } from './core/api/eventEngine'
import { motion, AnimatePresence } from 'framer-motion'

// Code-split overlays for smaller initial bundle
const ModeSelector = lazy(() => import('./overlays/ModeSelector').then(m => ({ default: m.ModeSelector })))
const NavigationHUD = lazy(() => import('./overlays/NavigationHUD').then(m => ({ default: m.NavigationHUD })))
const InspectionPanel = lazy(() => import('./overlays/InspectionPanel').then(m => ({ default: m.InspectionPanel })))
const TelemetryStream = lazy(() => import('./overlays/TelemetryStream').then(m => ({ default: m.TelemetryStream })))

export default function App() {
  const mode = useCortexStore((s) => s.mode)
  const setMode = useCortexStore((s) => s.setMode)
  const [booted, setBooted] = useState(false)

  // Start EventEngine on boot
  useEffect(() => {
    if (booted) {
      eventEngine.start()
      return () => eventEngine.stop()
    }
  }, [booted])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      switch (e.key) {
        case '1': setMode('cortex-topology'); break
        case '2': setMode('piras-runtime'); break
        case '3': setMode('vajra-executive'); break
        case '4': setMode('client-context'); break
        case '5': setMode('process-intelligence'); break
        case 'Escape': useCortexStore.getState().selectCortex(null); break
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [setMode])

  if (!booted) {
    return <BootSequence onComplete={() => setBooted(true)} />
  }

  return (
    <div className="w-full h-full relative overflow-hidden bg-[#000008]">
      {/* 3D Scene */}
      <Canvas
        camera={{ position: [0, 0, 12], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <CortexSpace />
        </Suspense>
      </Canvas>

      {/* 2D Overlays */}
      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 pointer-events-none"
        >
          <Suspense fallback={null}>
            <div className="absolute top-0 left-0 right-0 pointer-events-auto">
              <NavigationHUD />
            </div>
            <div className="absolute top-12 left-4 pointer-events-auto">
              <ModeSelector />
            </div>
            <div className="absolute left-0 top-24 bottom-0 w-72 pointer-events-auto">
              <TelemetryStream />
            </div>
            <div className="absolute right-0 top-12 bottom-0 w-80 pointer-events-auto">
              <InspectionPanel />
            </div>
          </Suspense>
        </motion.div>
      </AnimatePresence>

      {/* Scan line effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.03]">
        <div className="w-full h-[2px] bg-cyan-400 animate-[scan-line_8s_linear_infinite]" />
      </div>

      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,8,0.8) 100%)' }}
      />

      {/* Keyboard hint */}
      <div className="absolute bottom-16 right-4 pointer-events-none">
        <div className="text-[8px] text-white/15 tracking-wider">
          [1-5] MODES · [ESC] DESELECT · [DRAG] ORBIT
        </div>
      </div>
    </div>
  )
}
