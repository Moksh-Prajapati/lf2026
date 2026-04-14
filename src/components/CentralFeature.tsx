import { useRef, useState, useEffect, useMemo } from 'react'
import { useFrame, useLoader, useThree } from '@react-three/fiber'
import { Float, useGLTF, useAnimations } from '@react-three/drei'
import * as THREE from 'three'
import { playJazzLick, play8BitBeat, playBounce } from '../hooks/useSound'

/* =========================================================
   Viewport-aware scale hook
   ========================================================= */
function useResponsive() {
  const { viewport } = useThree()
  const isMobile = viewport.width < 10
  const isTablet = viewport.width >= 10 && viewport.width < 16
  // Scale factor: 1.0 on desktop, ~0.45 on mobile (tighter fit)
  const sf = isMobile ? 0.45 : isTablet ? 0.75 : 1.0
  return { isMobile, isTablet, sf, vw: viewport.width }
}

/* =========================================================
   Reusable GLB wrapper
   ========================================================= */
function GLBModel({
  url, position, scale = 1, rotation, hoverScale = 1.12, hoverSound,
  floatY, floatSpeed = 1, spinSpeed, mobileHide,
}: {
  url: string
  position: [number, number, number]
  scale?: number
  rotation?: [number, number, number]
  hoverScale?: number
  hoverSound?: () => void
  floatY?: number
  floatSpeed?: number
  spinSpeed?: number
  mobileHide?: boolean
}) {
  const groupRef = useRef<THREE.Group>(null!)
  const [hovered, setHovered] = useState(false)
  const hasPlayed = useRef(false)
  const { scene, animations } = useGLTF(url)
  const clone = useMemo(() => scene.clone(), [scene])
  const { actions } = useAnimations(animations, groupRef)
  const { isMobile, sf } = useResponsive()
  const baseRot = useMemo<[number, number, number]>(() => rotation || [0, 0, 0], [rotation])
  const phaseOffset = useMemo(() => Math.random() * Math.PI * 2, [])

  useEffect(() => {
    Object.values(actions).forEach((a) => a?.play())
  }, [actions])

  if (mobileHide && isMobile) return null

  const adjustedScale = scale * sf
  const adjustedPos: [number, number, number] = [
    position[0] * sf,
    position[1],
    position[2] * sf,
  ]

  useFrame((state) => {
    if (!groupRef.current) return
    const t = state.clock.elapsedTime
    const { pointer } = state

    let px = adjustedPos[0]
    let py = adjustedPos[1]
    let pz = adjustedPos[2]

    if (floatY) py += Math.sin(t * floatSpeed + phaseOffset) * floatY

    px += Math.sin(t * floatSpeed * 0.5 + phaseOffset) * 0.12 * sf
    pz += Math.cos(t * floatSpeed * 0.35 + phaseOffset * 1.7) * 0.08 * sf

    const depthInfluence = 0.3 + Math.abs(adjustedPos[2]) * 0.04
    px += pointer.x * depthInfluence * sf
    py += pointer.y * depthInfluence * 0.4 * sf

    groupRef.current.position.set(px, py, pz)

    if (spinSpeed) groupRef.current.rotation.y += spinSpeed

    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      baseRot[0] + pointer.y * 0.05,
      0.03
    )

    if (hovered) {
      const hs = adjustedScale * hoverScale
      groupRef.current.scale.lerp(new THREE.Vector3(hs, hs, hs), 0.12)
      groupRef.current.rotation.z = THREE.MathUtils.lerp(
        groupRef.current.rotation.z,
        baseRot[2] + Math.sin(t * 8) * 0.1,
        0.1
      )
    } else {
      groupRef.current.scale.lerp(new THREE.Vector3(adjustedScale, adjustedScale, adjustedScale), 0.06)
      groupRef.current.rotation.z = THREE.MathUtils.lerp(
        groupRef.current.rotation.z,
        baseRot[2],
        0.04
      )
    }
  })

  return (
    <group
      ref={groupRef}
      position={adjustedPos}
      scale={adjustedScale}
      rotation={rotation}
      onPointerOver={() => {
        setHovered(true)
        document.body.style.cursor = 'pointer'
        if (hoverSound && !hasPlayed.current) {
          hoverSound(); hasPlayed.current = true
          setTimeout(() => { hasPlayed.current = false }, 2500)
        }
      }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto' }}
    >
      <primitive object={clone} />
    </group>
  )
}

