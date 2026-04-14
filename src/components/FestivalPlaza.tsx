import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { ContactShadows, Sparkles } from '@react-three/drei'
import * as THREE from 'three'
import CentralFeature from './CentralFeature'

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
    mat.opacity = 0.09 + Math.sin(t * 2) * 0.03
  })
  return (
    <mesh ref={ref} position={position}>
      <cylinderGeometry args={[0.02, 1.2, 30, 8]} />
      <meshBasicMaterial color={color} transparent opacity={0.1} side={THREE.DoubleSide} />
    </mesh>
  )
}

const patternVertexShader = `
varying vec2 vUv;
varying vec3 vPos;
void main() {
  vUv = uv;
  vPos = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const patternFragmentShader = `
uniform float uTime;
varying vec2 vUv;
varying vec3 vPos;

void main() {
  // Use spherical position to avoid pole distortion
  vec2 uv = vec2(vUv.x * 12.0, vUv.y * 8.0);
  float t = uTime * 0.08;

  // Layered sine waves for organic wood-grain / topographic contour look
  float n = 0.0;
  n += sin(uv.x * 1.8 + uv.y * 1.2 + t * 1.0);
  n += 0.6 * sin(uv.x * 2.5 - uv.y * 2.0 + t * 1.4);
  n += 0.35 * sin(uv.x * 4.2 + uv.y * 3.0 - t * 0.8);
  n += 0.5 * sin(uv.y * 2.8 + uv.x * 0.9 - t * 1.1);
  n += 0.25 * sin((uv.x - uv.y) * 3.0 + t * 0.6);
  n += 0.15 * sin((uv.x + uv.y) * 5.0 - t * 0.5);

  // Create flowing contour lines
  float lines = abs(sin(n * 1.8));
  lines = smoothstep(0.0, 0.3, lines);

  // Teal colors matching Le Fiestus theme
  vec3 baseColor = vec3(0.082, 0.678, 0.667);   // #15ADA9 bright teal
  vec3 lineColor = vec3(0.059, 0.569, 0.561);   // #0F918F darker teal lines

  // Subtle second layer for extra depth
  float detail = abs(sin(n * 3.5 + 1.5));
  detail = smoothstep(0.0, 0.5, detail);

  vec3 color = mix(lineColor, baseColor, lines);
  color = mix(color, baseColor * 1.04, detail * 0.15);

  gl_FragColor = vec4(color, 1.0);
}
`

function AnimatedPatternSky() {
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
  }), [])

  useFrame((state) => {
    uniforms.uTime.value = state.clock.elapsedTime
  })

  return (
    <mesh renderOrder={-1}>
      <sphereGeometry args={[120, 64, 64]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={patternVertexShader}
        fragmentShader={patternFragmentShader}
        side={THREE.BackSide}
        depthWrite={false}
      />
    </mesh>
  )
}

export default function FestivalPlaza() {
  const groupRef = useRef<THREE.Group>(null)
  const isMobile = useMemo(() => window.innerWidth < 768, [])

  const groundTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    const c = canvas.getContext('2d')!

    c.fillStyle = '#085c54'
    c.fillRect(0, 0, 512, 512)

    const grad = c.createRadialGradient(256, 256, 40, 256, 256, 380)
    grad.addColorStop(0, 'rgba(20, 184, 166, 0.12)')
    grad.addColorStop(0.5, 'rgba(13, 148, 136, 0.06)')
    grad.addColorStop(1, 'rgba(5, 31, 28, 0.15)')
    c.fillStyle = grad
    c.fillRect(0, 0, 512, 512)

    c.fillStyle = 'rgba(0, 0, 0, 0.04)'
    for (let x = 0; x < 512; x += 10) {
      for (let y = 0; y < 512; y += 10) {
        c.beginPath()
        c.arc(x + 5, y + 5, 1.2, 0, Math.PI * 2)
        c.fill()
      }
    }

    c.fillStyle = 'rgba(255, 255, 255, 0.012)'
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
        (state.pointer.x * Math.PI) / 16,
        0.035
      )
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        (-state.pointer.y * Math.PI) / 30,
        0.035
      )
    }
  })

  return (
    <>
      <AnimatedPatternSky />

      <ambientLight intensity={0.8} color="#ffffff" />
      <directionalLight
        position={[10, 20, 12]}
        intensity={1.7}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={50}
        shadow-camera-left={-25}
        shadow-camera-right={25}
        shadow-camera-top={25}
        shadow-camera-bottom={-25}
        color="#fff5e6"
      />
      <directionalLight position={[-8, 15, 8]} intensity={0.6} color="#e0f2fe" />
      <pointLight position={[-12, 8, -3]} intensity={1.0} color="#ec4899" distance={45} />
      <pointLight position={[14, 8, -3]} intensity={1.0} color="#8b5cf6" distance={45} />
      <pointLight position={[0, 4, 14]} intensity={0.6} color="#eab308" distance={35} />
      <pointLight position={[0, 14, 0]} intensity={0.5} color="#14b8a6" distance={40} />
      <pointLight position={[10, 2, 5]} intensity={0.5} color="#f472b6" distance={25} />
      <pointLight position={[-15, 6, 4]} intensity={0.4} color="#eab308" distance={30} />
      <pointLight position={[15, 6, 4]} intensity={0.4} color="#ec4899" distance={30} />

      <Sparkles count={isMobile ? 80 : 200} scale={[60, 35, 40]} size={4} speed={0.5} opacity={0.6} color="#fef08a" />
      <Sparkles count={isMobile ? 30 : 80} scale={[50, 30, 35]} size={6} speed={0.3} opacity={0.4} color="#ec4899" />
      <Sparkles count={isMobile ? 25 : 50} scale={[55, 25, 30]} size={5} speed={0.35} opacity={0.3} color="#a78bfa" />
      {!isMobile && <Sparkles count={100} scale={[65, 40, 45]} size={3} speed={0.6} opacity={0.5} color="#14b8a6" />}
      {!isMobile && <Sparkles count={60} scale={[45, 30, 25]} size={4.5} speed={0.4} opacity={0.3} color="#fbbf24" />}

      <SpotlightBeam position={[-6, 12, -2]} color="#ec4899" speed={0.3} tilt={0.4} />
      <SpotlightBeam position={[6, 12, -2]} color="#8b5cf6" speed={0.35} tilt={0.35} />
      <SpotlightBeam position={[0, 12, -3]} color="#eab308" speed={0.25} tilt={0.3} />

      <group ref={groupRef}>
        <CentralFeature />
      </group>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3.6, 0]} receiveShadow>
        <planeGeometry args={[150, 150]} />
        <meshStandardMaterial map={groundTexture} roughness={0.85} color="#085c54" />
      </mesh>

      <ContactShadows
        opacity={0.3}
        scale={45}
        blur={2.5}
        far={6}
        color="#053d36"
        position={[0, -3.58, 0]}
      />
    </>
  )
}
