import { useEffect, useRef } from 'react'
import Matter from 'matter-js'
import { images } from '../data/images.js'

// Polaroid dimensions based on current viewport width
function getSizes() {
  const vw = window.innerWidth
  const photoW = Math.round(Math.max(80, Math.min(160, vw * 0.14)))
  const photoH = photoW
  const border = Math.round(photoW * 0.06)
  const bottomLabel = Math.round(photoW * 0.22)
  return {
    photoW, photoH, border, bottomLabel,
    bodyW: photoW + border * 2,
    bodyH: photoH + border + bottomLabel,
  }
}

// Drop interval: 200ms at 1400px+, 600ms at 400px, linear in between
function getInterval() {
  const vw = window.innerWidth
  return Math.round(600 - (vw - 400) / 1000 * 400)
}

export default function Home() {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const { Engine, Runner, Bodies, Body, World, Composite, Mouse, MouseConstraint } = Matter

    const engine = Engine.create({ gravity: { y: 2 } })
    const runner = Runner.create()

    const CAT_WALL = 0x0001
    const CAT_LAYER = [0x0002, 0x0004, 0x0008]

    // Keep refs to floor/wall bodies so we can reposition on resize
    const floors = []
    const leftWalls = []
    const rightWalls = []

    CAT_LAYER.forEach(cat => {
      const floor = Bodies.rectangle(
        window.innerWidth / 2, window.innerHeight + 25, window.innerWidth * 4, 50,
        { isStatic: true, collisionFilter: { category: CAT_WALL, mask: cat } }
      )
      const leftWall = Bodies.rectangle(
        -25, window.innerHeight / 2, 50, window.innerHeight * 3,
        { isStatic: true, collisionFilter: { category: CAT_WALL, mask: cat } }
      )
      const rightWall = Bodies.rectangle(
        window.innerWidth + 25, window.innerHeight / 2, 50, window.innerHeight * 3,
        { isStatic: true, collisionFilter: { category: CAT_WALL, mask: cat } }
      )
      floors.push(floor)
      leftWalls.push(leftWall)
      rightWalls.push(rightWall)
      World.add(engine.world, [floor, leftWall, rightWall])
    })

    Runner.run(runner, engine)

    // Mouse / touch drag
    const mouse = Mouse.create(container)
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse,
      constraint: { stiffness: 0.2, render: { visible: false } },
    })
    World.add(engine.world, mouseConstraint)

    const pairs = []
    const BASE = import.meta.env.BASE_URL
    const LAYERS = [10, 20, 30]
    let spawnCount = 0

    const spawnPhoto = (src, x) => {
      const { photoW, photoH, border, bottomLabel, bodyW, bodyH } = getSizes()
      const layerIdx = spawnCount % LAYERS.length
      const zIndex = LAYERS[layerIdx]
      const cat = CAT_LAYER[layerIdx]
      spawnCount++

      const body = Bodies.rectangle(x, -bodyH, bodyW, bodyH, {
        restitution: 0.05,
        friction: 0.8,
        frictionStatic: 0.9,
        frictionAir: 0.015,
        angle: (Math.random() - 0.5) * 0.5,
        collisionFilter: { category: cat, mask: CAT_WALL | cat },
      })
      Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.08)

      const wrapper = document.createElement('div')
      wrapper.style.cssText = `
        position: fixed;
        top: 0; left: 0;
        width: ${bodyW}px;
        height: ${bodyH}px;
        background: #fff;
        padding: ${border}px ${border}px ${bottomLabel}px ${border}px;
        box-sizing: border-box;
        box-shadow: 2px 4px 18px rgba(0,0,0,0.28);
        user-select: none;
        will-change: transform;
        z-index: ${zIndex};
        transition: opacity 1s ease;
      `
      const pair = { body, el: wrapper, bodyW, bodyH }

      setTimeout(() => {
        wrapper.style.opacity = '0'
        setTimeout(() => {
          wrapper.remove()
          World.remove(engine.world, body)
          const i = pairs.indexOf(pair)
          if (i !== -1) pairs.splice(i, 1)
        }, 1000)
      }, 10000)

      const img = document.createElement('img')
      img.src = `${BASE}photos/${src}`
      img.draggable = false
      img.style.cssText = `width: 100%; height: 100%; object-fit: cover; display: block;`
      wrapper.appendChild(img)
      container.appendChild(wrapper)

      World.add(engine.world, body)
      pairs.push(pair)
    }

    // Update floor/wall positions on resize
    const onResize = () => {
      const W = window.innerWidth
      const H = window.innerHeight
      floors.forEach(f => Body.setPosition(f, { x: W / 2, y: H + 25 }))
      leftWalls.forEach(w => Body.setPosition(w, { x: -25, y: H / 2 }))
      rightWalls.forEach(w => Body.setPosition(w, { x: W + 25, y: H / 2 }))
    }
    window.addEventListener('resize', onResize)

    // Shuffle once, loop infinitely
    const shuffled = [...images].sort(() => Math.random() - 0.5)
    let idx = 0
    const ENTRY_POINTS = [0.2, 0.4, 0.6, 0.8]
    let entryIdx = 0
    let timeoutId

    const scheduleNext = () => {
      timeoutId = setTimeout(() => {
        const x = ENTRY_POINTS[entryIdx % ENTRY_POINTS.length] * window.innerWidth
        entryIdx++
        spawnPhoto(shuffled[idx % shuffled.length].src, x)
        idx++
        scheduleNext()
      }, Math.max(200, getInterval()))
    }
    scheduleNext()

    // Click / tap to drop (but not when dragging a card)
    const onPointer = (e) => {
      if (mouseConstraint.body) return
      const clientX = e.touches ? e.touches[0].clientX : e.clientX
      const { bodyW } = getSizes()
      const x = Math.max(bodyW / 2, Math.min(window.innerWidth - bodyW / 2, clientX))
      const src = shuffled[Math.floor(Math.random() * shuffled.length)].src
      spawnPhoto(src, x)
    }
    window.addEventListener('click', onPointer)
    window.addEventListener('touchstart', onPointer, { passive: true })

    // Animation loop
    let rafId
    const loop = () => {
      pairs.forEach(({ body, el, bodyW, bodyH }) => {
        const { x, y } = body.position
        el.style.transform = `translate(${x - bodyW / 2}px, ${y - bodyH / 2}px) rotate(${body.angle}rad)`
      })
      rafId = requestAnimationFrame(loop)
    }
    loop()

    return () => {
      clearTimeout(timeoutId)
      cancelAnimationFrame(rafId)
      window.removeEventListener('click', onPointer)
      window.removeEventListener('touchstart', onPointer)
      window.removeEventListener('resize', onResize)
      Runner.stop(runner)
      pairs.forEach(({ el }) => el.remove())
    }
  }, [])

  return (
    <div
      ref={containerRef}
      style={{
        width: '100vw', height: '100vh',
        overflow: 'hidden', background: '#f0ece4',
        position: 'fixed', inset: 0,
      }}
    >
      {!images.length && (
        <div style={{
          position: 'fixed', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'sans-serif', color: '#999', fontSize: '1rem',
          pointerEvents: 'none',
        }}>
          Add photos to public/photos/ and list them in src/data/images.js
        </div>
      )}
    </div>
  )
}
