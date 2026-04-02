import { useEffect, useRef, useState, useCallback } from 'react'
import Matter from 'matter-js'
import { JOKES } from '../data/jokes.js'

const R = 44               // circle radius px
const EXP_W = 300          // expanded width px
const EXP_H = 220          // expanded height px
const REPEL_R = 90         // cursor repulsion radius px
const REPEL_F = 0.0025     // repulsion force strength
const TRANSITION = 380     // ms

export default function PhysicsScene() {
  const containerRef = useRef(null)
  const engineRef = useRef(null)
  const worldRef = useRef(null)
  const wallsRef = useRef([])
  const bodyMap = useRef({})
  const elMap = useRef({})
  const cursorRef = useRef({ x: -999, y: -999 })
  const expandedRef = useRef(null)      // currently expanded id (for RAF skip)
  const handsOffRef = useRef(new Set()) // ids the RAF loop must never touch
  const [expandedId, setExpandedId] = useState(null)

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

    // Spawn circles from above
    const W = container.clientWidth
    JOKES.forEach((joke, i) => {
      const cols = Math.max(1, Math.floor(W / (R * 2 + 10)))
      const col = i % cols
      const row = Math.floor(i / cols)
      const x = R + 10 + col * (R * 2 + 10) + (row % 2) * R
      const y = -R - row * (R * 2.2 + 10)
      const body = Matter.Bodies.circle(x, y, R, {
        restitution: 0.45,
        friction: 0.05,
        frictionAir: 0.01,
        label: String(joke.id),
      })
      bodyMap.current[joke.id] = body
      Matter.World.add(world, body)
    })

    // Rebuild walls on resize
    const ro = new ResizeObserver(() => buildWalls())
    ro.observe(container)

    // RAF loop
    let lastTime = performance.now()
    let rafId

    function tick() {
      rafId = requestAnimationFrame(tick)
      const now = performance.now()
      Matter.Engine.update(engine, Math.min(now - lastTime, 32))
      lastTime = now

      const cx = cursorRef.current.x
      const cy = cursorRef.current.y

      JOKES.forEach(({ id }) => {
        const body = bodyMap.current[id]
        if (!body || body.isStatic) return

        // Cursor repulsion
        const dx = body.position.x - cx
        const dy = body.position.y - cy
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < REPEL_R && dist > 0) {
          const f = REPEL_F * (1 - dist / REPEL_R)
          Matter.Body.applyForce(body, body.position, { x: (dx / dist) * f, y: (dy / dist) * f })
        }

        // Don't touch elements mid-transition or while expanded
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
    const H = containerRef.current.clientHeight

    // Keep hands-off during the entire transition
    handsOffRef.current.add(id)
    setExpandedId(null)

    // Shrink back to circle, staying at centre
    el.style.transition = `left ${TRANSITION}ms ease, top ${TRANSITION}ms ease, width ${TRANSITION}ms ease, height ${TRANSITION}ms ease, border-radius ${TRANSITION}ms ease, box-shadow ${TRANSITION}ms ease`
    el.style.width = `${R * 2}px`
    el.style.height = `${R * 2}px`
    el.style.borderRadius = '50%'
    el.style.zIndex = '1'
    el.style.boxShadow = '0 2px 12px rgba(0,0,0,0.12)'
    el.style.left = `${W / 2 - R}px`
    el.style.top = `${H / 2 - R}px`

    // Once transition finishes, hand off to physics at exactly that position
    setTimeout(() => {
      el.style.transition = ''
      el.style.transform = ''
      if (body) {
        Matter.World.add(worldRef.current, body)
        Matter.Body.setStatic(body, false)
        Matter.Body.setPosition(body, { x: W / 2, y: H / 2 })
        Matter.Body.setVelocity(body, { x: (Math.random() - 0.5) * 3, y: 1 })
        Matter.Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.1)
      }
      // Now let the RAF loop take over
      handsOffRef.current.delete(id)
    }, TRANSITION + 20)
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
      {JOKES.map((joke) => (
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
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <EmojiContent joke={joke} isExpanded={expandedId === joke.id} />
        </div>
      ))}

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

function EmojiContent({ joke, isExpanded }) {
  return (
    <>
      <span style={{
        fontSize: isExpanded ? 52 : R * 1.1,
        lineHeight: 1,
        display: 'block',
        flexShrink: 0,
        transition: 'font-size 0.3s ease',
        marginTop: isExpanded ? 28 : 0,
        pointerEvents: 'none',
      }}>
        {joke.emoji}
      </span>

      <p style={{
        marginTop: 16,
        padding: '0 20px',
        textAlign: 'center',
        fontSize: '1.05rem',
        lineHeight: 1.5,
        color: '#333',
        opacity: isExpanded ? 1 : 0,
        transition: `opacity ${isExpanded ? '0.25s 0.2s' : '0.1s 0s'} ease`,
        pointerEvents: 'none',
      }}>
        {joke.joke}
      </p>
    </>
  )
}
