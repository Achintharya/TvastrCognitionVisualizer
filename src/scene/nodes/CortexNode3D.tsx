import { useRef, useState, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Sphere, Ring, Billboard } from '@react-three/drei'
import * as THREE from 'three'
import { useCortexStore } from '../../core/store/cortexStore'
import type { CortexNode } from '../../core/store/cortexStore'

interface Props {
  cortex: CortexNode
}

export function CortexNode3D({ cortex }: Props) {
  const meshRef = useRef<THREE.Mesh>(null)
  const ringRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)
  const selectCortex = useCortexStore((s) => s.selectCortex)
  const selectedCortex = useCortexStore((s) => s.selectedCortex)
  const isSelected = selectedCortex === cortex.id
  const isPlanned = cortex.status === 'planned'

  const color = useMemo(() => new THREE.Color(cortex.color), [cortex.color])

  // Module orbital positions
  const modulePositions = useMemo(() => {
    return cortex.modules.map((_, i) => {
      const angle = (i / cortex.modules.length) * Math.PI * 2
      const radius = 1.2
      return [
        Math.cos(angle) * radius,
        Math.sin(angle) * radius * 0.4,
        Math.sin(angle) * radius * 0.6,
      ] as [number, number, number]
    })
  }, [cortex.modules])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.3
      meshRef.current.rotation.x = Math.sin(t * 0.2) * 0.1
      const scale = hovered || isSelected ? 1.15 : 1
      meshRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1)
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = t * 0.5
      ringRef.current.rotation.x = Math.PI / 2 + Math.sin(t * 0.3) * 0.2
    }
    if (glowRef.current) {
      const pulse = 0.8 + Math.sin(t * 2) * 0.2
      glowRef.current.scale.set(pulse, pulse, pulse)
    }
  })

  return (
    <group position={cortex.position}>
      {/* Outer glow sphere */}
      <Sphere ref={glowRef} args={[1.8, 16, 16]}>
        <meshBasicMaterial
          color={cortex.color}
          transparent
          opacity={isPlanned ? 0.02 : 0.06}
          side={THREE.BackSide}
        />
      </Sphere>

      {/* Main cortex sphere */}
      <Sphere
        ref={meshRef}
        args={[0.8, 32, 32]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={() => selectCortex(isSelected ? null : cortex.id)}
      >
        <meshStandardMaterial
          color={cortex.color}
          emissive={cortex.color}
          emissiveIntensity={hovered ? 1.0 : 0.6}
          transparent
          opacity={isPlanned ? 0.35 : 0.85}
          wireframe={isPlanned}
          roughness={0.2}
          metalness={0.8}
        />
      </Sphere>

      {/* Orbital ring */}
      <Ring ref={ringRef} args={[1.3, 1.35, 64]}>
        <meshBasicMaterial
          color={cortex.color}
          transparent
          opacity={isPlanned ? 0.1 : 0.3}
          side={THREE.DoubleSide}
        />
      </Ring>

      {/* Module dots */}
      {!isPlanned && modulePositions.map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshBasicMaterial color={cortex.color} transparent opacity={0.6} />
        </mesh>
      ))}

      {/* Label - billboard so always faces camera */}
      <Billboard position={[0, -1.5, 0]}>
        <Text
          fontSize={0.22}
          color={cortex.color}
          anchorX="center"
          anchorY="top"
        >
          {cortex.name}
        </Text>
      </Billboard>
      <Billboard position={[0, -1.8, 0]}>
        <Text
          fontSize={0.14}
          color="rgba(255,255,255,0.5)"
          anchorX="center"
          anchorY="top"
        >
          {cortex.role}
        </Text>
      </Billboard>

      {/* Status indicator */}
      {isPlanned && (
        <Billboard position={[0, -2.1, 0]}>
          <Text
            fontSize={0.11}
            color="#f59e0b"
            anchorX="center"
            anchorY="top"
          >
            [PLANNED]
          </Text>
        </Billboard>
      )}
    </group>
  )
}