/* =========================================================
   Hero Title
   ========================================================= */
function HeroTitle() {
  const texture = useLoader(THREE.TextureLoader, '/images/hero-title.png')
  const { viewport } = useThree()
  const aspect = useMemo(() => {
    if (!texture.image) return 2.5
    return texture.image.width / texture.image.height
  }, [texture])

  const isMobile = viewport.width < 10
  const h = isMobile ? 3.2 : 5
  const w = h * aspect

  return (
    <Float speed={1.5} rotationIntensity={0.01} floatIntensity={0.15}>
      <mesh position={[0, isMobile ? 3 : 2.5, isMobile ? 6 : 2]}>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial map={texture} transparent toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
    </Float>
  )
}

/* =========================================================
   Disco Ball with colour-cycling light
   ========================================================= */
function DiscoBallWithLight({ pos, mobileSf }: { pos: [number, number, number]; mobileSf: number }) {
  const groupRef = useRef<THREE.Group>(null!)
  const lightRef = useRef<THREE.PointLight>(null)
  const { scene, animations } = useGLTF('/models/free_realistic_disco_ball.glb')
  const clone = useMemo(() => scene.clone(), [scene])
  const { actions } = useAnimations(animations, groupRef)

  const adjustedPos: [number, number, number] = [pos[0] * mobileSf, pos[1], pos[2] * mobileSf]

  useEffect(() => { Object.values(actions).forEach((a) => a?.play()) }, [actions])

  useFrame((state) => {
    if (!groupRef.current) return
    const t = state.clock.elapsedTime
    groupRef.current.rotation.y += 0.018
    groupRef.current.position.y = adjustedPos[1] + Math.sin(t * 1.2) * 0.35
    groupRef.current.position.x = adjustedPos[0] + state.pointer.x * 0.25 * mobileSf + Math.sin(t * 0.4) * 0.1
    if (lightRef.current) {
      lightRef.current.intensity = 2.5 + Math.sin(t * 5) * 1.5
      lightRef.current.color.setHSL((t * 0.1) % 1, 0.85, 0.6)
    }
  })

  const ballScale = 0.02 * mobileSf

  return (
    <group position={adjustedPos}>
      <mesh position={[0, 2.5, 0]}>
        <cylinderGeometry args={[0.01, 0.01, 5]} />
        <meshBasicMaterial color="#0f172a" />
      </mesh>
      <group ref={groupRef} scale={ballScale}>
        <primitive object={clone} />
      </group>
      <pointLight ref={lightRef} intensity={1.5} distance={20} color="#fef08a" />
    </group>
  )
}

/* =========================================================
   DJ Frank + Console — right side, scroll-driven exit
   ========================================================= */
