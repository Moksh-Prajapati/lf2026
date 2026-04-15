import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { ContactShadows, Sparkles } from '@react-three/drei'
import * as THREE from 'three'
import CentralFeature from './CentralFeature'

/* =========================================================
   Rotating spotlight beam (thin cylinder)
   ========================================================= */
function SpotlightBeam({ position, color, speed = 0.3, tilt = 0.4 }: {
  position: [number, number, number]; color: string; speed?: number; tilt?: number
}) {
  const ref = useRef<THREE.Mesh>(null)
  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime
    ref.current.rotation.z = Math.sin(t * speed) * tilt
    ref.current.rotation.x = Math.cos(t * speed * 0.7) * tilt * 0.5
    const mat = ref.current.material as THREE.MeshBasicMaterial
    mat.opacity = 0.06 + Math.sin(t * 2) * 0.02
  })
  return (
    <mesh ref={ref} position={position}>
      <cylinderGeometry args={[0.02, 0.8, 25, 8]} />
      <meshBasicMaterial color={color} transparent opacity={0.08} side={THREE.DoubleSide} />
    </mesh>
  )
}

export default function FestivalPlaza() {
  const groupRef = useRef<THREE.Group>(null)

  const groundTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    const c = canvas.getContext('2d')!

    c.fillStyle = '#bd6bab'
    c.fillRect(0, 0, 512, 512)

    c.fillStyle = 'rgba(0, 0, 0, 0.035)'
    for (let x = 0; x < 512; x += 10) {
      for (let y = 0; y < 512; y += 10) {
        c.beginPath()
        c.arc(x + 5, y + 5, 1.2, 0, Math.PI * 2)
        c.fill()
      }
    }

    c.fillStyle = 'rgba(255, 255, 255, 0.015)'
    for (let x = 0; x < 512; x += 20) {
      for (let y = 0; y < 512; y += 20) {
        c.fillRect(x, y, 10, 10)
      }
    }

    const tex = new THREE.CanvasTexture(canvas)
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping
    tex.repeat.set(20, 20)
    return tex
  }, [])

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        (state.pointer.x * Math.PI) / 30,
        0.025
      )
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        (-state.pointer.y * Math.PI) / 50,
        0.025
      )
    }
  })

  return (
    <>
      <ambientLight intensity={0.7} color="#ffffff" />
      <directionalLight
        position={[10, 20, 12]}
        intensity={1.6}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={50}
        shadow-camera-left={-25}
        shadow-camera-right={25}
        shadow-camera-top={25}
        shadow-camera-bottom={-25}
        color="#fff5e6"
      />
      <directionalLight position={[-8, 15, 8]} intensity={0.5} color="#e0f2fe" />
      <pointLight position={[-12, 8, -3]} intensity={0.8} color="#ec4899" distance={40} />
      <pointLight position={[14, 8, -3]} intensity={0.8} color="#8b5cf6" distance={40} />
      <pointLight position={[0, 4, 14]} intensity={0.5} color="#eab308" distance={30} />
      <pointLight position={[0, 14, 0]} intensity={0.4} color="#14b8a6" distance={35} />
      <pointLight position={[10, 2, 5]} intensity={0.4} color="#f472b6" distance={20} />
      {/* Extra fill lights for the expanded scene */}
      <pointLight position={[-15, 6, 4]} intensity={0.3} color="#eab308" distance={25} />
      <pointLight position={[15, 6, 4]} intensity={0.3} color="#ec4899" distance={25} />

      {/* Sparkle layers — expanded */}
      <Sparkles count={150} scale={[55, 30, 35]} size={3} speed={0.4} opacity={0.5} color="#fef08a" />
      <Sparkles count={60} scale={[45, 25, 30]} size={5} speed={0.2} opacity={0.3} color="#ec4899" />
      <Sparkles count={40} scale={[50, 20, 25]} size={4} speed={0.3} opacity={0.25} color="#a78bfa" />
      <Sparkles count={80} scale={[60, 35, 40]} size={2} speed={0.5} opacity={0.4} color="#14b8a6" />
      <Sparkles count={50} scale={[40, 25, 20]} size={3.5} speed={0.35} opacity={0.2} color="#fbbf24" />

      {/* Spotlight beams (subtle, atmospheric) */}
      <SpotlightBeam position={[-6, 10, -2]} color="#ec4899" speed={0.25} tilt={0.35} />
      <SpotlightBeam position={[6, 10, -2]} color="#8b5cf6" speed={0.3} tilt={0.3} />
      <SpotlightBeam position={[0, 10, -3]} color="#eab308" speed={0.2} tilt={0.25} />

      <group ref={groupRef}>
        <CentralFeature />
      </group>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3.6, 0]} receiveShadow>
        <planeGeometry args={[150, 150]} />
        <meshStandardMaterial map={groundTexture} roughness={0.85} color="#bd6bab" />
      </mesh>

      <ContactShadows
        opacity={0.5}
        scale={40}
        blur={2}
        far={6}
        color="#020617"
        position={[0, -3.58, 0]}
      />
    </>
  )
}
