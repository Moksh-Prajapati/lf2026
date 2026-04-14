import { useProgress } from '@react-three/drei'
import { useEffect, useState, useRef } from 'react'
import { gsap } from 'gsap'

export default function LoadingScreen() {
  const { progress, active, total } = useProgress()
  const [visible, setVisible] = useState(true)
  const [minTimePassed, setMinTimePassed] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const dismissed = useRef(false)

  useEffect(() => {
    const timer = setTimeout(() => setMinTimePassed(true), 800)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (dismissed.current) return

    const shouldDismiss =
      minTimePassed && !active && (progress >= 100 || total === 0)

    if (shouldDismiss) {
      dismissed.current = true
      const tl = gsap.timeline({
        onComplete: () => setVisible(false),
      })
      tl.to(containerRef.current, {
        opacity: 0,
        scale: 1.05,
        duration: 0.6,
        ease: 'power2.inOut',
        delay: 0.2,
      })
    }
  }, [active, progress, total, minTimePassed])

  if (!visible) return null

  const displayProgress = total === 0 && minTimePassed ? 100 : progress

  return (
    <div ref={containerRef} className="loading-screen">
      <div className="loading-content">
        <img
          src="/images/dj-jamming.gif"
          alt="DJ Jamming"
          className="loading-gif"
        />
        <div className="loading-logo">
          <span className="loading-le">LE</span>
          <span className="loading-fiestus">FIESTUS</span>
        </div>
        <p className="loading-subtitle">JUIT&rsquo;S ANNUAL FEST &bull; 2026</p>
        <div className="loading-bar-track">
          <div
            className="loading-bar-fill"
            style={{ width: `${displayProgress}%` }}
          />
        </div>
        <p className="loading-percent">{Math.round(displayProgress)}%</p>
      </div>
    </div>
  )
}
