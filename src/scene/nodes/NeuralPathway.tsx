import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface Props {
  start: [number, number, number]
  end: [number, number, number]
  color: string
  strength: number
}

export function NeuralPathway({ start, end, color, strength }: Props) {
  const lineRef = useRef<THREE.Line>(null)
  const particlesRef = useRef<THREE.Points>(null)

  const curve = useMemo(() => {
    const mid = [
      (start[0] + end[0]) / 2,
      (start[1] + end[1]) / 2 + 1.5,
      (start[2] + end[2]) / 2 + 0.5,
    ] as [number, number, number]
    return new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(...start),
      new THREE.Vector3(...mid),
      new THREE.Vector3(...end)
    )
  }, [start, end])

  const lineGeometry = useMemo(() => {
    const points = curve.getPoints(50)
    const geometry = new THREE.BufferGeometry().setFromPoints(points)
    return geometry
  }, [curve])

  // Particle positions along curve
  const particleCount = 8
  const particlePositions = useMemo(() => {
    return new Float32Array(particleCount * 3)
  }, [])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array
      for (let i = 0; i < particleCount; i++) {
        const progress = ((t * 0.3 * strength + i / particleCount) % 1)
        const point = curve.getPoint(progress)
        positions[i * 3] = point.x
        positions[i * 3 + 1] = point.y
        positions[i * 3 + 2] = point.z
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true
    }
  })

  return (
    <group>
      {/* Path line */}
      <line ref={lineRef as any} geometry={lineGeometry} {...({} as any)}>
        <lineBasicMaterial color={color} transparent opacity={0.2 * strength} />
      </line>

      {/* Flowing particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[particlePositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.08}
          color={color}
          transparent
          opacity={0.8}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  )
}
