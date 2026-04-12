import { useEffect, useRef, useState, useMemo } from 'react'

const GOO_COLORS = ['#00c853', '#69f0ae', '#2e7d32', '#00e676', '#1b5e20', '#b9f6ca', '#43a047', '#76ff03']

function rand(min, max) { return min + Math.random() * (max - min) }

// Pre-generate stable pieces
const PIECES = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  angle: (i / 28) * 360 + rand(-14, 14),
  dist: rand(90, 380),
  size: rand(28, 90),
  dur: rand(0.55, 1.0),
  delay: rand(0, 0.07),
  color: GOO_COLORS[i % GOO_COLORS.length],
}))

// Drips hang downward with gravity feel
const DRIPS = Array.from({ length: 8 }, (_, i) => ({
  id: i + 100,
  angle: rand(60, 120), // downward arc
  dist: rand(60, 200),
  w: rand(14, 32),
  h: rand(40, 110),
  dur: rand(0.7, 1.2),
  delay: rand(0.05, 0.15),
  color: GOO_COLORS[i % GOO_COLORS.length],
}))

export default function HandSlap({ target, isCorrect, onComplete }) {
  const handRef = useRef()
  const [impact, setImpact] = useState(null)

  useEffect(() => {
    if (!target || !handRef.current) return
    const el = handRef.current
    const handW = 200
    const vh = window.innerHeight
    const targetX = target.left + target.width / 2 - handW / 2
    const impactY = target.top + target.height * 0.5

    el.style.transition = 'none'
    el.style.opacity = '1'
    el.style.left = `${targetX}px`
    el.style.top = `${vh}px`

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.transition = 'top 0.18s cubic-bezier(0.4, 0, 0.2, 1.3)'
        el.style.top = `${impactY - 80}px`
      })
    })

    const t1 = setTimeout(() => {
      setImpact({ x: target.left + target.width / 2, y: target.top + target.height * 0.5 })
    }, 210)
    const t2 = setTimeout(() => {
      el.style.transition = 'top 0.35s cubic-bezier(0.4, 0, 0.8, 1)'
      el.style.top = `${vh}px`
    }, 560)
    const t3 = setTimeout(onComplete, 1400)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [target])

  const accentColor = isCorrect ? '#69f0ae' : '#ff5252'

  return (
    <>
      {/* SVG goo filter — makes overlapping blobs merge into one mass */}
      <svg style={{ position: 'fixed', width: 0, height: 0, overflow: 'hidden' }}>
        <defs>
          <filter id="splat-goo" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="14" result="blur" />
            <feColorMatrix in="blur" mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9"
              result="goo" />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      <div ref={handRef} style={{ position: 'fixed', zIndex: 30, pointerEvents: 'none', opacity: 0 }}>
        <svg viewBox="0 0 200 600" width="200" height="600">
          <rect x="76" y="160" width="48" height="440" rx="12" fill="#f9a825" />
          <rect x="84" y="160" width="14" height="440" rx="6" fill="#fdd835" opacity="0.55" />
          <rect x="54" y="120" width="92" height="60" rx="20" fill="#fdd835" />
          <rect x="36" y="48" width="128" height="90" rx="22" fill="#fdd835" />
          <rect x="48" y="58" width="104" height="60" rx="14" fill="#ffe082" opacity="0.5" />
          <rect x="38" y="0" width="24" height="62" rx="12" fill="#fdd835" />
          <rect x="66" y="-10" width="24" height="68" rx="12" fill="#fdd835" />
          <rect x="94" y="-16" width="24" height="74" rx="12" fill="#fdd835" />
          <rect x="122" y="-10" width="24" height="68" rx="12" fill="#fdd835" />
          <rect x="12" y="50" width="22" height="56" rx="11" fill="#fdd835" transform="rotate(-28 12 50)" />
          <circle cx="49" cy="52" r="6" fill="#ffe082" opacity="0.7" />
          <circle cx="77" cy="46" r="6" fill="#ffe082" opacity="0.7" />
          <circle cx="105" cy="42" r="6" fill="#ffe082" opacity="0.7" />
          <circle cx="133" cy="46" r="6" fill="#ffe082" opacity="0.7" />
        </svg>
      </div>

      {impact && (
        <div className="impact-flash"
          style={{ '--flash-color': isCorrect ? 'rgba(0,200,83,0.5)' : 'rgba(255,82,82,0.4)' }}
        />
      )}

      {impact && isCorrect && (
        <div
          className="goo-burst"
          style={{ left: impact.x, top: impact.y, position: 'fixed', zIndex: 28, pointerEvents: 'none' }}
        >
          {/* Central splat — SVG star-burst with irregular lobes */}
          <svg className="goo-central" viewBox="-100 -100 200 200" xmlns="http://www.w3.org/2000/svg">
            <path fill="#00c853" d="
              M 0,-85 C 12,-70 28,-72 22,-50
              C 40,-58 55,-48 42,-30
              C 62,-28 72,-12 55,0
              C 72,10 65,28 46,28
              C 54,44 44,58 26,52
              C 22,70 8,76 0,62
              C -8,76 -22,70 -26,52
              C -44,58 -54,44 -46,28
              C -65,28 -72,10 -55,0
              C -72,-12 -62,-28 -42,-30
              C -55,-48 -40,-58 -22,-50
              C -28,-72 -12,-70 0,-85 Z
            "/>
            <path fill="#1b5e20" opacity="0.5" d="
              M 0,-60 C 8,-48 20,-50 15,-34
              C 30,-40 40,-30 28,-18
              C 44,-16 50,-4 36,2
              C 50,10 44,24 30,22
              C 36,34 26,44 14,38
              C 10,50 2,54 0,42
              C -2,54 -10,50 -14,38
              C -26,44 -36,34 -30,22
              C -44,24 -50,10 -36,2
              C -50,-4 -44,-16 -28,-18
              C -40,-30 -30,-40 -15,-34
              C -20,-50 -8,-48 0,-60 Z
            "/>
          </svg>

          {/* Radiating blobs — filter merges them when overlapping */}
          {PIECES.map(p => (
            <div
              key={p.id}
              className="goo-piece goo-piece--blob"
              style={{
                '--angle': `${p.angle}deg`,
                '--dist': `${p.dist}px`,
                width: p.size,
                height: p.size,
                background: p.color,
                animationDuration: `${p.dur}s`,
                animationDelay: `${p.delay}s`,
              }}
            />
          ))}

          {/* Drips — elongated teardrops heading downward */}
          {DRIPS.map(p => (
            <div
              key={p.id}
              className="goo-piece goo-piece--drip"
              style={{
                '--angle': `${p.angle}deg`,
                '--dist': `${p.dist}px`,
                width: p.w,
                height: p.h,
                background: p.color,
                animationDuration: `${p.dur}s`,
                animationDelay: `${p.delay}s`,
              }}
            />
          ))}
        </div>
      )}

      {impact && !isCorrect && (
        <svg className="impact-burst" viewBox="0 0 140 140" width="140" height="140"
          style={{ left: impact.x - 70, top: impact.y - 70, position: 'fixed', zIndex: 32, pointerEvents: 'none' }}
        >
          {[0, 45, 90, 135, 180, 225, 270, 315].map(angle => {
            const rad = (angle * Math.PI) / 180
            return (
              <line key={angle} x1="70" y1="70"
                x2={70 + Math.cos(rad) * 62} y2={70 + Math.sin(rad) * 62}
                stroke={accentColor} strokeWidth="3.5" strokeLinecap="round" />
            )
          })}
          <circle cx="70" cy="70" r="12" fill={accentColor} opacity="0.8" />
        </svg>
      )}
    </>
  )
}
