import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Sphere, Ring, Billboard } from '@react-three/drei'
import * as THREE from 'three'

const CLIENT_DOMAINS = [
  { id: 'identity', name: 'Identity', description: 'Client profile, deployment type', color: '#00ffff', icon: '◎' },
  { id: 'calibration', name: 'Calibration', description: 'Parameters, models, thresholds', color: '#8b5cf6', icon: '◉' },
  { id: 'knowledge', name: 'Knowledge Domains', description: 'Defect taxonomy, process knowledge', color: '#ec4899', icon: '◈' },
  { id: 'quality_gates', name: 'Quality Gates', description: 'Gate definitions, compliance rules', color: '#ef4444', icon: '◆' },
  { id: 'sop', name: 'SOPs', description: 'Standard operating procedures', color: '#f59e0b', icon: '◇' },
  { id: 'erp', name: 'ERP Mappings', description: 'Field mappings, production context', color: '#22c55e', icon: '◫' },
  { id: 'cad', name: 'CAD References', description: 'Part geometry, tolerance zones', color: '#3b82f6', icon: '◧' },
  { id: 'runtime', name: 'Runtime Context', description: 'Active state, session config', color: '#06b6d4', icon: '◩' },
  { id: 'visual_refs', name: 'Visual References', description: 'Reference images, exemplars', color: '#a78bfa', icon: '◪' },
  { id: 'ppap', name: 'PPAP', description: 'Production part approval', color: '#f97316', icon: '◬' },
  { id: 'simulation', name: 'Simulation', description: 'Process simulation data', color: '#84cc16', icon: '◭' },
  { id: 'overlays', name: 'Overlays', description: 'Defect/threshold overlays', color: '#14b8a6', icon: '◮' },
]

export function ClientContextScene() {
  const centralRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (centralRef.current) {
      const t = state.clock.elapsedTime
      centralRef.current.rotation.y = t * 0.2
      const s = 1 + Math.sin(t * 1.5) * 0.03
      centralRef.current.scale.set(s, s, s)
    }
  })

  // Hexagonal positions for domains
  const domainPositions = useMemo(() => {
    return CLIENT_DOMAINS.map((_, i) => {
      const angle = (i / CLIENT_DOMAINS.length) * Math.PI * 2 - Math.PI / 2
      const ring = i < 6 ? 3.2 : 5.2
      return [
        Math.cos(angle) * ring,
        Math.sin(angle) * ring * 0.6,
        Math.sin(angle + i) * 0.5,
      ] as [number, number, number]
    })
  }, [])

  return (
    <group>
      {/* Central node: Client */}
      <group>
        <Sphere ref={centralRef} args={[0.6, 32, 32]}>
          <meshStandardMaterial
            color="#22c55e"
            emissive="#22c55e"
            emissiveIntensity={0.8}
            transparent
            opacity={0.8}
            metalness={0.6}
            roughness={0.2}
          />
        </Sphere>
        <Ring args={[1.0, 1.05, 64]} rotation={[Math.PI / 2, 0, 0]}>
          <meshBasicMaterial color="#22c55e" transparent opacity={0.3} side={THREE.DoubleSide} />
        </Ring>
        <Ring args={[1.3, 1.33, 64]} rotation={[Math.PI / 3, 0.5, 0]}>
          <meshBasicMaterial color="#22c55e" transparent opacity={0.15} side={THREE.DoubleSide} />
        </Ring>
        <Billboard position={[0, -1.2, 0]}>
          <Text fontSize={0.2} color="#22c55e" anchorX="center">
            Client
          </Text>
        </Billboard>
        <Billboard position={[0, -1.5, 0]}>
          <Text fontSize={0.12} color="rgba(255,255,255,0.4)" anchorX="center">
            Semantic Factory Memory
          </Text>
        </Billboard>
      </group>

      {/* Domain nodes */}
      {CLIENT_DOMAINS.map((domain, i) => (
        <DomainNode key={domain.id} domain={domain} position={domainPositions[i]} index={i} />
      ))}

      {/* Connections from center to domains */}
      {domainPositions.map((pos, i) => (
        <ConnectionLine key={i} start={[0, 0, 0]} end={pos} color={CLIENT_DOMAINS[i].color} />
      ))}
    </group>
  )
}

function DomainNode({ domain, position, index }: {
  domain: typeof CLIENT_DOMAINS[0]
  position: [number, number, number]
  index: number
}) {
  const ref = useRef<THREE.Mesh>(null)
  const haloRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (ref.current) {
      const pulse = 1 + Math.sin(t * 2 + index * 0.8) * 0.08
      ref.current.scale.set(pulse, pulse, pulse)
    }
    if (haloRef.current) {
      haloRef.current.rotation.z = t * 0.5 + index
    }
  })

  return (
    <group position={position}>
      {/* Halo */}
      <Ring ref={haloRef} args={[0.35, 0.37, 32]}>
        <meshBasicMaterial color={domain.color} transparent opacity={0.2} side={THREE.DoubleSide} />
      </Ring>
      
      {/* Node */}
      <Sphere ref={ref} args={[0.22, 16, 16]}>
        <meshStandardMaterial
          color={domain.color}
          emissive={domain.color}
          emissiveIntensity={0.6}
          transparent
          opacity={0.85}
        />
      </Sphere>
      
      {/* Label - billboarded */}
      <Billboard position={[0, 0.5, 0]}>
        <Text fontSize={0.12} color={domain.color} anchorX="center">
          {domain.name}
        </Text>
      </Billboard>
      <Billboard position={[0, 0.3, 0]}>
        <Text fontSize={0.07} color="rgba(255,255,255,0.35)" anchorX="center">
          {domain.description}
        </Text>
      </Billboard>
    </group>
  )
}

function ConnectionLine({ start, end, color }: { start: [number, number, number]; end: [number, number, number]; color: string }) {
  const geometry = useMemo(() => {
    const points = [new THREE.Vector3(...start), new THREE.Vector3(...end)]
    return new THREE.BufferGeometry().setFromPoints(points)
  }, [start, end])

  return (
    <line geometry={geometry}>
      <lineBasicMaterial color={color} transparent opacity={0.15} />
    </line>
  )
}
