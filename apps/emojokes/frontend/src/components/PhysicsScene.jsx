import { useEffect, useRef, useState, useCallback } from 'react'
import Matter from 'matter-js'
import { JOKES } from '../data/jokes.js'

const WIDE = window.innerWidth >= 1024
const MOBILE = window.innerWidth < 768
const BATCH_SIZE = MOBILE ? Math.ceil(JOKES.length / 2) : JOKES.length
const PASTELS = [
  'hsl(0,60%,94%)',   'hsl(14,62%,94%)',  'hsl(28,64%,94%)',  'hsl(42,62%,94%)',
  'hsl(56,58%,94%)',  'hsl(72,54%,94%)',  'hsl(88,50%,94%)',  'hsl(104,50%,94%)',
  'hsl(120,50%,94%)', 'hsl(138,50%,94%)', 'hsl(154,50%,94%)', 'hsl(170,50%,94%)',
  'hsl(186,52%,94%)', 'hsl(202,55%,94%)', 'hsl(218,55%,94%)', 'hsl(234,54%,94%)',
  'hsl(250,56%,94%)', 'hsl(266,58%,94%)', 'hsl(282,58%,94%)', 'hsl(298,58%,94%)',
  'hsl(314,60%,94%)', 'hsl(330,62%,94%)', 'hsl(346,62%,94%)',
  'hsl(60,70%,91%)',  'hsl(180,70%,91%)', 'hsl(300,70%,91%)', 'hsl(0,70%,91%)',
  'hsl(120,70%,91%)', 'hsl(240,70%,91%)',
]
const PASTEL = (id) => PASTELS[id % PASTELS.length]
const R = Math.max(24, Math.min(72, Math.floor(Math.sqrt(window.innerWidth * window.innerHeight * 1.0 / (BATCH_SIZE * Math.PI)))))
const EXP_W = WIDE ? 460 : 340
const EXP_H = WIDE ? 400 : 360
const REPEL_R = Math.round(R * 1.5)
const REPEL_F = 0.0025
const TRANSITION = 380
const STAGGER = 90
const POP_STAGGER = 55
const CAT_NORMAL = 0x0001

const CATEGORIES = [
  { id: 'animals',  label: 'ANIMALS',  color: '#3a8c4a' },
  { id: 'groaners', label: 'GROANERS', color: '#2478b5' },
  { id: 'food',     label: 'FOOD',     color: '#d4631e' },
  { id: 'science',  label: 'SCIENCE',  color: '#0d9488' },
  { id: 'people',   label: 'PEOPLE',   color: '#8e44b8' },
]
// Canonical stack order top→bottom: emojokes first, then categories in array order.
// When a category is active it rotates to position 0; the rest follow from the next item, wrapping.
const MENU_ORDER = ['emojokes', ...CATEGORIES.map(c => c.id)]
const menuStaggerPos = (elId, activeCatId) => {
  const start = MENU_ORDER.indexOf(activeCatId || 'emojokes')
  const el    = MENU_ORDER.indexOf(elId)
  return (el - start + MENU_ORDER.length) % MENU_ORDER.length
}

