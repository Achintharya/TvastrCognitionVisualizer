import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * 3D Energy Landscape visualization
 * Shows the Phase-K energy surface as a deformable terrain mesh
 * Minima = most probable defect types (glowing wells)
 */
export function EnergyLandscape({ position = [0, -2, 0] as [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const gridSize = 32

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(6, 6, gridSize - 1, gridSize - 1)
    geo.rotateX(-Math.PI / 2)
    return geo
  }, [])

  useFrame((state) => {
    if (!meshRef.current) return
    const t = state.clock.elapsedTime
    const positions = meshRef.current.geometry.attributes.position
    const arr = positions.array as Float32Array

    for (let i = 0; i < positions.count; i++) {
      const x = arr[i * 3]
      const z = arr[i * 3 + 2]

      // Energy landscape: multiple Gaussian wells representing defect types
      const well1 = -0.8 * Math.exp(-((x + 1.5) ** 2 + (z + 1) ** 2) / 1.5) // Porosity minimum
      const well2 = -0.6 * Math.exp(-((x - 1.5) ** 2 + (z - 0.5) ** 2) / 1.2) // Crack minimum
      const well3 = -0.4 * Math.exp(-((x) ** 2 + (z + 2) ** 2) / 1.8) // Shrinkage minimum

      // Time-varying perturbation (representing force application)
      const wave = 0.05 * Math.sin(x * 2 + t * 0.8) * Math.cos(z * 2 + t * 0.6)

      // Convergence animation
      const convergence = Math.sin(t * 0.5) * 0.1

      arr[i * 3 + 1] = (well1 + well2 + well3 + wave + convergence) * 1.5
    }

    positions.needsUpdate = true
    meshRef.current.geometry.computeVertexNormals()
  })

  return (
    <group position={position}>
      <mesh ref={meshRef} geometry={geometry}>
        <meshStandardMaterial
          color="#ec4899"
          emissive="#ec4899"
          emissiveIntensity={0.2}
          wireframe
          transparent
          opacity={0.4}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Energy level indicators */}
      <EnergyWell position={[-1.5, -1.2, -1]} color="#ef4444" label="Porosity" />
      <EnergyWell position={[1.5, -0.9, -0.5]} color="#f59e0b" label="Crack" />
      <EnergyWell position={[0, -0.6, -2]} color="#8b5cf6" label="Shrinkage" />
    </group>
  )
}

function EnergyWell({ position, color, label }: { position: [number, number, number]; color: string; label: string }) {
  const ref = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.elapsedTime
      const s = 0.8 + Math.sin(t * 3) * 0.2
      ref.current.scale.set(s, s, s)
    }
  })

  return (
    <group position={position}>
      <mesh ref={ref}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshBasicMaterial color={color} transparent opacity={0.8} />
      </mesh>
    </group>
  )
}
