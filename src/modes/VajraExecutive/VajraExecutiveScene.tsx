import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Sphere, Billboard, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { VAJRA_COGNITION_FLOW, RETRIEVAL_SOURCES } from '../../core/schema/vajraSchema'

export function VajraExecutiveScene() {
  const groupRef = useRef<THREE.Group>(null)

  // Layout cognition stages vertically
  const stagePositions = useMemo(() => {
    return VAJRA_COGNITION_FLOW.map((_, i) => {
      const y = 4 - i * 1.1
      const x = Math.sin(i * 0.6) * 1.5
      return [x, y, 0] as [number, number, number]
    })
  }, [])

  // Retrieval sources orbital
  const sourcePositions = useMemo(() => {
    return RETRIEVAL_SOURCES.map((_, i) => {
      const angle = (i / RETRIEVAL_SOURCES.length) * Math.PI * 2
      const radius = 3
      return [Math.cos(angle) * radius, 0.5, Math.sin(angle) * radius] as [number, number, number]
    })
  }, [])

  return (
    <group ref={groupRef}>
      {/* Central Vajra Logo - 3D spinning disc */}
      <VajraLogoCoin />

      {/* Cognition flow stages */}
      {VAJRA_COGNITION_FLOW.map((stage, i) => (
        <CognitionStageNode key={stage.id} stage={stage} position={stagePositions[i]} index={i} />
      ))}

      {/* Flow connections */}
      {stagePositions.slice(0, -1).map((pos, i) => (
        <FlowLine key={i} start={pos} end={stagePositions[i + 1]} color={VAJRA_COGNITION_FLOW[i].color} />
      ))}

      {/* Retrieval sources (orbiting) */}
      {RETRIEVAL_SOURCES.map((source, i) => (
        <RetrievalSourceNode key={source.id} source={source} basePosition={sourcePositions[i]} index={i} />
      ))}
    </group>
  )
}

function VajraLogoCoin() {
  const groupRef = useRef<THREE.Group>(null)
  const texture = useTexture('/vajra_logo.png')

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.3
    }
  })

  return (
    <group position={[0, 0.5, 0]} ref={groupRef}>
      {/* Front face - logo silhouette */}
      <mesh>
        <planeGeometry args={[2.2, 2.2]} />
        <meshStandardMaterial
          map={texture}
          transparent
          alphaTest={0.1}
          color="#ff8800"
          emissive="#ff8800"
          emissiveIntensity={0.8}
          emissiveMap={texture}
          side={THREE.FrontSide}
        />
      </mesh>

      {/* Back face - logo silhouette */}
      <mesh rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[2.2, 2.2]} />
        <meshStandardMaterial
          map={texture}
          transparent
          alphaTest={0.1}
          color="#ff8800"
          emissive="#ff8800"
          emissiveIntensity={0.8}
          emissiveMap={texture}
          side={THREE.FrontSide}
        />
      </mesh>
    </group>
  )
}

function CognitionStageNode({ stage, position, index }: { stage: typeof VAJRA_COGNITION_FLOW[0]; position: [number, number, number]; index: number }) {
  const ref = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.elapsedTime
      const pulse = 1 + Math.sin(t * 2.5 + index * 0.7) * 0.15
      ref.current.scale.set(pulse, pulse, pulse)
    }
  })

  const size = stage.type === 'decision' ? 0.22 : stage.type === 'input' || stage.type === 'output' ? 0.2 : 0.18

  return (
    <group position={position}>
      <Sphere ref={ref} args={[size, 16, 16]}>
        <meshStandardMaterial
          color={stage.color}
          emissive={stage.color}
          emissiveIntensity={0.6}
          transparent
          opacity={0.8}
        />
      </Sphere>
      <Billboard position={[0.5, 0, 0]}>
        <Text
          fontSize={0.13}
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

function FlowLine({ start, end, color }: { start: [number, number, number]; end: [number, number, number]; color: string }) {
  const geometry = useMemo(() => {
    const points = [new THREE.Vector3(...start), new THREE.Vector3(...end)]
    return new THREE.BufferGeometry().setFromPoints(points)
  }, [start, end])

  return (
    <line geometry={geometry} {...({} as any)}>
      <lineBasicMaterial color={color} transparent opacity={0.3} />
    </line>
  )
}

function RetrievalSourceNode({ source, basePosition, index }: { source: typeof RETRIEVAL_SOURCES[0]; basePosition: [number, number, number]; index: number }) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.elapsedTime
      const angle = (index / RETRIEVAL_SOURCES.length) * Math.PI * 2 + t * 0.2
      const radius = 3.5
      groupRef.current.position.x = Math.cos(angle) * radius
      groupRef.current.position.z = Math.sin(angle) * radius
      groupRef.current.position.y = 0.5 + Math.sin(t + index) * 0.3
    }
  })

  return (
    <group ref={groupRef} position={basePosition}>
      <mesh>
        <boxGeometry args={[0.2, 0.2, 0.2]} />
        <meshStandardMaterial
          color={source.color}
          emissive={source.color}
          emissiveIntensity={0.5}
          transparent
          opacity={0.7}
        />
      </mesh>
      <Billboard position={[0, -0.35, 0]}>
        <Text
          fontSize={0.1}
          color={source.color}
          anchorX="center"
        >
          {source.name}
        </Text>
      </Billboard>
    </group>
  )
}
