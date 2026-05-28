import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Sphere, Torus, Billboard } from '@react-three/drei'
import * as THREE from 'three'

const PI_SYSTEMS = [
  { id: 'rejection_rate', name: 'Rejection Rate', group: 'analytics', color: '#ef4444' },
  { id: 'pareto', name: 'Pareto Analysis', group: 'analytics', color: '#f97316' },
  { id: 'trends', name: 'Defect Trends', group: 'analytics', color: '#f59e0b' },
  { id: 'clusters', name: 'Cluster Analysis', group: 'analytics', color: '#eab308' },
  { id: 'spatial_map', name: 'Spatial Map', group: 'analytics', color: '#84cc16' },
  { id: 'fmea', name: 'FMEA', group: 'quality', color: '#8b5cf6' },
  { id: 'fishbone', name: 'Fishbone', group: 'quality', color: '#a78bfa' },
  { id: 'quality_gates', name: 'Quality Gates', group: 'quality', color: '#6366f1' },
  { id: 'tpm', name: 'TPM', group: 'quality', color: '#818cf8' },
  { id: 'copq', name: 'Cost of Quality', group: 'quality', color: '#c084fc' },
  { id: 'risk_scores', name: 'Risk Scoring', group: 'process', color: '#ec4899' },
  { id: 'heat_analysis', name: 'Heat Analysis', group: 'process', color: '#f43f5e' },
  { id: 'mold_risk', name: 'Mold Risk', group: 'process', color: '#fb7185' },
  { id: 'defect_flow', name: 'Defect Flow', group: 'process', color: '#e11d48' },
  { id: 'control_chart', name: 'Control Charts', group: 'spc', color: '#06b6d4' },
  { id: 'process_capability', name: 'Cpk/Ppk', group: 'spc', color: '#22d3ee' },
  { id: 'actions', name: 'Actions', group: 'decision', color: '#22c55e' },
  { id: 'alerts', name: 'Alerts', group: 'decision', color: '#4ade80' },
]

const GROUPS = [
  { id: 'analytics', name: 'Analytics', color: '#f59e0b', radius: 2.5, y: 2 },
  { id: 'quality', name: 'Quality Frameworks', color: '#8b5cf6', radius: 3, y: 0.5 },
  { id: 'process', name: 'Process Intelligence', color: '#ec4899', radius: 2.8, y: -1 },
  { id: 'spc', name: 'SPC', color: '#06b6d4', radius: 2, y: -2.5 },
  { id: 'decision', name: 'Decision Engine', color: '#22c55e', radius: 1.8, y: -3.5 },
]

export function ProcessIntelligenceScene() {
  const coreRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (coreRef.current) {
      const t = state.clock.elapsedTime
      coreRef.current.rotation.y = t * 0.3
      coreRef.current.rotation.x = Math.sin(t * 0.2) * 0.1
    }
  })

  return (
    <group>
      {/* Central PI Core */}
      <mesh ref={coreRef} position={[0, -0.5, 0]}>
        <dodecahedronGeometry args={[0.4, 0]} />
        <meshStandardMaterial
          color="#f59e0b"
          emissive="#f59e0b"
          emissiveIntensity={0.7}
          wireframe
          transparent
          opacity={0.6}
        />
      </mesh>
      <Billboard position={[0, -1.3, 0]}>
        <Text fontSize={0.15} color="#f59e0b" anchorX="center">
          Plant Intelligence
        </Text>
      </Billboard>
      <Billboard position={[0, -1.55, 0]}>
        <Text fontSize={0.09} color="rgba(255,255,255,0.4)" anchorX="center">
          25 REST Endpoints · WebSocket · TIER_3
        </Text>
      </Billboard>

      {/* Group rings */}
      {GROUPS.map((group) => (
        <GroupRing key={group.id} group={group} />
      ))}

      {/* System nodes */}
      {PI_SYSTEMS.map((system, i) => {
        const group = GROUPS.find(g => g.id === system.group)!
        const groupSystems = PI_SYSTEMS.filter(s => s.group === system.group)
        const indexInGroup = groupSystems.indexOf(system)
        const angle = (indexInGroup / groupSystems.length) * Math.PI * 2
        const pos: [number, number, number] = [
          Math.cos(angle) * group.radius,
          group.y,
          Math.sin(angle) * group.radius,
        ]
        return <PINode key={system.id} system={system} position={pos} index={i} />
      })}
    </group>
  )
}

function GroupRing({ group }: { group: typeof GROUPS[0] }) {
  const ref = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.z = state.clock.elapsedTime * 0.1
    }
  })

  return (
    <group position={[0, group.y, 0]}>
      <Torus ref={ref} args={[group.radius, 0.008, 8, 64]} rotation={[Math.PI / 2, 0, 0]}>
        <meshBasicMaterial color={group.color} transparent opacity={0.25} />
      </Torus>
      <Billboard position={[group.radius + 0.5, 0, 0]}>
        <Text
          fontSize={0.1}
          color={group.color}
          anchorX="left"
        >
          {group.name}
        </Text>
      </Billboard>
    </group>
  )
}

function PINode({ system, position, index }: {
  system: typeof PI_SYSTEMS[0]
  position: [number, number, number]
  index: number
}) {
  const ref = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.elapsedTime
      const pulse = 1 + Math.sin(t * 2.5 + index * 0.5) * 0.12
      ref.current.scale.set(pulse, pulse, pulse)
    }
  })

  return (
    <group position={position}>
      <Sphere ref={ref} args={[0.12, 12, 12]}>
        <meshStandardMaterial
          color={system.color}
          emissive={system.color}
          emissiveIntensity={0.5}
          transparent
          opacity={0.8}
        />
      </Sphere>
      <Billboard position={[0, 0.25, 0]}>
        <Text fontSize={0.08} color={system.color} anchorX="center">
          {system.name}
        </Text>
      </Billboard>
    </group>
  )
}
