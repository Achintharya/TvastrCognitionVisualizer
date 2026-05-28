import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'
import { useCortexStore } from '../core/store/cortexStore'
import { CortexNode3D } from './nodes/CortexNode3D'
import { NeuralPathway } from './nodes/NeuralPathway'
import { ParticleField } from './particles/ParticleField'
import { PirasRuntimeScene } from '../modes/PIRASRuntime/PirasRuntimeScene'
import { VajraExecutiveScene } from '../modes/VajraExecutive/VajraExecutiveScene'
import { ClientContextScene } from '../modes/ClientContext/ClientContextScene'
import { ProcessIntelligenceScene } from '../modes/ProcessIntelligence/ProcessIntelligenceScene'

export function CortexSpace() {
  const mode = useCortexStore((s) => s.mode)
  const cortexes = useCortexStore((s) => s.cortexes)
  const groupRef = useRef<THREE.Group>(null)

  useFrame((_, delta) => {
    if (groupRef.current && mode === 'cortex-topology') {
      groupRef.current.rotation.y += delta * 0.015
    }
  })

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.15} />
      <pointLight position={[10, 10, 10]} intensity={0.4} color="#00ffff" />
      <pointLight position={[-10, -10, -10]} intensity={0.2} color="#8b5cf6" />
      <pointLight position={[0, 5, 5]} intensity={0.15} color="#ec4899" />

      {/* Background */}
      <Stars radius={100} depth={50} count={4000} factor={4} saturation={0} fade speed={0.3} />
      <fog attach="fog" args={['#000008', 18, 45]} />

      {/* Mode-specific content */}
      {mode === 'cortex-topology' && (
        <group ref={groupRef}>
          {cortexes.map((cortex) => (
            <CortexNode3D key={cortex.id} cortex={cortex} />
          ))}
          {cortexes.map((cortex) =>
            cortex.connections.map((conn) => {
              const target = cortexes.find((c) => c.id === conn.target)
              if (!target) return null
              return (
                <NeuralPathway
                  key={`${cortex.id}-${conn.target}`}
                  start={cortex.position}
                  end={target.position}
                  color={cortex.color}
                  strength={conn.strength}
                />
              )
            })
          )}
        </group>
      )}

      {mode === 'piras-runtime' && <PirasRuntimeScene />}
      {mode === 'vajra-executive' && <VajraExecutiveScene />}
      {mode === 'client-context' && <ClientContextScene />}
      {mode === 'process-intelligence' && <ProcessIntelligenceScene />}

      {/* Global particle field */}
      <ParticleField />

      {/* Controls */}
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        minDistance={4}
        maxDistance={30}
        enablePan={false}
      />

      {/* Post-processing */}
      <EffectComposer>
        <Bloom
          intensity={1.8}
          luminanceThreshold={0.15}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
        <ChromaticAberration
          blendFunction={BlendFunction.NORMAL}
          offset={new THREE.Vector2(0.0004, 0.0004)}
        />
      </EffectComposer>
    </>
  )
}
