import { useEffect, useRef } from 'react'
import { images } from '../data/images'
import './PintGlass.css'

export default function PintGlass({ onPhotoClick }) {
  const layerRef    = useRef(null)
  const fgLayerRef  = useRef(null)
  const rafRef      = useRef(null)
  const nextPhotoAt = useRef(0)
  const nextPlainAt = useRef(0)
  const nextClusterAt = useRef(0)
  const onClickRef  = useRef(onPhotoClick)
  useEffect(() => { onClickRef.current = onPhotoClick }, [onPhotoClick])

  useEffect(() => {
    const el   = layerRef.current
    const fgEl = fgLayerRef.current

    function spawnPhoto(seeded = false) {
      const img   = images[Math.floor(Math.random() * images.length)]
      const size  = 40 + Math.random() * 60
      const dur   = 12 + Math.random() * 10
      const x     = 5  + Math.random() * 90
      const drift = (Math.random() - 0.5) * 80
      const delay = seeded ? -(Math.random() * dur * 0.88) : 0

      const b = document.createElement('div')
      b.className = 'bubble bubble--photo'
      b.style.cssText = `width:${size}px;height:${size}px;left:${x}%;animation-duration:${dur}s;animation-delay:${delay}s;--drift:${drift}px`
      b.style.setProperty('--photo-url', `url('photos/${img.src}')`)

      // ── hover: CSS individual scale/rotate properties compose with keyframe transform ──
      b.addEventListener('mouseenter', () => {
        b.style.transition = ''   // fall back to CSS transition (spring easing)
        b.style.scale  = '1.1'
        b.style.filter = 'brightness(1.08)'
      })
      b.addEventListener('mousemove', (e) => {
        const r  = b.getBoundingClientRect()
        const rx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2)  // –1..1
        // fast tracking during move, spring handled by CSS on exit
        b.style.transition = 'scale 0.06s ease-out, rotate 0.08s ease-out'
        b.style.scale  = '1.1'
        b.style.rotate = `${rx * 6}deg`
      })
      b.addEventListener('mouseleave', () => {
        b.style.transition = ''   // CSS spring easing snaps it back
        b.style.scale  = ''
        b.style.rotate = ''
        b.style.filter = ''
      })

      b.addEventListener('click', () => {
        const rect = b.getBoundingClientRect()
        onClickRef.current(`photos/${img.src}`, rect)
      }, { once: true })
      b.addEventListener('animationend', () => { b.remove(); photoCount-- }, { once: true })
      el.appendChild(b)
      photoCount++
    }

    function spawnPlain(seeded = false) {
      const size  = 7 + Math.random() * 24
      const dur   = 5  + Math.random() * 8
      const x     = 2  + Math.random() * 96
      const drift = (Math.random() - 0.5) * 50
      const delay = seeded ? -(Math.random() * dur * 0.88) : 0

      const b = document.createElement('div')
      b.className = 'bubble bubble--plain'
      b.style.cssText = `width:${size}px;height:${size}px;left:${x}%;animation-duration:${dur}s;animation-delay:${delay}s;--drift:${drift}px`
      b.addEventListener('animationend', () => b.remove(), { once: true })
      el.appendChild(b)
    }

    function spawnCluster(seeded = false) {
      const cx    = 4 + Math.random() * 92
      const count = 12 + Math.floor(Math.random() * 14)  // 12–26

      for (let i = 0; i < count; i++) {
        // biased toward small — most are tiny, occasional bigger ones
        const size  = 1.5 + Math.random() ** 1.8 * 5.5  // 1.5–7px
        const dur   = 1.0 + Math.random() * 2.8          // 1–3.8s (fast)
        // wider organic spread, not just a tight column
        const x     = cx + (Math.random() - 0.5) * 22
        // 70% nearly straight, 30% wider wanders
        const drift = (Math.random() - 0.5) * (Math.random() < 0.3 ? 55 : 14)
        const delay = seeded
          ? -(Math.random() * dur * 0.9)
          : (Math.random() * 0.55)   // stagger up to 550ms within cluster

        // per-bubble randomised highlight so no two look identical
        const hx  = 22 + Math.random() * 44   // 22–66%
        const hy  = 15 + Math.random() * 38   // 15–53%
        const hop = 0.4 + Math.random() * 0.5 // highlight opacity 0.4–0.9
        const ba  = 0.02 + Math.random() * 0.07  // base alpha very light

        const b = document.createElement('div')
        b.className = 'bubble bubble--micro'
        b.style.cssText = `width:${size}px;height:${size}px;left:${x}%;animation-duration:${dur}s;animation-delay:${delay}s;--drift:${drift}px`
        b.style.setProperty('--hx',  `${hx}%`)
        b.style.setProperty('--hy',  `${hy}%`)
        b.style.setProperty('--hop', hop)
        b.style.setProperty('--ba',  ba)
        b.addEventListener('animationend', () => b.remove(), { once: true })
        fgEl.appendChild(b)
      }
    }

    // Pre-fill
    let photoCount = 0
    for (let i = 0; i < 16; i++) spawnPhoto(true)
    for (let i = 0; i < 14; i++) spawnPlain(true)
    for (let i = 0; i < 8;  i++) spawnCluster(true)

    function tick(t) {
      // enforce a floor so photos are always visible
      if (photoCount < 6 || t >= nextPhotoAt.current) {
        spawnPhoto()
        nextPhotoAt.current = t + (photoCount < 6 ? 600 : 1200 + Math.random() * 1400)
      }
      if (t >= nextPlainAt.current) {
        spawnPlain()
        nextPlainAt.current = t + 350 + Math.random() * 750
      }
      if (t >= nextClusterAt.current) {
        spawnCluster()
        nextClusterAt.current = t + 250 + Math.random() * 450
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  return (
    <div className="scene">
      <div className="bubble-layer" ref={layerRef} />
      <div className="fg-layer"     ref={fgLayerRef} />
    </div>
  )
}
