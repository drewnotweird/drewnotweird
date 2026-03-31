import { useEffect, useRef, useState } from 'react'
import Matter from 'matter-js'
import { images } from '../data/images.js'

const BATCH = 60

function getSizes() {
  const vw = window.innerWidth
  const photoW = Math.round(Math.max(80, Math.min(160, vw * 0.14)))
  const photoH = photoW
  const border = Math.round(photoW * 0.06)
  const bottomLabel = Math.round(photoW * 0.22)
  return { photoW, photoH, border, bottomLabel, bodyW: photoW + border * 2, bodyH: photoH + border + bottomLabel }
}

function getInterval() {
  const vw = window.innerWidth
  return Math.round(900 - (vw - 400) / 1000 * 500)
}

// Preload a list of image srcs, returns a promise that resolves when all are done
function preloadBatch(srcs, base) {
  return Promise.all(srcs.map(src => new Promise(resolve => {
    const img = new Image()
    img.onload = resolve
    img.onerror = resolve
    img.src = `${base}photos/${src}`
  })))
}

export default function Home() {
  const containerRef = useRef(null)
  const [ready, setReady] = useState(false)

  const BASE = import.meta.env.BASE_URL
  const shuffledRef = useRef([...images].sort(() => Math.random() - 0.5))
  const readySrcsRef = useRef([])

  useEffect(() => {
    const all = shuffledRef.current.map(i => i.src)
    const firstBatch = all.slice(0, BATCH)
    preloadBatch(firstBatch, BASE).then(() => {
      readySrcsRef.current = firstBatch
      setReady(true)
      // Load remaining images in batches; add each batch to the pool when ready
      const remaining = all.slice(BATCH)
      for (let i = 0; i < remaining.length; i += BATCH) {
        const batch = remaining.slice(i, i + BATCH)
        preloadBatch(batch, BASE).then(() => {
          readySrcsRef.current = [...readySrcsRef.current, ...batch]
        })
      }
    })
  }, [])

  useEffect(() => {
    if (!ready) return
    const container = containerRef.current
    if (!container) return

    const { Engine, Runner, Bodies, Body, World, Mouse, MouseConstraint } = Matter

    const engine = Engine.create({ gravity: { y: 0.7 } })
    const runner = Runner.create()

    const CAT_WALL = 0x0001
    const CAT_LAYER = [0x0002, 0x0004, 0x0008]

    const floors = [], leftWalls = [], rightWalls = []
    CAT_LAYER.forEach(cat => {
      const floor = Bodies.rectangle(window.innerWidth / 2, window.innerHeight + 25, window.innerWidth * 4, 50, { isStatic: true, collisionFilter: { category: CAT_WALL, mask: cat } })
      const leftWall = Bodies.rectangle(-25, window.innerHeight / 2, 50, window.innerHeight * 3, { isStatic: true, collisionFilter: { category: CAT_WALL, mask: cat } })
      const rightWall = Bodies.rectangle(window.innerWidth + 25, window.innerHeight / 2, 50, window.innerHeight * 3, { isStatic: true, collisionFilter: { category: CAT_WALL, mask: cat } })
      floors.push(floor); leftWalls.push(leftWall); rightWalls.push(rightWall)
      World.add(engine.world, [floor, leftWall, rightWall])
    })

    Runner.run(runner, engine)

    const mouse = Mouse.create(container)
    const mouseConstraint = MouseConstraint.create(engine, { mouse, constraint: { stiffness: 0.2, render: { visible: false } } })
    World.add(engine.world, mouseConstraint)

    const pairs = []
    const LAYERS = [10, 20, 30]
    let spawnCount = 0

    Matter.Events.on(mouseConstraint, 'mousedown', () => {
      const pos = mouse.position
      const hits = Matter.Query.point(pairs.map(p => p.body), pos)
      if (hits.length < 2) return
      const top = hits.reduce((best, b) => {
        const bZ = pairs.find(p => p.body === b)?.zIndex ?? 0
        const bestZ = pairs.find(p => p.body === best)?.zIndex ?? 0
        return bZ > bestZ ? b : best
      })
      if (top !== mouseConstraint.body) {
        mouseConstraint.body = top
        mouseConstraint.constraint.bodyB = top
        mouseConstraint.constraint.pointB = { x: pos.x - top.position.x, y: pos.y - top.position.y }
      }
    })

    const spawnPhoto = (src, x) => {
      const { border, bottomLabel, bodyW, bodyH } = getSizes()
      const layerIdx = spawnCount % LAYERS.length
      const zIndex = LAYERS[layerIdx]
      const cat = CAT_LAYER[layerIdx]
      spawnCount++

      const body = Bodies.rectangle(x, -bodyH, bodyW, bodyH, {
        restitution: 0.05, friction: 0.8, frictionStatic: 0.9, frictionAir: 0.015,
        angle: (Math.random() - 0.5) * 0.5,
        collisionFilter: { category: cat, mask: CAT_WALL | cat },
      })
      Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.08)

      const wrapper = document.createElement('div')
      wrapper.style.cssText = `
        position: fixed; top: 0; left: 0;
        width: ${bodyW}px; height: ${bodyH}px;
        background: #fff;
        padding: ${border}px ${border}px ${bottomLabel}px ${border}px;
        box-sizing: border-box;
        box-shadow: 2px 4px 18px rgba(0,0,0,0.28);
        user-select: none; will-change: transform;
        z-index: ${zIndex}; transition: opacity 1s ease;
      `
      const img = document.createElement('img')
      img.src = `${BASE}photos/${src}`
      img.draggable = false
      img.style.cssText = `width: 100%; height: 100%; object-fit: cover; display: block;`
      wrapper.appendChild(img)
      container.appendChild(wrapper)

      const pair = { body, el: wrapper, bodyW, bodyH, zIndex }
      setTimeout(() => {
        wrapper.style.opacity = '0'
        setTimeout(() => {
          wrapper.remove()
          World.remove(engine.world, body)
          const i = pairs.indexOf(pair)
          if (i !== -1) pairs.splice(i, 1)
        }, 1000)
      }, 10000)

      World.add(engine.world, body)
      pairs.push(pair)
    }

    const onResize = () => {
      const W = window.innerWidth, H = window.innerHeight
      floors.forEach(f => Body.setPosition(f, { x: W / 2, y: H + 25 }))
      leftWalls.forEach(w => Body.setPosition(w, { x: -25, y: H / 2 }))
      rightWalls.forEach(w => Body.setPosition(w, { x: W + 25, y: H / 2 }))
    }
    window.addEventListener('resize', onResize)

    let idx = 0
    const ENTRY_POINTS = [0.2, 0.4, 0.6, 0.8]
    let entryIdx = 0
    let timeoutId

    const scheduleNext = () => {
      timeoutId = setTimeout(() => {
        const ready = readySrcsRef.current
        if (ready.length > 0) {
          const x = ENTRY_POINTS[entryIdx % ENTRY_POINTS.length] * window.innerWidth
          entryIdx++
          spawnPhoto(ready[idx % ready.length], x)
          idx++
        }
        scheduleNext()
      }, Math.max(400, getInterval()))
    }
    scheduleNext()

    const onPointer = (e) => {
      if (mouseConstraint.body) return
      const clientX = e.touches ? e.touches[0].clientX : e.clientX
      const { bodyW } = getSizes()
      const x = Math.max(bodyW / 2, Math.min(window.innerWidth - bodyW / 2, clientX))
      const ready = readySrcsRef.current
      if (ready.length > 0) spawnPhoto(ready[Math.floor(Math.random() * ready.length)], x)
    }
    window.addEventListener('click', onPointer)
    window.addEventListener('touchstart', onPointer, { passive: true })

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
  }, [ready])

  return (
    <div
      ref={containerRef}
      style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: '#ffc72c', position: 'fixed', inset: 0 }}
    >
      <div style={{
        position: 'fixed', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        pointerEvents: 'none', zIndex: 1,
      }}>
        <h1 style={{
          fontFamily: 'var(--font-primary)',
          color: 'var(--color-primary)',
          fontSize: 'clamp(3rem, 12vw, 10rem)',
          fontWeight: 700,
          margin: 0,
          letterSpacing: '0.05em',
          textAlign: 'center',
          lineHeight: 1,
          WebkitTextStroke: '6px white',
          paintOrder: 'stroke fill',
          animation: ready ? 'none' : 'throb 1.8s ease-in-out infinite',
        }}>
          BIG JUICY
        </h1>
      </div>

      <style>{`
        @keyframes throb {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }
      `}</style>
    </div>
  )
}