function DJFrankWithConsole() {
  const frankRef = useRef<THREE.Group>(null!)
  const consoleRef = useRef<THREE.Group>(null!)
  const { scene: fScene, animations: fAnims } = useGLTF('/models/dj_frank_t-pose_brawl_stars.glb')
  const fClone = useMemo(() => fScene.clone(), [fScene])
  const { actions: fActions } = useAnimations(fAnims, frankRef)
  const { scene: cScene, animations: cAnims } = useGLTF('/models/flex_dj_console.glb')
  const cClone = useMemo(() => cScene.clone(), [cScene])
  const { actions: cActions } = useAnimations(cAnims, consoleRef)
  const { isMobile } = useResponsive()

  useEffect(() => {
    Object.values(fActions).forEach((a) => a?.play())
    Object.values(cActions).forEach((a) => a?.play())
  }, [fActions, cActions])

  const frankBaseScale = isMobile ? 0.85 : 2
  const consoleBaseScale = isMobile ? 0.4 : 0.9
  const frankX = isMobile ? 3.5 : 10
  const consoleX = isMobile ? 3 : 9

  useFrame((state) => {
    const progress = Math.min(window.scrollY / window.innerHeight, 1)
    const t = state.clock.elapsedTime
    const { pointer } = state
    if (frankRef.current) {
      frankRef.current.position.set(
        frankX + progress * (isMobile ? 8 : 12) + pointer.x * 0.15,
        -2.8 + Math.sin(t * 1.2) * 0.08 - progress * 3 + pointer.y * 0.05,
        isMobile ? 1 : -1,
      )
      frankRef.current.rotation.y = -0.4 + progress * 0.8 + Math.sin(t * 0.8) * 0.02
      frankRef.current.scale.setScalar(frankBaseScale * (1 - progress * 0.7))
    }
    if (consoleRef.current) {
      consoleRef.current.position.set(
        consoleX + progress * (isMobile ? 7 : 10) + pointer.x * 0.1,
        -3.2 + Math.sin(t * 1.4) * 0.04 - progress * 2 + pointer.y * 0.03,
        isMobile ? 3 : 2,
      )
      consoleRef.current.scale.setScalar(consoleBaseScale * (1 - progress * 0.7))
    }
  })

  return (
    <>
      <group ref={frankRef} position={[frankX, -2.8, isMobile ? 1 : -1]} scale={frankBaseScale} rotation={[0, -0.4, 0]}>
        <primitive object={fClone} />
      </group>
      <group ref={consoleRef} position={[consoleX, -3.2, isMobile ? 3 : 2]} scale={consoleBaseScale}>
        <primitive object={cClone} />
      </group>
    </>
  )
}

/* =========================================================
   Floating Star accent
   ========================================================= */
function FloatingStar({ position, color, size = 0.3, mobileSf }: {
  position: [number, number, number]; color: string; size?: number; mobileSf: number
}) {
  const ref = useRef<THREE.Mesh>(null)
  const adjustedPos: [number, number, number] = [position[0] * mobileSf, position[1], position[2] * mobileSf]
  const adjustedSize = size * mobileSf

  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime
    ref.current.rotation.y = t * 0.5
    ref.current.rotation.z = t * 0.3
    ref.current.position.y = adjustedPos[1] + Math.sin(t * 1.5 + adjustedPos[0]) * 0.4
    ref.current.position.x = adjustedPos[0] + Math.sin(t * 0.4 + adjustedPos[2]) * 0.15 + state.pointer.x * 0.08 * mobileSf
  })
  return (
    <mesh ref={ref} position={adjustedPos}>
      <octahedronGeometry args={[adjustedSize]} />
      <meshStandardMaterial color={color} roughness={0.2} metalness={0.3} emissive={color} emissiveIntensity={0.25} />
    </mesh>
  )
}

/* =========================================================
   Floating Confetti — small coloured shapes that spin/bob
   ========================================================= */
function FloatingConfetti({ position, color, shape = 'box', size = 0.12, mobileSf }: {
  position: [number, number, number]; color: string; shape?: 'box' | 'tetra' | 'torus'; size?: number; mobileSf: number
}) {
  const ref = useRef<THREE.Mesh>(null)
  const speedX = useMemo(() => 0.3 + Math.random() * 0.7, [])
  const speedY = useMemo(() => 0.2 + Math.random() * 0.5, [])
  const phaseOffset = useMemo(() => Math.random() * Math.PI * 2, [])
  const adjustedPos: [number, number, number] = [position[0] * mobileSf, position[1], position[2] * mobileSf]
  const adjustedSize = size * mobileSf

  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime
    ref.current.rotation.x = t * speedX
    ref.current.rotation.z = t * speedY
    ref.current.position.y = adjustedPos[1] + Math.sin(t * 1.2 + phaseOffset) * 0.3
    ref.current.position.x = adjustedPos[0] + Math.sin(t * 0.4 + phaseOffset) * 0.2 + state.pointer.x * 0.06 * mobileSf
    ref.current.position.z = adjustedPos[2] + Math.cos(t * 0.3 + phaseOffset) * 0.1
  })

  return (
    <mesh ref={ref} position={adjustedPos}>
      {shape === 'box' && <boxGeometry args={[adjustedSize, adjustedSize, adjustedSize]} />}
      {shape === 'tetra' && <tetrahedronGeometry args={[adjustedSize]} />}
      {shape === 'torus' && <torusGeometry args={[adjustedSize, adjustedSize * 0.35, 8, 16]} />}
      <meshStandardMaterial
        color={color}
        roughness={0.3}
        metalness={0.4}
        emissive={color}
        emissiveIntensity={0.1}
      />
    </mesh>
  )
}