const MENU_RING_R = R * 2.7
const toRad = d => d * Math.PI / 180
// 6 positions: index 0 = refresh (bottom), indices 1-5 = categories
// angles from top, clockwise: bottom=180, bottom-left=240, top-left=300, top=0, top-right=60, bottom-right=120
const MENU_POS = [180, 240, 300, 0, 60, 120].map(d => ({
  dx: Math.round(Math.sin(toRad(d)) * MENU_RING_R),
  dy: Math.round(-Math.cos(toRad(d)) * MENU_RING_R),
}))

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
  const restoreIdxRef = useRef(0)
  const shuffleTimerIds = useRef([])
  const nextDropIdxRef = useRef(BATCH_SIZE)
  const menuOpenRef = useRef(false)
  const activeCategoryRef = useRef(null)
  const inWorldRef = useRef(new Set())
  const restoringRef = useRef(new Set()) // circles currently falling in from restore queue
  const [expandedId, setExpandedId] = useState(null)
  const [scrimVisible, setScrimVisible] = useState(false)
  const [textVisibleId, setTextVisibleId] = useState(null)
  const [punchlineVisibleId, setPunchlineVisibleId] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState(null)
  const TEXT_FADE = 220  // ms for text fade in/out

  useEffect(() => { expandedRef.current = expandedId }, [expandedId])
  useEffect(() => { menuOpenRef.current = menuOpen }, [menuOpen])
  useEffect(() => { activeCategoryRef.current = activeCategory }, [activeCategory])

  useEffect(() => {
    const container = containerRef.current
    const engine = Matter.Engine.create()
    engine.gravity.y = 1.0
    const world = engine.world
    engineRef.current = engine
    worldRef.current = world

    const buildWalls = () => {
      const W = container.clientWidth
      const H = container.clientHeight
      wallsRef.current.forEach(w => Matter.World.remove(world, w))
      const walls = [
        Matter.Bodies.rectangle(W / 2, H + 30, W * 3, 60, {
          isStatic: true, label: 'wall',
          collisionFilter: { category: CAT_NORMAL, mask: CAT_NORMAL },
        }),
        Matter.Bodies.rectangle(-30, H / 2, 60, H * 3, {
          isStatic: true, label: 'wall',
          collisionFilter: { category: CAT_NORMAL, mask: CAT_NORMAL },
        }),
        Matter.Bodies.rectangle(W + 30, H / 2, 60, H * 3, {
          isStatic: true, label: 'wall',
          collisionFilter: { category: CAT_NORMAL, mask: CAT_NORMAL },
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

    // Create all bodies (don't add to world yet)
    JOKES.forEach((joke, i) => {
      const cols = Math.max(1, Math.floor(W / (R * 2 + 10)))
      const col = i % cols
      const row = Math.floor(i / cols)
      const x = R + 10 + col * (R * 2 + 10) + (row % 2) * R
      const y = -R * 2
      bodyMap.current[joke.id] = Matter.Bodies.circle(x, y, R, {
        restitution: 0.35,
        friction: 0.05,
        frictionAir: 0.02,
        label: String(joke.id),
        collisionFilter: { category: CAT_NORMAL, mask: CAT_NORMAL },
      })
    })

    // Drop all circles at once, scattered across a tall window above the viewport
    const initialBatch = MOBILE ? JOKES.slice(0, BATCH_SIZE) : JOKES
    initialBatch.forEach((joke) => {
      const body = bodyMap.current[joke.id]
      const rx = R + Math.random() * (W - R * 2)
      const ry = -(R * 2 + Math.random() * H * 1.5)
      Matter.Body.setPosition(body, { x: rx, y: ry })
      Matter.Body.setVelocity(body, { x: (Math.random() - 0.5) * 5, y: 3 + Math.random() * 4 })
      Matter.Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.3)
      Matter.World.add(worldRef.current, body)
      inWorldRef.current.add(joke.id)
      const el = elMap.current[joke.id]
      if (el) { el.style.opacity = '1'; el.style.transform = `translate(${rx - R}px, ${ry - R}px)` }
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

      while (restoreQueueRef.current.length > 0) {
        const id = restoreQueueRef.current.shift()
        const body = bodyMap.current[id]
        const el = elMap.current[id]
        if (body && el) {
          const rx = R + Math.random() * (cW - R * 2)
          const ry = -(R * 2 + Math.random() * cH * 1.5)
          Matter.Body.setPosition(body, { x: rx, y: ry })
          Matter.Body.setVelocity(body, { x: (Math.random() - 0.5) * 5, y: 3 + Math.random() * 4 })
          Matter.Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.3)
          Matter.World.add(worldRef.current, body)
          inWorldRef.current.add(id)
          restoringRef.current.add(id)
          el.style.transform = `translate(${rx - R}px, ${ry - R}px)`
          el.style.opacity = '1'
          handsOffRef.current.delete(id)
          shufflingRef.current.delete(id)
        }
      }

      JOKES.forEach(({ id }) => {
        const body = bodyMap.current[id]
        if (!body || body.isStatic) return
        if (handsOffRef.current.has(id)) return

        const dx = body.position.x - cx
        const dy = body.position.y - cy
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < REPEL_R && dist > 0) {
          const f = REPEL_F * (1 - dist / REPEL_R)
          Matter.Body.applyForce(body, body.position, { x: (dx / dist) * f, y: (dy / dist) * f })
        }

        const el = elMap.current[id]
        if (!el) return
        el.style.transform = `translate(${body.position.x - R}px, ${body.position.y - R}px) rotate(${body.angle}rad)`
        if (restoringRef.current.has(id) && body.position.y > cH * 0.55) {
          restoringRef.current.delete(id)
        }
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

  const popVisible = useCallback((jokesToPop, onDone) => {
    jokesToPop.forEach(({ id }, i) => {
      const tid = setTimeout(() => {
        const body = bodyMap.current[id]
        const el = elMap.current[id]
        if (!body || !el) return
        if (!inWorldRef.current.has(id)) return  // already gone, skip

        // Remove from physics immediately so other bodies fill the space right away
        Matter.World.remove(worldRef.current, body)
        inWorldRef.current.delete(id)

        const tx = body.position.x - R
        const ty = body.position.y - R
        handsOffRef.current.add(id)
        shufflingRef.current.add(id)
        el.style.setProperty('--pop-tx', `${tx}px`)
        el.style.setProperty('--pop-ty', `${ty}px`)
        el.style.animation = 'bubble-pop 0.28s ease-in forwards'
        const ring = document.createElement('div')
        ring.style.cssText = `position:absolute;left:${tx + R}px;top:${ty + R}px;width:${R * 2}px;height:${R * 2}px;border-radius:50%;border:${WIDE ? 3 : 2}px solid rgba(0,0,0,0.25);pointer-events:none;z-index:2;animation:pop-ring-expand 0.32s ease-out forwards;`
        containerRef.current.appendChild(ring)
        setTimeout(() => ring.remove(), 380)
        const innerTid = setTimeout(() => {
          if (!shufflingRef.current.has(id)) return
          el.style.opacity = '0'
          el.style.animation = ''
          el.style.transition = ''
          shufflingRef.current.delete(id)
          handsOffRef.current.delete(id)
        }, 300)
        shuffleTimerIds.current.push(innerTid)
      }, i * POP_STAGGER)
      shuffleTimerIds.current.push(tid)
    })
    if (onDone) {
      const delay = jokesToPop.length > 0 ? 300 : 0
      const tid = setTimeout(onDone, delay)
      shuffleTimerIds.current.push(tid)
    }
  }, [])

  // Circles still above the viewport (y < 0) were never seen — remove silently.
  // Circles already on screen are graduated out of restoringRef so getVisible picks them up
  // and visibleNotInCat gives them a proper pop animation instead of an instant vanish.
  const purgeArrivals = useCallback(() => {
    restoringRef.current.forEach(id => {
      restoringRef.current.delete(id)
      const body = bodyMap.current[id]
      if (!body || !inWorldRef.current.has(id)) return
      if (body.position.y >= 0) return  // visible — let normal pop flow handle it
      Matter.World.remove(worldRef.current, body)
      inWorldRef.current.delete(id)
      const el = elMap.current[id]
      if (el) el.style.opacity = '0'
    })
  }, [])

  const handleRefresh = useCallback(() => {
    setMenuOpen(false)

    ;[...shufflingRef.current].forEach(id => {
      if (id === expandedRef.current) return
      const el = elMap.current[id]
      if (el) { el.style.animation = ''; el.style.transition = ''; el.style.opacity = '0' }
      shufflingRef.current.delete(id)
      handsOffRef.current.delete(id)
    })
    shuffleTimerIds.current.forEach(clearTimeout)
    shuffleTimerIds.current = []
    restoreQueueRef.current = []
    nextRestoreRef.current = 0
    restoreIdxRef.current = 0
    purgeArrivals()

    const cat = activeCategoryRef.current

    const allVisible = JOKES.filter(({ id }) =>
      inWorldRef.current.has(id) && !shufflingRef.current.has(id) && expandedRef.current !== id
    )

    if (cat) {
      // Exit category mode — pop up to 25, then fill screen back to BATCH_SIZE from full mix
      setActiveCategory(null)
      const toPop = allVisible.slice(0, 25)
      const toPopIds = new Set(toPop.map(j => j.id))
      const remainingIds = new Set(allVisible.filter(j => !toPopIds.has(j.id)).map(j => j.id))
      const needed = BATCH_SIZE - remainingIds.size

      popVisible(toPop, () => {
        // Candidates: everything except what's still on screen — shuffle for variety
        const candidates = JOKES
          .filter(j => !remainingIds.has(j.id))
          .sort(() => Math.random() - 0.5)
        restoreIdxRef.current = 0
        candidates.slice(0, needed).forEach(({ id }) => {
          handsOffRef.current.delete(id)
          shufflingRef.current.delete(id)
          restoreQueueRef.current.push(id)
        })
        nextRestoreRef.current = performance.now()
      })
    } else {
      // Normal mode: pop 25 (bottommost first)
      const toPop = [...allVisible]
        .sort((a, b) => bodyMap.current[b.id].position.y - bodyMap.current[a.id].position.y)
        .slice(0, 25)

      popVisible(toPop, () => {
        if (MOBILE) {
          // Mobile: drop next 25 from sequence
          const nextIdx = nextDropIdxRef.current % JOKES.length
          nextDropIdxRef.current = (nextDropIdxRef.current + 25) % JOKES.length
          restoreIdxRef.current = 0
          for (let i = 0; i < 25; i++) {
            const { id } = JOKES[(nextIdx + i) % JOKES.length]
            handsOffRef.current.delete(id)
            shufflingRef.current.delete(id)
            restoreQueueRef.current.push(id)
          }
        } else {
          // Desktop: restore same 25
          toPop.forEach(({ id }) => {
            handsOffRef.current.delete(id)
            shufflingRef.current.delete(id)
            restoreQueueRef.current.push(id)
          })
        }
        nextRestoreRef.current = performance.now()
      })
    }

    // Spin anchor
    const el = anchorSpinnerRef.current
    if (el) {
      el.classList.remove('anchor-spinning')
      void el.offsetWidth
      el.classList.add('anchor-spinning')
      setTimeout(() => el.classList.remove('anchor-spinning'), 1200)
    }
  }, [popVisible, purgeArrivals])

  const handleCategorySelect = useCallback((catId) => {
    setMenuOpen(false)

    ;[...shufflingRef.current].forEach(id => {
      if (id === expandedRef.current) return
      const el = elMap.current[id]
      if (el) { el.style.animation = ''; el.style.transition = ''; el.style.opacity = '0' }
      shufflingRef.current.delete(id)
      handsOffRef.current.delete(id)
    })
    shuffleTimerIds.current.forEach(clearTimeout)
    shuffleTimerIds.current = []
    restoreQueueRef.current = []
    nextRestoreRef.current = 0
    restoreIdxRef.current = 0
    purgeArrivals()

    // If selecting same category again, deselect
    if (activeCategoryRef.current === catId) {
      setActiveCategory(null)
      return
    }

    setActiveCategory(catId)

    const getVisible = (id) =>
      inWorldRef.current.has(id) && !shufflingRef.current.has(id) && expandedRef.current !== id

    const visibleNotInCat = JOKES.filter(({ id, categories }) => getVisible(id) && !categories.includes(catId))
    const catJokes = JOKES.filter(j => j.categories.includes(catId))
    const notVisibleInCat = catJokes.filter(({ id }) => !getVisible(id))

    popVisible(visibleNotInCat, () => {
      restoreIdxRef.current = 0
      notVisibleInCat.forEach(({ id }) => {
        handsOffRef.current.delete(id)
        shufflingRef.current.delete(id)
        restoreQueueRef.current.push(id)
      })
      nextRestoreRef.current = performance.now()
    })
  }, [popVisible, purgeArrivals])

  const collapse = useCallback((id) => {
    const body = bodyMap.current[id]
    const el = elMap.current[id]
    if (!el) return

    const W = containerRef.current.clientWidth

    handsOffRef.current.add(id)
    setScrimVisible(false)
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
      el.style.boxShadow = 'none'
      el.style.left = '0'
      el.style.top = '0'
      el.style.transition = ''
      el.style.transform = `translate(${randomX - R}px, ${-R * 2}px)`

      if (body) {
        // Re-add to world (expand removed it)
        Matter.World.add(worldRef.current, body)
        inWorldRef.current.add(id)
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
    inWorldRef.current.delete(id)

    // Switch from transform-based positioning to left/top so CSS transition can animate
    el.style.transform = 'none'
    el.style.left = `${startX}px`
    el.style.top = `${startY}px`
    void el.offsetWidth // force reflow so browser registers starting position

    const expW = Math.min(EXP_W, W - 32)
    el.style.transition = `left ${TRANSITION}ms ease, top ${TRANSITION}ms ease, width ${TRANSITION}ms ease, height ${TRANSITION}ms ease, border-radius ${TRANSITION}ms ease`
    el.style.width = `${expW}px`
    el.style.height = `${EXP_H}px`
    el.style.borderRadius = '24px'
    el.style.left = `${W / 2 - expW / 2}px`
    el.style.top = `${H / 2 - EXP_H / 2}px`
    el.style.zIndex = '10'

    setExpandedId(id)
    setScrimVisible(true)
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

    if (menuOpenRef.current) {
      setMenuOpen(false)
      return
    }

    const bodies = Matter.Query.point(Matter.Composite.allBodies(worldRef.current), { x, y })
    const jokeBody = bodies.find(b => {
      const id = Number(b.label)
      return !isNaN(id) && b.label !== 'wall' && !shufflingRef.current.has(id)
    })
    if (jokeBody) handleTap(Number(jokeBody.label))
  }, [collapse, handleTap])

  const handleMouseMove = useCallback((e) => {
    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    cursorRef.current = { x, y }
    const W = containerRef.current.clientWidth
    const H = containerRef.current.clientHeight
    const dx = x - W / 2
    const dy = y - H / 2
    containerRef.current.style.cursor = Math.sqrt(dx * dx + dy * dy) <= R ? 'pointer' : ''
  }, [])

  const handleTouchMove = useCallback((e) => {
    const rect = containerRef.current.getBoundingClientRect()
    const t = e.touches[0]
    cursorRef.current = { x: t.clientX - rect.left, y: t.clientY - rect.top }
  }, [])

  return (
    <div
      ref={containerRef}
      style={{ position: 'relative', width: '100vw', height: '100dvh', background: '#fefdf9', overflow: 'hidden' }}
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
              background: PASTEL(joke.id),
              boxShadow: 'none',
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
              top: isExpanded ? 20 : '50%',
              left: '50%',
              transform: isExpanded ? 'translateX(-50%)' : 'translate(-50%, -50%)',
              fontSize: isExpanded ? 68 : R * 1.05,
              lineHeight: 1,
              transition: 'font-size 0.3s ease, top 0.3s ease, transform 0.3s ease',
              filter: isExpanded ? 'drop-shadow(0 3px 6px rgba(0,0,0,0.18))' : 'none',
              pointerEvents: 'none',
              zIndex: 2,
            }}>
              {joke.emoji}
            </span>

            {/* Setup + punchline — present in DOM when expanded, fade in sequentially */}
            {isExpanded && (
              <div style={{
                position: 'absolute',
                zIndex: 2,
                top: WIDE ? 100 : 110,
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

      {/* Radial category items — emerge from behind anchor, positions 1–5 */}
      {CATEGORIES.map((cat, i) => {
        const { dx, dy } = MENU_POS[i + 1]
        const isActive = activeCategory === cat.id
        const staggerPos = menuStaggerPos(cat.id, activeCategory)
        const delay = staggerPos * 40
        return (
          <div
            key={cat.id}
            onClick={(e) => {
              e.stopPropagation()
              if (menuOpenRef.current) {
                handleCategorySelect(cat.id)
              } else if (isActive) {
                setMenuOpen(true)
                menuOpenRef.current = true
              }
            }}
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: R * 2,
              height: R * 2,
              borderRadius: '50%',
              background: cat.color,
              cursor: 'pointer',
              transform: menuOpen
                ? `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`
                : 'translate(-50%, -50%)',
              pointerEvents: menuOpen ? 'all' : (isActive ? 'all' : 'none'),
              transition: menuOpen
                ? `transform 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, filter 0.15s ease`
                : 'transform 0.25s cubic-bezier(0.4, 0, 1, 1), filter 0.15s ease',
              zIndex: menuOpen ? 12 - staggerPos : (isActive ? 4 : 2),
              userSelect: 'none',
              WebkitUserSelect: 'none',
            }}
            className="menu-circle"
          >
            <svg width={R * 2} height={R * 2} viewBox={`0 0 ${R * 2} ${R * 2}`} style={{ position: 'absolute', top: 0, left: 0 }}>
              <defs>
                <path id={`menu-path-${cat.id}`} d={`M ${R * 0.394},${R * 0.65} A ${R * 0.7},${R * 0.7} 0 1 0 ${R * 1.606},${R * 0.65}`}/>
              </defs>
              <text fill="white" fontSize={R * 0.44} fontFamily="'DynaPuff', cursive" fontWeight="700" letterSpacing={R * 0.1}>
                <textPath href={`#menu-path-${cat.id}`} startOffset="50%" textAnchor="middle">{cat.label}</textPath>
              </text>
            </svg>
          </div>
        )
      })}

      {/* Close button — always at centre, revealed as anchor moves away */}
      <div
        onClick={(e) => { e.stopPropagation(); setMenuOpen(false) }}
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: R * 2,
          height: R * 2,
          borderRadius: '50%',
          background: '#666',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          pointerEvents: menuOpen ? 'all' : 'none',
          transition: 'filter 0.15s ease',
          zIndex: menuOpen ? 6 : 1,  // always bottom of stack
          userSelect: 'none',
          WebkitUserSelect: 'none',
        }}
        className="menu-circle"
      >
        <span style={{ color: 'white', fontSize: R * 0.55, lineHeight: 1, fontFamily: 'system-ui, sans-serif', fontWeight: 300 }}>✕</span>
      </div>

      {/* Anchor — always EMOJOKES/black; sits behind active category when one is selected */}
      <div
        onClick={(e) => { e.stopPropagation(); menuOpenRef.current ? handleRefresh() : setMenuOpen(true) }}
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: menuOpen
            ? `translate(calc(-50% + ${MENU_POS[0].dx}px), calc(-50% + ${MENU_POS[0].dy}px))`
            : 'translate(-50%, -50%)',
          transition: menuOpen
            ? `transform 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${menuStaggerPos('emojokes', activeCategory) * 40}ms`
            : 'transform 0.25s cubic-bezier(0.4, 0, 1, 1)',
          zIndex: menuOpen ? 12 - menuStaggerPos('emojokes', activeCategory) : 3,
          pointerEvents: 'all',
          cursor: 'pointer',
        }}
      >
        <div
          ref={anchorSpinnerRef}
          className="anchor-idle menu-circle"
          style={{ width: R * 2, height: R * 2, borderRadius: '50%', background: '#111', position: 'relative', transition: 'filter 0.15s ease' }}
        >
          <svg
            width={R * 2}
            height={R * 2}
            viewBox={`0 0 ${R * 2} ${R * 2}`}
            style={{ position: 'absolute', top: 0, left: 0 }}
          >
            <defs>
              <path id="emojokes-smile" d={`M ${R * 0.394},${R * 0.65} A ${R * 0.7},${R * 0.7} 0 1 0 ${R * 1.606},${R * 0.65}`}/>
            </defs>
            <text fill="white" fontSize={R * 0.44} fontFamily="'DynaPuff', cursive" fontWeight="700" letterSpacing={R * 0.1}>
              <textPath href="#emojokes-smile" startOffset="50%" textAnchor="middle">EMOJOKES</textPath>
            </text>
          </svg>
        </div>
      </div>

      <div
        style={{
          position: 'absolute', inset: 0,
          background: 'rgba(255,255,255,0.6)',
          opacity: (scrimVisible || menuOpen) ? 1 : 0,
          backdropFilter: (scrimVisible || menuOpen) ? 'blur(6px)' : 'blur(0px)',
          WebkitBackdropFilter: (scrimVisible || menuOpen) ? 'blur(6px)' : 'blur(0px)',
          transition: 'opacity 0.3s ease, backdrop-filter 0.3s ease, -webkit-backdrop-filter 0.3s ease',
          pointerEvents: expandedId !== null ? 'all' : 'none',
          zIndex: 5,
        }}
      />
    </div>
  )
}
