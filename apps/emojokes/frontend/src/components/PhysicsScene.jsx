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
const CAT_NORMAL = 0x0001
const CAT_FALLING = 0x0002

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
  const shuffleAnchorRef = useRef(null)
  const shufflingRef = useRef(new Set())
  const anchorSpinnerRef = useRef(null)
  const restoreQueueRef = useRef([])
  const nextRestoreRef = useRef(0)
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
        // Floor only stops CAT_NORMAL; shuffling circles fall through
        Matter.Bodies.rectangle(W / 2, H + 30, W * 3, 60, {
          isStatic: true, label: 'wall',
          collisionFilter: { category: CAT_NORMAL, mask: CAT_NORMAL },
        }),
        Matter.Bodies.rectangle(-30, H / 2, 60, H * 3, {
          isStatic: true, label: 'wall',
          collisionFilter: { category: CAT_NORMAL, mask: CAT_NORMAL | CAT_FALLING },
        }),
        Matter.Bodies.rectangle(W + 30, H / 2, 60, H * 3, {
          isStatic: true, label: 'wall',
          collisionFilter: { category: CAT_NORMAL, mask: CAT_NORMAL | CAT_FALLING },
        }),
      ]
      Matter.World.add(world, walls)
      wallsRef.current = walls

      if (shuffleAnchorRef.current) {
        Matter.Body.setPosition(shuffleAnchorRef.current, { x: W / 2, y: H / 2 })
      }
    }

    buildWalls()

    // Static black circle at screen centre
    const W = container.clientWidth
    const H = container.clientHeight
    const anchor = Matter.Bodies.circle(W / 2, H / 2, R, {
      isStatic: true,
      label: 'anchor',
      collisionFilter: { category: CAT_NORMAL, mask: CAT_NORMAL },
    })
    shuffleAnchorRef.current = anchor
    Matter.World.add(world, anchor)

    // Create all bodies high off-screen but don't add to world yet — stagger the drops
    const staggerIds = []
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
        collisionFilter: { category: CAT_NORMAL, mask: CAT_NORMAL },
      })
      bodyMap.current[joke.id] = body

      staggerIds.push(setTimeout(() => {
        if (worldRef.current) {
          Matter.World.add(worldRef.current, body)
          const el = elMap.current[joke.id]
          if (el) el.style.opacity = '1'
        }
      }, i * STAGGER))
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
      const cH = container.clientHeight
      const cW = container.clientWidth

      const now = performance.now()
      if (restoreQueueRef.current.length > 0 && now >= nextRestoreRef.current) {
        const id = restoreQueueRef.current.shift()
        const body = bodyMap.current[id]
        if (body) {
          const rx = R + Math.random() * (cW - R * 2)
          body.collisionFilter = { category: CAT_NORMAL, mask: CAT_NORMAL }
          Matter.Body.setPosition(body, { x: rx, y: -cH })
          Matter.Body.setVelocity(body, { x: (Math.random() - 0.5) * 3, y: 1 })
          Matter.Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.1)
        }
        nextRestoreRef.current = now + STAGGER
      }

      JOKES.forEach(({ id }) => {
        const body = bodyMap.current[id]
        if (!body || body.isStatic) return

        // Circle has fallen off-screen — park it and queue for sequential re-entry
        if (shufflingRef.current.has(id) && body.position.y > cH + R * 2) {
          shufflingRef.current.delete(id)
          Matter.Body.setPosition(body, { x: body.position.x, y: -(cH * 3) })
          Matter.Body.setVelocity(body, { x: 0, y: 0 })
          restoreQueueRef.current.push(id)
        }

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
        el.style.transform = `translate(${body.position.x - R}px, ${body.position.y - R}px) rotate(${body.angle}rad)`
      })
    }

    tick()
    return () => {
      cancelAnimationFrame(rafId)
      staggerIds.forEach(clearTimeout)
      ro.disconnect()
      Matter.World.clear(world)
      Matter.Engine.clear(engine)
    }
  }, [])

  const handleShuffle = useCallback(() => {
    const world = worldRef.current
    if (!world) return

    const active = JOKES
      .filter(({ id }) => {
        const body = bodyMap.current[id]
        return body && !body.isStatic && !shufflingRef.current.has(id) && expandedRef.current !== id
      })
      .sort((a, b) => bodyMap.current[b.id].position.y - bodyMap.current[a.id].position.y)

    const half = Math.ceil(active.length / 2)
    active.slice(0, half).forEach(({ id }) => {
      const body = bodyMap.current[id]
      shufflingRef.current.add(id)
      body.collisionFilter = { category: CAT_FALLING, mask: 0x0000 }
      Matter.Body.setVelocity(body, { x: body.velocity.x, y: Math.max(body.velocity.y, 15) })
    })

    restoreQueueRef.current = []
    nextRestoreRef.current = 0

    const el = anchorSpinnerRef.current
    if (el) {
      el.classList.remove('anchor-spinning')
      void el.offsetWidth
      el.classList.add('anchor-spinning')
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
      el.style.left = '0'
      el.style.top = '0'
      el.style.transition = ''
      el.style.transform = `translate(${randomX - R}px, ${-R * 2}px)`

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

    // Snapshot physical position before handing off — needed to start the CSS transition from the right place
    const startX = body.position.x - R
    const startY = body.position.y - R

    handsOffRef.current.add(id)
    Matter.World.remove(worldRef.current, body)

    // Switch from transform-based positioning to left/top so CSS transition can animate
    el.style.transform = 'none'
    el.style.left = `${startX}px`
    el.style.top = `${startY}px`
    void el.offsetWidth // force reflow so browser registers starting position

    const expW = Math.min(EXP_W, W - 32)
    el.style.transition = `left ${TRANSITION}ms ease, top ${TRANSITION}ms ease, width ${TRANSITION}ms ease, height ${TRANSITION}ms ease, border-radius ${TRANSITION}ms ease, box-shadow ${TRANSITION}ms ease`
    el.style.width = `${expW}px`
    el.style.height = `${EXP_H}px`
    el.style.borderRadius = '24px'
    el.style.left = `${W / 2 - expW / 2}px`
    el.style.top = `${H / 2 - EXP_H / 2}px`
    el.style.zIndex = '10'
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

  const handleContainerClick = useCallback((e) => {
    const rect = containerRef.current.getBoundingClientRect()
    const W = containerRef.current.clientWidth
    const H = containerRef.current.clientHeight
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const dx = x - W / 2
    const dy = y - H / 2
    const dist = Math.sqrt(dx * dx + dy * dy)

    if (expandedRef.current !== null) {
      collapse(expandedRef.current)
      return
    }

    // Anchor check: direct distance to centre — always wins, no physics query needed
    if (dist <= R) {
      handleShuffle()
      return
    }

    // Joke circle check via physics query
    const bodies = Matter.Query.point(Matter.Composite.allBodies(worldRef.current), { x, y })
    const jokeBody = bodies.find(b => {
      const id = Number(b.label)
      return !isNaN(id) && b.label !== 'wall' && !shufflingRef.current.has(id)
    })
    if (jokeBody) handleTap(Number(jokeBody.label))
  }, [collapse, handleTap, handleShuffle])

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
      onClick={handleContainerClick}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
    >
      {JOKES.map((joke) => {
        const isExpanded = expandedId === joke.id
        return (
          <div
            key={joke.id}
            ref={(el) => { elMap.current[joke.id] = el }}
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
              willChange: 'transform',
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

      {/* Black shuffle anchor — outer div positions, inner div spins */}
      <div style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 3,
        pointerEvents: 'none',
      }}>
        <div
          ref={anchorSpinnerRef}
          style={{ width: R * 2, height: R * 2, borderRadius: '50%', background: '#111', position: 'relative' }}
        >
          <svg
            width={R * 2}
            height={R * 2}
            viewBox={`0 0 ${R * 2} ${R * 2}`}
            style={{ position: 'absolute', top: 0, left: 0 }}
          >
            <defs>
              <path
                id="emojokes-smile"
                d={`M ${R * 0.394},${R * 0.65} A ${R * 0.7},${R * 0.7} 0 1 0 ${R * 1.606},${R * 0.65}`}
              />
            </defs>
            <text
              fill="white"
              fontSize={R * 0.44}
              fontFamily="'DynaPuff', cursive"
              fontWeight="700"
              letterSpacing={R * 0.06}
            >
              <textPath href="#emojokes-smile" startOffset="50%" textAnchor="middle">
                EMOJOKES
              </textPath>
            </text>
          </svg>
        </div>
      </div>

      <div
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