/* =========================================================
   Pulsing Bass Sphere — beats with the vibe
   ========================================================= */
function PulsingSphere({ position, color, baseScale = 0.4, mobileSf }: {
  position: [number, number, number]; color: string; baseScale?: number; mobileSf: number
}) {
  const ref = useRef<THREE.Mesh>(null)
  const adjustedPos: [number, number, number] = [position[0] * mobileSf, position[1], position[2] * mobileSf]
  const adjScale = baseScale * mobileSf

  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime
    const pulse = adjScale + Math.sin(t * 4) * 0.06 * mobileSf + Math.sin(t * 7) * 0.03 * mobileSf
    ref.current.scale.setScalar(pulse)
    ref.current.position.y = adjustedPos[1] + Math.sin(t * 1.8) * 0.1
  })
  return (
    <mesh ref={ref} position={adjustedPos}>
      <sphereGeometry args={[1, 16, 16]} />
      <meshStandardMaterial
        color={color}
        roughness={0.6}
        metalness={0.2}
        emissive={color}
        emissiveIntensity={0.08}
        transparent
        opacity={0.6}
        wireframe
      />
    </mesh>
  )
}

/* =========================================================
   Floating Ring accent
   ========================================================= */
function FloatingRing({ position, color, size = 0.8, mobileSf }: {
  position: [number, number, number]; color: string; size?: number; mobileSf: number
}) {
  const ref = useRef<THREE.Mesh>(null)
  const rotSpeed = useMemo(() => 0.3 + Math.random() * 0.5, [])
  const adjustedPos: [number, number, number] = [position[0] * mobileSf, position[1], position[2] * mobileSf]
  const adjSize = size * mobileSf

  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime
    ref.current.rotation.x = t * rotSpeed
    ref.current.rotation.y = t * rotSpeed * 0.7
    ref.current.position.y = adjustedPos[1] + Math.sin(t * 0.8 + adjustedPos[0]) * 0.4
    ref.current.position.x = adjustedPos[0] + state.pointer.x * 0.1 * mobileSf
  })
  return (
    <mesh ref={ref} position={adjustedPos}>
      <torusGeometry args={[adjSize, 0.04, 12, 32]} />
      <meshStandardMaterial
        color={color}
        roughness={0.3}
        metalness={0.5}
        emissive={color}
        emissiveIntensity={0.12}
      />
    </mesh>
  )
}

/* =========================================================
   Ground Stage Marker — small glowing circles on the floor
   ========================================================= */
function StageMarker({ position, color, mobileSf }: {
  position: [number, number, number]; color: string; mobileSf: number
}) {
  const ref = useRef<THREE.Mesh>(null)
  const adjustedPos: [number, number, number] = [position[0] * mobileSf, position[1], position[2] * mobileSf]

  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime
    const mat = ref.current.material as THREE.MeshStandardMaterial
    mat.emissiveIntensity = 0.15 + Math.sin(t * 2 + adjustedPos[0]) * 0.08
  })
  return (
    <mesh ref={ref} position={adjustedPos} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.3 * mobileSf, 0.5 * mobileSf, 24]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.15}
        side={THREE.DoubleSide}
        transparent
        opacity={0.5}
      />
    </mesh>
  )
}

/* =========================================================
   MAIN EXPORT
   ========================================================= */
