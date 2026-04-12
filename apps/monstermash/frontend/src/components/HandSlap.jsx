import { useEffect, useRef, useState, useMemo } from 'react'

const GOO_COLORS = ['#69f0ae', '#00e676', '#b9f6ca', '#1de9b6', '#76ff03', '#ccff90']

const GOO_PIECES = Array.from({ length: 60 }, (_, i) => ({
  angle: (i / 60) * 360 + (Math.random() - 0.5) * 18,
  dist: 120 + Math.random() * 420,
  size: 12 + Math.random() * 52,
  delay: Math.random() * 0.08,
  dur: 0.55 + Math.random() * 0.5,
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
      setImpact({
        x: target.left + target.width / 2,
        y: target.top + target.height * 0.5,
        correct: isCorrect,
      })
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
      <div
        ref={handRef}
        style={{ position: 'fixed', zIndex: 30, pointerEvents: 'none', opacity: 0 }}
      >
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
        <div
          className="impact-flash"
          style={{ '--flash-color': isCorrect ? 'rgba(105,240,174,0.55)' : 'rgba(255,82,82,0.4)' }}
        />
      )}

      {/* Correct mash: goo splatter */}
      {impact && isCorrect && (
        <div
          className="goo-burst"
          style={{ left: impact.x, top: impact.y, position: 'fixed', zIndex: 32, pointerEvents: 'none' }}
        >
          {GOO_PIECES.map((p, i) => (
            <div
              key={i}
              className="goo-piece"
              style={{
                '--angle': `${p.angle}deg`,
                '--dist': `${p.dist}px`,
                width: p.size,
                height: p.size,
                background: p.color,
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.dur}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Wrong mash: burst lines */}
      {impact && !isCorrect && (
        <svg
          className="impact-burst"
          viewBox="0 0 140 140"
          width="140"
          height="140"
          style={{ left: impact.x - 70, top: impact.y - 70, position: 'fixed', zIndex: 32, pointerEvents: 'none' }}
        >
          {[0, 45, 90, 135, 180, 225, 270, 315].map(angle => {
            const rad = (angle * Math.PI) / 180
            return (
              <line
                key={angle}
                x1="70" y1="70"
                x2={70 + Math.cos(rad) * 62}
                y2={70 + Math.sin(rad) * 62}
                stroke={accentColor}
                strokeWidth="3.5"
                strokeLinecap="round"
              />
            )
          })}
          <circle cx="70" cy="70" r="12" fill={accentColor} opacity="0.8" />
        </svg>
      )}
    </>
  )
}
