import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Sphere, Ring, Billboard } from '@react-three/drei'
import * as THREE from 'three'

// Matches the 14 domains defined in appStore.ts / cortexStore.ts
const CLIENT_DOMAINS = [
  { id: 'identity',         name: 'Identity',         description: 'Client profile, factory ID, deployment type', color: '#4ade80', icon: '◎' },
  { id: 'process',          name: 'Process',           description: 'Shifts, schedules, process parameters',        color: '#22d3ee', icon: '◉' },
  { id: 'quality',          name: 'Quality',           description: 'Quality gates, acceptance/rejection criteria',  color: '#f59e0b', icon: '◈' },
  { id: 'topology',         name: 'Topology',          description: 'CAD models, critical regions, part topology',   color: '#3b82f6', icon: '◆' },
  { id: 'product',          name: 'Product',           description: 'Product types, part definitions',               color: '#8b5cf6', icon: '◇' },
  { id: 'operator',         name: 'Operator',          description: 'Workforce metadata, shift assignments',          color: '#ec4899', icon: '◫' },
  { id: 'erp',              name: 'ERP',               description: 'Field mappings, column schema',                  color: '#f97316', icon: '◧' },
  { id: 'sop',              name: 'SOPs',              description: 'Operator, escalation, recovery procedures',      color: '#a78bfa', icon: '◩' },
  { id: 'visual-references',name: 'Visual Refs',       description: 'Reference parts, defect examples, annotations',  color: '#06b6d4', icon: '◪' },
  { id: 'knowledge-domains',name: 'Knowledge',         description: 'Defect KB, cause mappings, remediation',         color: '#ef4444', icon: '◬' },
  { id: 'ppap',             name: 'PPAP',              description: 'Part approval packages, approval records',        color: '#84cc16', icon: '◭' },
  { id: 'sources',          name: 'Sources',           description: 'Raw PDFs, DOCX, XLSX, CAD source files',         color: '#14b8a6', icon: '◮' },
  { id: 'retrieval',        name: 'Retrieval',         description: 'Knowledge indexes, metadata indexes, state',      color: '#6366f1', icon: '◰' },
  { id: 'runtime',          name: 'Runtime Context',   description: 'Active context (cognition-writable)',             color: '#fb7185', icon: '◱' },
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

  // Two-ring layout: inner 7, outer 7
  const domainPositions = useMemo(() => {
    return CLIENT_DOMAINS.map((_, i) => {
      const angle = (i / CLIENT_DOMAINS.length) * Math.PI * 2 - Math.PI / 2
      const ring = i < 7 ? 3.2 : 5.4
      return [
        Math.cos(angle) * ring,
        Math.sin(angle) * ring * 0.55,
        Math.sin(angle + i) * 0.4,
      ] as [number, number, number]
    })
  }, [])

  return (
    <group>
      {/* Central node: Client */}
      <group>
        <Sphere ref={centralRef} args={[0.6, 32, 32]}>
          <meshStandardMaterial
            color="#4ade80"
            emissive="#4ade80"
            emissiveIntensity={0.8}
            transparent
            opacity={0.8}
            metalness={0.6}
            roughness={0.2}
          />
        </Sphere>
        <Ring args={[1.0, 1.05, 64]} rotation={[Math.PI / 2, 0, 0]}>
          <meshBasicMaterial color="#4ade80" transparent opacity={0.3} side={THREE.DoubleSide} />
        </Ring>
        <Ring args={[1.3, 1.33, 64]} rotation={[Math.PI / 3, 0.5, 0]}>
          <meshBasicMaterial color="#4ade80" transparent opacity={0.15} side={THREE.DoubleSide} />
        </Ring>
        <Billboard position={[0, -1.2, 0]}>
          <Text fontSize={0.2} color="#4ade80" anchorX="center">
            Client Cortex
          </Text>
        </Billboard>
        <Billboard position={[0, -1.5, 0]}>
          <Text fontSize={0.11} color="rgba(255,255,255,0.4)" anchorX="center">
            Semantic Factory Memory · {CLIENT_DOMAINS.length} Domains
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
    <line geometry={geometry} {...({} as any)}>
      <lineBasicMaterial color={color} transparent opacity={0.15} />
    </line>
  )
}
