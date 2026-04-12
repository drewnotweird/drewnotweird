import { useEffect, useRef } from 'react'

export default function Timer({ duration, onTimeout }) {
  const barRef = useRef()
  const startRef = useRef(performance.now())
  const rafRef = useRef()
  const firedRef = useRef(false)

  useEffect(() => {
    function tick() {
      const elapsed = (performance.now() - startRef.current) / 1000
      const fraction = Math.max(0, 1 - elapsed / duration)

      if (barRef.current) {
        const fill = 1 - fraction
        barRef.current.style.transform = `scaleX(${fill})`
        // Green (0,220,0) → yellow (255,220,0) → red (255,0,0)
        // Two-segment lerp but both segments share smooth eased t
        let r, g
        if (fill < 0.5) {
          const t = fill / 0.5
          const e = t * t * (3 - 2 * t) // smoothstep
          r = Math.round(e * 255)
          g = 220
        } else {
          const t = (fill - 0.5) / 0.5
          const e = t * t * (3 - 2 * t)
          r = 255
          g = Math.round((1 - e) * 220)
        }
        barRef.current.style.backgroundColor = `rgb(${r}, ${g}, 0)`
      }

      if (fraction <= 0) {
        if (!firedRef.current) {
          firedRef.current = true
          onTimeout()
        }
      } else {
        rafRef.current = requestAnimationFrame(tick)
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [duration, onTimeout])

  return (
    <div className="timer-track">
      <div ref={barRef} className="timer-bar" />
    </div>
  )
}
