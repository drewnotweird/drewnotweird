import { useEffect, useRef } from 'react'
import Matter from 'matter-js'
import { images } from '../data/images.js'

// Polaroid dimensions
const PHOTO_W = 160
const PHOTO_H = 160
const BORDER = 10
const BOTTOM_LABEL = 36
const BODY_W = PHOTO_W + BORDER * 2
const BODY_H = PHOTO_H + BORDER + BOTTOM_LABEL

export default function Home() {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const { Engine, Runner, Bodies, Body, World } = Matter
    const W = window.innerWidth
    const H = window.innerHeight

    const engine = Engine.create({ gravity: { y: 2 } })
    const runner = Runner.create()

    // Static walls + floor
    World.add(engine.world, [
      Bodies.rectangle(W / 2, H + 25, W * 2, 50, { isStatic: true }),
      Bodies.rectangle(-25,   H / 2, 50, H * 3,  { isStatic: true }),
      Bodies.rectangle(W + 25, H / 2, 50, H * 3, { isStatic: true }),
    ])

    Runner.run(runner, engine)

    const pairs = []
    const BASE = import.meta.env.BASE_URL

    const spawnPhoto = (src, x) => {
      const body = Bodies.rectangle(x, -BODY_H, BODY_W, BODY_H, {
        restitution: 0.05,
        friction: 0.8,
        frictionStatic: 0.9,
        frictionAir: 0.015,
        angle: (Math.random() - 0.5) * 0.5,
      })
      Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.08)

      // Polaroid wrapper
      const wrapper = document.createElement('div')
      wrapper.style.cssText = `
        position: fixed;
        top: 0; left: 0;
        width: ${BODY_W}px;
        height: ${BODY_H}px;
        background: #fff;
        padding: ${BORDER}px ${BORDER}px ${BOTTOM_LABEL}px ${BORDER}px;
        box-sizing: border-box;
        box-shadow: 2px 4px 18px rgba(0,0,0,0.28);
        pointer-events: none;
        user-select: none;
        will-change: transform;
        z-index: ${(pairs.length % 16) + 1};
        transition: opacity 1s ease;
      `

      // Fade out and remove after 10s
      const pair = { body, el: wrapper }
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
      img.style.cssText = `
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      `
      wrapper.appendChild(img)
      container.appendChild(wrapper)

      World.add(engine.world, body)
      pairs.push(pair)
    }

    // Shuffle once and auto-drop them all
    const shuffled = [...images].sort(() => Math.random() - 0.5)
    let idx = 0

    const autoTimer = setInterval(() => {
      if (idx >= shuffled.length) { clearInterval(autoTimer); return }
      const x = BODY_W / 2 + Math.random() * (W - BODY_W)
      spawnPhoto(shuffled[idx++].src, x)
    }, 350)

    // Click / tap to drop a random one
    const onPointer = (e) => {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX
      const x = Math.max(BODY_W / 2, Math.min(W - BODY_W / 2, clientX))
      const src = shuffled[Math.floor(Math.random() * shuffled.length)].src
      spawnPhoto(src, x)
    }
    window.addEventListener('click', onPointer)
    window.addEventListener('touchstart', onPointer, { passive: true })

    // Animation loop: sync DOM → physics
    let rafId
    const loop = () => {
      pairs.forEach(({ body, el }) => {
        const { x, y } = body.position
        el.style.transform = `translate(${x - BODY_W / 2}px, ${y - BODY_H / 2}px) rotate(${body.angle}rad)`
      })
      rafId = requestAnimationFrame(loop)
    }
    loop()

    return () => {
      clearInterval(autoTimer)
      cancelAnimationFrame(rafId)
      window.removeEventListener('click', onPointer)
      window.removeEventListener('touchstart', onPointer)
      Runner.stop(runner)
      pairs.forEach(({ el }) => el.remove())
    }
  }, [])

  return (
    <div
      ref={containerRef}
      style={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        background: '#f0ece4',
        position: 'fixed',
        inset: 0,
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