export default function CentralFeature() {
  const { isMobile, sf } = useResponsive()
  // shorthand for mobileSf prop
  const m = sf

  return (
    <group>
      <HeroTitle />

      {/* ── RIGHT: Frank + Console (scroll-exit) ── */}
      <DJFrankWithConsole />

      {/* ── LEFT EDGE ── */}
      <GLBModel
        url="/models/fender_electric_guitar_3d_model.glb"
        position={[-10, -1, 0]}
        scale={3.8}
        rotation={[0, 0.7, -0.12]}
        hoverScale={1.08}
        hoverSound={playJazzLick}
        floatY={0.15}
        floatSpeed={1.1}
      />

      <GLBModel
        url="/models/vintage_boombox_final.glb"
        position={[-7, -3.2, 4]}
        scale={0.03}
        rotation={[0, 0.4, 0]}
        hoverScale={1.08}
        hoverSound={play8BitBeat}
        floatY={0.03}
        floatSpeed={1.5}
      />

      <GLBModel
        url="/models/eye_in_the_flask.glb"
        position={[-12, -2.5, 2]}
        scale={1.2}
        floatY={0.08}
        floatSpeed={1.3}
        mobileHide
      />

      <GLBModel
        url="/models/retro_microphone.glb"
        position={[-5, -2.8, 6]}
        scale={0.005}
        rotation={[0, 0.3, 0]}
        hoverScale={1.08}
        floatY={0.04}
        floatSpeed={1.6}
      />

      {/* ── RIGHT EDGE ── */}
      <GLBModel
        url="/models/cactus_lowpoly.glb"
        position={[13, -3.5, 3]}
        scale={2.2}
        floatY={0.03}
        floatSpeed={0.8}
        mobileHide
      />

      {/* Boombox #2 — right ground */}
      <GLBModel
        url="/models/vintage_boombox_final.glb"
        position={[12, -3.2, 5]}
        scale={0.024}
        rotation={[0, -0.5, 0]}
        hoverScale={1.06}
        hoverSound={play8BitBeat}
        floatY={0.025}
        floatSpeed={1.2}
        mobileHide
      />

      {/* Retro Mic #2 */}
      <GLBModel
        url="/models/retro_microphone.glb"
        position={[6, -2.9, 7]}
        scale={0.004}
        rotation={[0, -0.4, 0]}
        hoverScale={1.06}
        floatY={0.035}
        floatSpeed={1.4}
        mobileHide
      />

      {/* Eye Flask #2 */}
      <GLBModel
        url="/models/eye_in_the_flask.glb"
        position={[14, -2, -3]}
        scale={0.9}
        floatY={0.06}
        floatSpeed={1.1}
        spinSpeed={0.005}
        mobileHide
      />

      {/* ── UPPER FLOATING LAYER ── */}
      <GLBModel
        url="/models/headphones_final.glb"
        position={[-8, 6, -4]}
        scale={2.0}
        floatY={0.45}
        floatSpeed={1.5}
        hoverScale={1.12}
        hoverSound={playBounce}
      />

      <GLBModel
        url="/models/thug_life__cool_glasses__stylise_goggles.glb"
        position={[8, 7, -5]}
        scale={9}
        floatY={0.4}
        floatSpeed={1.3}
        hoverScale={1.1}
      />

      <GLBModel
        url="/models/pretty_simple_discoball_final.glb"
        position={[-5, 8, -6]}
        scale={2.0}
        spinSpeed={0.025}
        floatY={0.35}
        floatSpeed={1.0}
      />

      <DiscoBallWithLight pos={[4, 8, -7]} mobileSf={m} />

      {/* Desktop-only extra models */}
      {!isMobile && (
        <>
          <DiscoBallWithLight pos={[-12, 9, -8]} mobileSf={m} />
          <GLBModel
            url="/models/headphones_final.glb"
            position={[12, 5, -3]}
            scale={1.0}
            floatY={0.18}
            floatSpeed={1.2}
            hoverScale={1.06}
          />
          <GLBModel
            url="/models/thug_life__cool_glasses__stylise_goggles.glb"
            position={[-11, 5.5, -3]}
            scale={5}
            floatY={0.15}
            floatSpeed={1.1}
            spinSpeed={0.008}
          />
          <GLBModel
            url="/models/pretty_simple_discoball_final.glb"
            position={[10, 6, -5]}
            scale={1.0}
            spinSpeed={0.015}
            floatY={0.12}
            floatSpeed={0.9}
          />
        </>
      )}

      {/* ── FLOATING CONFETTI ── */}
      <FloatingConfetti position={[-3, 5, -1]} color="#ec4899" shape="box" size={0.15} mobileSf={m} />
      <FloatingConfetti position={[4, 7, -2]} color="#eab308" shape="tetra" size={0.12} mobileSf={m} />
      <FloatingConfetti position={[-7, 8, -3]} color="#8b5cf6" shape="torus" size={0.14} mobileSf={m} />
      <FloatingConfetti position={[9, 5, 1]} color="#14b8a6" shape="box" size={0.1} mobileSf={m} />
      <FloatingConfetti position={[-1, 9, -5]} color="#f97316" shape="tetra" size={0.13} mobileSf={m} />
      <FloatingConfetti position={[6, 4, 3]} color="#ec4899" shape="torus" size={0.11} mobileSf={m} />
      <FloatingConfetti position={[-10, 6, 0]} color="#eab308" shape="box" size={0.12} mobileSf={m} />
      <FloatingConfetti position={[2, 10, -6]} color="#8b5cf6" shape="tetra" size={0.1} mobileSf={m} />
      <FloatingConfetti position={[-5, 4, 4]} color="#f472b6" shape="box" size={0.13} mobileSf={m} />
      <FloatingConfetti position={[11, 8, -4]} color="#34d399" shape="torus" size={0.12} mobileSf={m} />
      {!isMobile && (
        <>
          <FloatingConfetti position={[-8, 3, 5]} color="#eab308" shape="tetra" size={0.11} mobileSf={m} />
          <FloatingConfetti position={[3, 6, 2]} color="#ec4899" shape="box" size={0.09} mobileSf={m} />
          <FloatingConfetti position={[-14, 7, -2]} color="#a78bfa" shape="torus" size={0.15} mobileSf={m} />
          <FloatingConfetti position={[7, 9, -6]} color="#fbbf24" shape="box" size={0.1} mobileSf={m} />
          <FloatingConfetti position={[-2, 3, 6]} color="#14b8a6" shape="tetra" size={0.12} mobileSf={m} />
          <FloatingConfetti position={[13, 6, -2]} color="#f97316" shape="box" size={0.11} mobileSf={m} />
          <FloatingConfetti position={[-6, 10, -7]} color="#ec4899" shape="tetra" size={0.1} mobileSf={m} />
          <FloatingConfetti position={[5, 3, 5]} color="#8b5cf6" shape="torus" size={0.13} mobileSf={m} />
        </>
      )}

      {/* ── PULSING BASS SPHERES ── */}
      <PulsingSphere position={[-8, -1, 6]} color="#ec4899" baseScale={0.35} mobileSf={m} />
      <PulsingSphere position={[10, -0.5, 5]} color="#8b5cf6" baseScale={0.3} mobileSf={m} />
      {!isMobile && <PulsingSphere position={[0, -1, 8]} color="#eab308" baseScale={0.25} mobileSf={m} />}

      {/* ── FLOATING RINGS ── */}
      <FloatingRing position={[-6, 7, -2]} color="#ec4899" size={0.7} mobileSf={m} />
      <FloatingRing position={[7, 6, -1]} color="#eab308" size={0.6} mobileSf={m} />
      <FloatingRing position={[0, 9, -4]} color="#8b5cf6" size={0.5} mobileSf={m} />
      {!isMobile && (
        <>
          <FloatingRing position={[-12, 4, 1]} color="#14b8a6" size={0.55} mobileSf={m} />
          <FloatingRing position={[13, 7, -5]} color="#f97316" size={0.45} mobileSf={m} />
          <FloatingRing position={[-3, 11, -8]} color="#f472b6" size={0.6} mobileSf={m} />
        </>
      )}

      {/* ── GROUND STAGE MARKERS ── */}
      <StageMarker position={[-4, -3.55, 3]} color="#ec4899" mobileSf={m} />
      <StageMarker position={[5, -3.55, 4]} color="#eab308" mobileSf={m} />
      <StageMarker position={[0, -3.55, 6]} color="#8b5cf6" mobileSf={m} />
      {!isMobile && (
        <>
          <StageMarker position={[-9, -3.55, 5]} color="#14b8a6" mobileSf={m} />
          <StageMarker position={[11, -3.55, 6]} color="#f97316" mobileSf={m} />
        </>
      )}

      {/* ── STARS ── */}
      <FloatingStar position={[-3, 7, -3]} color="#fef08a" size={0.3} mobileSf={m} />
      <FloatingStar position={[6, 9, -4]} color="#ec4899" size={0.25} mobileSf={m} />
      <FloatingStar position={[-1, 10, -7]} color="#8b5cf6" size={0.3} mobileSf={m} />
      <FloatingStar position={[2, 6.5, 0]} color="#10b981" size={0.2} mobileSf={m} />
      <FloatingStar position={[-9, 8, -1]} color="#eab308" size={0.28} mobileSf={m} />
      <FloatingStar position={[10, 7, -3]} color="#14b8a6" size={0.22} mobileSf={m} />
      <FloatingStar position={[0, 9, -5]} color="#f472b6" size={0.22} mobileSf={m} />
      <FloatingStar position={[-13, 5, -2]} color="#fbbf24" size={0.2} mobileSf={m} />
      <FloatingStar position={[13, 4, -1]} color="#a78bfa" size={0.2} mobileSf={m} />
      <FloatingStar position={[5, 3, 5]} color="#34d399" size={0.18} mobileSf={m} />
      <FloatingStar position={[-6, 3, 5]} color="#fb923c" size={0.2} mobileSf={m} />
      <FloatingStar position={[1, 11, -8]} color="#fef08a" size={0.18} mobileSf={m} />
      <FloatingStar position={[-4, 4, 3]} color="#ec4899" size={0.15} mobileSf={m} />
      <FloatingStar position={[7, 4, 3]} color="#8b5cf6" size={0.15} mobileSf={m} />
      {!isMobile && (
        <>
          <FloatingStar position={[-15, 6, -4]} color="#eab308" size={0.22} mobileSf={m} />
          <FloatingStar position={[15, 5, -2]} color="#ec4899" size={0.2} mobileSf={m} />
          <FloatingStar position={[-2, 12, -9]} color="#14b8a6" size={0.25} mobileSf={m} />
          <FloatingStar position={[8, 11, -8]} color="#fef08a" size={0.2} mobileSf={m} />
          <FloatingStar position={[-10, 10, -6]} color="#f472b6" size={0.18} mobileSf={m} />
          <FloatingStar position={[3, 8, 1]} color="#a78bfa" size={0.16} mobileSf={m} />
          <FloatingStar position={[-7, 5, 2]} color="#34d399" size={0.14} mobileSf={m} />
          <FloatingStar position={[11, 3, 1]} color="#fbbf24" size={0.17} mobileSf={m} />
          <FloatingStar position={[-1, 5, 4]} color="#f97316" size={0.13} mobileSf={m} />
          <FloatingStar position={[4, 12, -9]} color="#ec4899" size={0.15} mobileSf={m} />
        </>
      )}
    </group>
  )
}

useGLTF.preload('/models/dj_frank_t-pose_brawl_stars.glb')
useGLTF.preload('/models/flex_dj_console.glb')
useGLTF.preload('/models/vintage_boombox_final.glb')
useGLTF.preload('/models/headphones_final.glb')
useGLTF.preload('/models/thug_life__cool_glasses__stylise_goggles.glb')
useGLTF.preload('/models/fender_electric_guitar_3d_model.glb')
useGLTF.preload('/models/free_realistic_disco_ball.glb')
useGLTF.preload('/models/pretty_simple_discoball_final.glb')
useGLTF.preload('/models/retro_microphone.glb')
useGLTF.preload('/models/cactus_lowpoly.glb')
useGLTF.preload('/models/eye_in_the_flask.glb')
