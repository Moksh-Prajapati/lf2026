import { Suspense, useState, useEffect, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import FestivalPlaza from './components/FestivalPlaza'
import OverlayUI from './components/OverlayUI'
import LoadingScreen from './components/LoadingScreen'

function App() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768)

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return (
    <>
      <div className="canvas-wrap">
        <Canvas
          camera={{
            position: isMobile ? [0, 5, 28] : [0, 3, 20],
            fov: isMobile ? 65 : 55,
          }}
          dpr={[1, Math.min(isMobile ? 1.5 : 2, window.devicePixelRatio)]}
          gl={{
            antialias: !isMobile,
            alpha: false,
            powerPreference: 'high-performance',
            stencil: false,
          }}
          shadows={!isMobile}
          style={{ background: '#0A3D3A' }}
        >
          <color attach="background" args={['#0A3D3A']} />

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
