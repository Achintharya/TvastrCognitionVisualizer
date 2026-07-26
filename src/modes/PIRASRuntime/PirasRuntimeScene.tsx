import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Sphere, Billboard } from '@react-three/drei'
import * as THREE from 'three'
import { PIRAS_PIPELINE_STAGES } from '../../core/schema/pirasSchema'
import { EnergyLandscape } from '../../scene/nodes/EnergyLandscape'

export function PirasRuntimeScene() {
  const groupRef = useRef<THREE.Group>(null)
  const particlesRef = useRef<THREE.Points>(null)

  // Layout stages in a spiral/helix
  const stagePositions = useMemo(() => {
    return PIRAS_PIPELINE_STAGES.map((_, i) => {
      const t = i / PIRAS_PIPELINE_STAGES.length
      const angle = t * Math.PI * 3
      const radius = 3 + t * 1.5
      const y = 4 - t * 8
      return [Math.cos(angle) * radius, y, Math.sin(angle) * radius] as [number, number, number]
    })
  }, [])

  // Flow particles
  const particleCount = 30
  const particlePositions = useMemo(() => new Float32Array(particleCount * 3), [])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array
      for (let i = 0; i < particleCount; i++) {
        const progress = ((t * 0.15 + i / particleCount) % 1)
        const stageIdx = Math.floor(progress * (stagePositions.length - 1))
        const nextIdx = Math.min(stageIdx + 1, stagePositions.length - 1)
        const localT = (progress * (stagePositions.length - 1)) - stageIdx
        
        const curr = stagePositions[stageIdx]
        const next = stagePositions[nextIdx]
        positions[i * 3] = curr[0] + (next[0] - curr[0]) * localT
        positions[i * 3 + 1] = curr[1] + (next[1] - curr[1]) * localT
        positions[i * 3 + 2] = curr[2] + (next[2] - curr[2]) * localT
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true
    }
  })

  return (
    <group ref={groupRef}>
      {/* Pipeline stages */}
      {PIRAS_PIPELINE_STAGES.map((stage, i) => (
        <PipelineStageNode
          key={stage.id}
          stage={stage}
          position={stagePositions[i]}
          index={i}
        />
      ))}

      {/* Connections between stages */}
      {stagePositions.slice(0, -1).map((pos, i) => (
        <StageLine key={i} start={pos} end={stagePositions[i + 1]} color={PIRAS_PIPELINE_STAGES[i].color} />
      ))}

      {/* Flow particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[particlePositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.12}
          color="#00ffff"
          transparent
          opacity={0.9}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Central energy core */}
      <EnergyCore />

      {/* Energy landscape terrain */}
      <EnergyLandscape position={[0, -5, 0]} />
    </group>
  )
}

function PipelineStageNode({ stage, position, index }: { stage: typeof PIRAS_PIPELINE_STAGES[0]; position: [number, number, number]; index: number }) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.elapsedTime
      const pulse = 1 + Math.sin(t * 2 + index * 0.5) * 0.1
      meshRef.current.scale.set(pulse, pulse, pulse)
    }
  })

  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[0.25, 16, 16]}>
        <meshStandardMaterial
          color={stage.color}
          emissive={stage.color}
          emissiveIntensity={0.5}
          transparent
          opacity={0.8}
          roughness={0.2}
          metalness={0.8}
        />
      </Sphere>
      <Billboard position={[0.5, 0, 0]}>
        <Text
          fontSize={0.15}
          color={stage.color}
          anchorX="left"
          anchorY="middle"
        >
          {stage.name}
        </Text>
      </Billboard>
    </group>
  )
}

function StageLine({ start, end, color }: { start: [number, number, number]; end: [number, number, number]; color: string }) {
  const geometry = useMemo(() => {
    const mid: [number, number, number] = [
      (start[0] + end[0]) / 2,
      (start[1] + end[1]) / 2,
      (start[2] + end[2]) / 2 + 0.3,
    ]
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(...start),
      new THREE.Vector3(...mid),
      new THREE.Vector3(...end)
    )
    return new THREE.BufferGeometry().setFromPoints(curve.getPoints(20))
  }, [start, end])

  return (
    <line geometry={geometry} {...({} as any)}>
      <lineBasicMaterial color={color} transparent opacity={0.3} />
    </line>
  )
}

function EnergyCore() {
  const ref = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.elapsedTime
      ref.current.rotation.y = t * 0.5
      ref.current.rotation.z = t * 0.3
      const s = 1 + Math.sin(t * 3) * 0.05
      ref.current.scale.set(s, s, s)
    }
  })

  return (
    <mesh ref={ref} position={[0, -1, 0]}>
      <icosahedronGeometry args={[0.5, 1]} />
      <meshStandardMaterial
        color="#ec4899"
        emissive="#ec4899"
        emissiveIntensity={0.6}
        wireframe
        transparent
        opacity={0.4}
      />
    </mesh>
  )
}
