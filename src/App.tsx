import { Suspense, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import FestivalPlaza from './components/FestivalPlaza'
import OverlayUI from './components/OverlayUI'
import LoadingScreen from './components/LoadingScreen'

function App() {
  const isMobile = useMemo(() => window.innerWidth < 768, [])

  return (
    <>
      <div className="canvas-wrap">
        <Canvas
          camera={{
            position: isMobile ? [0, 4, 25] : [0, 3, 20],
            fov: isMobile ? 60 : 55,
          }}
          dpr={[1, Math.min(isMobile ? 1.5 : 2, window.devicePixelRatio)]}
          gl={{
            antialias: !isMobile,
            alpha: false,
            powerPreference: 'high-performance',
            stencil: false,
          }}
          shadows={!isMobile}
          style={{ background: '#0d9488' }}
        >
          <color attach="background" args={['#0d9488']} />
          <fog attach="fog" args={['#0a7c71', isMobile ? 20 : 30, isMobile ? 45 : 55]} />

          <Suspense fallback={null}>
            <FestivalPlaza />
          </Suspense>
        </Canvas>
      </div>

      <LoadingScreen />
      <OverlayUI />
    </>
  )
}

export default App
