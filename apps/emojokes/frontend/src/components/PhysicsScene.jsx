import { useEffect, useRef, useState, useCallback } from 'react'
import Matter from 'matter-js'
import { JOKES } from '../data/jokes.js'

const WIDE = window.innerWidth >= 1024
const R = WIDE ? 80 : 40
const EXP_W = WIDE ? 460 : 340
const EXP_H = WIDE ? 400 : 360
const REPEL_R = WIDE ? 120 : 90
const REPEL_F = 0.0025
const TRANSITION = 380
const STAGGER = 180

export default function PhysicsScene() {
  const containerRef = useRef(null)
  const engineRef = useRef(null)
  const worldRef = useRef(null)
  const wallsRef = useRef([])
  const bodyMap = useRef({})
  const elMap = useRef({})
  const cursorRef = useRef({ x: -999, y: -999 })
  const expandedRef = useRef(null)
  const handsOffRef = useRef(new Set())
  const [expandedId, setExpandedId] = useState(null)
  const [textVisibleId, setTextVisibleId] = useState(null)
  const [punchlineVisibleId, setPunchlineVisibleId] = useState(null)
  const TEXT_FADE = 220  // ms for text fade in/out

  useEffect(() => { expandedRef.current = expandedId }, [expandedId])

  useEffect(() => {
    const container = containerRef.current
    const engine = Matter.Engine.create()
    const world = engine.world
    engineRef.current = engine
    worldRef.current = world

    const buildWalls = () => {
      const W = container.clientWidth
      const H = container.clientHeight
      wallsRef.current.forEach(w => Matter.World.remove(world, w))
      const walls = [
        Matter.Bodies.rectangle(W / 2, H + 30, W * 3, 60, { isStatic: true, label: 'wall' }),
        Matter.Bodies.rectangle(-30, H / 2, 60, H * 3, { isStatic: true, label: 'wall' }),
        Matter.Bodies.rectangle(W + 30, H / 2, 60, H * 3, { isStatic: true, label: 'wall' }),
      ]
      Matter.World.add(world, walls)
      wallsRef.current = walls
    }

    buildWalls()

    // Create all bodies high off-screen but don't add to world yet — stagger the drops
    const W = container.clientWidth
    JOKES.forEach((joke, i) => {
      const cols = Math.max(1, Math.floor(W / (R * 2 + 10)))
      const col = i % cols
      const row = Math.floor(i / cols)
      const x = R + 10 + col * (R * 2 + 10) + (row % 2) * R
      const y = -R * 2

      const body = Matter.Bodies.circle(x, y, R, {
        restitution: 0.65,
        friction: 0.05,
        frictionAir: 0.008,
        label: String(joke.id),
      })
      bodyMap.current[joke.id] = body

      // Stagger each circle dropping in
      setTimeout(() => {
        if (worldRef.current) {
          Matter.World.add(worldRef.current, body)
          const el = elMap.current[joke.id]
          if (el) el.style.opacity = '1'
        }
      }, i * STAGGER)
    })

    const ro = new ResizeObserver(() => buildWalls())
    ro.observe(container)

    let rafId
    const FIXED_DT = 16 // 16ms ~ 60fps

    function tick() {
      rafId = requestAnimationFrame(tick)
      Matter.Engine.update(engine, FIXED_DT)

      const cx = cursorRef.current.x
      const cy = cursorRef.current.y

      JOKES.forEach(({ id }) => {
        const body = bodyMap.current[id]
        if (!body || body.isStatic) return

        const dx = body.position.x - cx
        const dy = body.position.y - cy
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < REPEL_R && dist > 0) {
          const f = REPEL_F * (1 - dist / REPEL_R)
          Matter.Body.applyForce(body, body.position, { x: (dx / dist) * f, y: (dy / dist) * f })
        }

        if (handsOffRef.current.has(id)) return
        const el = elMap.current[id]
        if (!el) return
        el.style.left = `${body.position.x - R}px`
        el.style.top = `${body.position.y - R}px`
        el.style.transform = `rotate(${body.angle}rad)`
      })
    }

    tick()
    return () => {
      cancelAnimationFrame(rafId)
      ro.disconnect()
      Matter.World.clear(world)
      Matter.Engine.clear(engine)
    }
  }, [])

  const collapse = useCallback((id) => {
    const body = bodyMap.current[id]
    const el = elMap.current[id]
    if (!el) return

    const W = containerRef.current.clientWidth

    handsOffRef.current.add(id)
    // Fade text out and card out simultaneously
    setTextVisibleId(null)
    setPunchlineVisibleId(null)
    el.style.transition = `opacity ${TEXT_FADE}ms ease`
    el.style.opacity = '0'

    setTimeout(() => {
      setExpandedId(null)
      // Reset to circle and position at random horizontal position off-screen at top
      const randomX = Math.random() * W
      el.style.opacity = '1'
      el.style.width = `${R * 2}px`
      el.style.height = `${R * 2}px`
      el.style.borderRadius = '50%'
      el.style.zIndex = '1'
      el.style.boxShadow = '0 2px 12px rgba(0,0,0,0.12)'
      el.style.left = `${randomX - R}px`
      el.style.top = `${-R * 2}px`
      el.style.transition = ''
      el.style.transform = ''

      if (body) {
        // Re-add to world (expand removed it)
        Matter.World.add(worldRef.current, body)
        Matter.Body.setStatic(body, false)
        Matter.Body.setPosition(body, { x: randomX, y: -R })
        Matter.Body.setVelocity(body, { x: (Math.random() - 0.5) * 3, y: 1 })
        Matter.Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.1)
      }
      handsOffRef.current.delete(id)
    }, TEXT_FADE + 20)
  }, [])

  const expand = useCallback((id) => {
    const body = bodyMap.current[id]
    const el = elMap.current[id]
    if (!el) return

    const W = containerRef.current.clientWidth
    const H = containerRef.current.clientHeight

    handsOffRef.current.add(id)
    Matter.World.remove(worldRef.current, body)

    const expW = Math.min(EXP_W, W - 32)
    el.style.transition = `left ${TRANSITION}ms ease, top ${TRANSITION}ms ease, width ${TRANSITION}ms ease, height ${TRANSITION}ms ease, border-radius ${TRANSITION}ms ease, box-shadow ${TRANSITION}ms ease`
    el.style.width = `${expW}px`
    el.style.height = `${EXP_H}px`
    el.style.borderRadius = '24px'
    el.style.left = `${W / 2 - expW / 2}px`
    el.style.top = `${H / 2 - EXP_H / 2}px`
    el.style.zIndex = '10'
    el.style.transform = 'none'
    el.style.boxShadow = '0 8px 40px rgba(0,0,0,0.2)'

    setExpandedId(id)
    // Fade setup in after card has finished opening, then punchline 1s later
    setTimeout(() => setTextVisibleId(id), TRANSITION + 40)
    setTimeout(() => setPunchlineVisibleId(id), TRANSITION + 40 + 1000)
  }, [])

  const handleTap = useCallback((id) => {
    const prev = expandedRef.current
    if (prev !== null) {
      collapse(prev)
      if (prev === id) return
    }
    const delay = prev !== null && prev !== id ? 80 : 0
    setTimeout(() => expand(id), delay)
  }, [collapse, expand])

  const handleMouseMove = useCallback((e) => {
    const rect = containerRef.current.getBoundingClientRect()
    cursorRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }, [])

  const handleTouchMove = useCallback((e) => {
    const rect = containerRef.current.getBoundingClientRect()
    const t = e.touches[0]
    cursorRef.current = { x: t.clientX - rect.left, y: t.clientY - rect.top }
  }, [])

  return (
    <div
      ref={containerRef}
      style={{ position: 'relative', width: '100vw', height: '100dvh', background: '#f6f0d1', overflow: 'hidden' }}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
    >
      {JOKES.map((joke) => {
        const isExpanded = expandedId === joke.id
        return (
          <div
            key={joke.id}
            ref={(el) => { elMap.current[joke.id] = el }}
            onClick={() => handleTap(joke.id)}
            style={{
              position: 'absolute',
              width: R * 2,
              height: R * 2,
              borderRadius: '50%',
              background: '#fff',
              boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
              cursor: 'pointer',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              overflow: 'hidden',
              zIndex: 1,
              opacity: 0,
            }}
          >
            {/* Emoji — absolutely centred in the circle at all times */}
            <span style={{
              position: 'absolute',
              top: isExpanded ? 24 : '50%',
              left: '50%',
              transform: isExpanded ? 'translateX(-50%)' : 'translate(-50%, -50%)',
              fontSize: isExpanded ? 52 : R * 1.05,
              lineHeight: 1,
              transition: 'font-size 0.3s ease, top 0.3s ease, transform 0.3s ease',
              pointerEvents: 'none',
            }}>
              {joke.emoji}
            </span>

            {/* Setup + punchline — present in DOM when expanded, fade in sequentially */}
            {isExpanded && (
              <div style={{
                position: 'absolute',
                top: WIDE ? 90 : 105,
                bottom: 20,
                left: 0,
                right: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                padding: `0 ${WIDE ? 32 : 24}px`,
              }}>
                <p style={{
                  fontFamily: "'DynaPuff', cursive",
                  fontSize: WIDE ? '1.9rem' : '1.4rem',
                  lineHeight: 1.5,
                  color: '#333',
                  textAlign: 'center',
                  pointerEvents: 'none',
                  fontWeight: 300,
                  opacity: textVisibleId === joke.id ? 0.6 : 0,
                  transition: `opacity ${TEXT_FADE}ms ease`,
                  margin: 0,
                }}>
                  {joke.setup}
                </p>
                <p style={{
                  fontFamily: "'DynaPuff', cursive",
                  fontSize: WIDE ? '1.9rem' : '1.4rem',
                  lineHeight: 1.5,
                  color: '#333',
                  textAlign: 'center',
                  pointerEvents: 'none',
                  fontWeight: 700,
                  opacity: punchlineVisibleId === joke.id ? 1 : 0,
                  transition: `opacity ${TEXT_FADE}ms ease`,
                  margin: 0,
                }}>
                  {joke.punchline}
                </p>
              </div>
            )}
          </div>
        )
      })}

      <div
        onClick={() => expandedRef.current !== null && collapse(expandedRef.current)}
        style={{
          position: 'absolute', inset: 0,
          background: 'rgba(0,0,0,0.25)',
          opacity: expandedId !== null ? 1 : 0,
          transition: 'opacity 0.3s ease',
          pointerEvents: expandedId !== null ? 'all' : 'none',
          zIndex: 5,
        }}
      />
    </div>
  )
}
