import { useEffect, useRef } from 'react'
import { images } from '../data/images'
import './PintGlass.css'

export default function PintGlass({ onPhotoClick }) {
  const layerRef    = useRef(null)
  const fgLayerRef  = useRef(null)
  const foamRef     = useRef(null)
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
      const imgIndex = Math.floor(Math.random() * images.length)
      const img      = images[imgIndex]
      const size     = 40 + Math.random() * 60
      const dur      = 12 + Math.random() * 10
      const x        = 5  + Math.random() * 90
      const drift    = (Math.random() - 0.5) * 80
      const delay    = seeded ? -(Math.random() * dur * 0.88) : 0
      const wobbleDur = 2.5 + Math.random() * 2.5
      const swayDur   = 2.5 + Math.random() * 3.5
      const swayAmp   = 6   + Math.random() * 12
      // depth-of-field: smaller bubbles appear slightly out of focus
      const blurPx    = Math.max(0, (75 - size) / 60 * 0.7)
      const baseFilter = blurPx > 0.05 ? `blur(${blurPx.toFixed(2)}px)` : ''

      const b = document.createElement('div')
      b.className = 'bubble bubble--photo'
      b.style.cssText = `width:${size}px;height:${size}px;left:${x}%;animation-duration:${dur}s,${wobbleDur}s,${swayDur}s;animation-delay:${delay}s,0s,0s;--drift:${drift}px;--sway-amp:${swayAmp}px`
      b.style.setProperty('--photo-url', `url('${import.meta.env.BASE_URL}photos/${img.src}')`)
      if (baseFilter) b.style.filter = baseFilter

      b.addEventListener('mouseenter', () => {
        b.style.transition = ''
        b.style.scale  = '1.1'
        b.style.filter = baseFilter ? `${baseFilter} brightness(1.08)` : 'brightness(1.08)'
      })
      b.addEventListener('mousemove', (e) => {
        const r  = b.getBoundingClientRect()
        const rx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2)
        b.style.transition = 'scale 0.06s ease-out, rotate 0.08s ease-out'
        b.style.scale  = '1.1'
        b.style.rotate = `${rx * 6}deg`
      })
      b.addEventListener('mouseleave', () => {
        b.style.transition = ''
        b.style.scale  = ''
        b.style.rotate = ''
        b.style.filter = baseFilter
      })

      b.addEventListener('click', () => {
        const rect = b.getBoundingClientRect()
        onClickRef.current(imgIndex, rect)
      }, { once: true })
      b.addEventListener('animationend', (e) => {
        if (e.animationName === 'rise') { b.remove(); photoCount-- }
      })
      el.appendChild(b)
      photoCount++
    }

    function spawnPlain(seeded = false) {
      const size     = 7 + Math.random() * 24
      const dur      = 5  + Math.random() * 8
      const x        = 2  + Math.random() * 96
      const drift    = (Math.random() - 0.5) * 50
      const delay    = seeded ? -(Math.random() * dur * 0.88) : 0
      const wobbleDur = 1.5 + Math.random() * 2
      const swayDur   = 1.5 + Math.random() * 2.5
      const swayAmp   = 3   + Math.random() * 8

      const b = document.createElement('div')
      b.className = 'bubble bubble--plain'
      b.style.cssText = `width:${size}px;height:${size}px;left:${x}%;animation-duration:${dur}s,${wobbleDur}s,${swayDur}s;animation-delay:${delay}s,0s,0s;--drift:${drift}px;--sway-amp:${swayAmp}px`
      b.addEventListener('animationend', (e) => { if (e.animationName === 'rise') b.remove() })
      el.appendChild(b)
    }

    function spawnCluster(seeded = false) {
      const cx    = 4 + Math.random() * 92
      const count = 12 + Math.floor(Math.random() * 14)

      for (let i = 0; i < count; i++) {
        const size  = 1.5 + Math.random() ** 1.8 * 5.5
        const dur   = 1.0 + Math.random() * 2.8
        const x     = cx + (Math.random() - 0.5) * 22
        const drift = (Math.random() - 0.5) * (Math.random() < 0.3 ? 55 : 14)
        const delay = seeded
          ? -(Math.random() * dur * 0.9)
          : (Math.random() * 0.55)

        const hx  = 22 + Math.random() * 44
        const hy  = 15 + Math.random() * 38
        const hop = 0.4 + Math.random() * 0.5
        const ba  = 0.02 + Math.random() * 0.07

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

    let photoCount = 0
    for (let i = 0; i < 16; i++) spawnPhoto(true)
    for (let i = 0; i < 14; i++) spawnPlain(true)
    for (let i = 0; i < 8;  i++) spawnCluster(true)

    function tick(t) {
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

  // Foam head: dense tiny circles at the bottom edge create fine foam texture.
  // foam-body covers the main area; SVG filter adds micro-bubble appearance.
  useEffect(() => {
    const el = foamRef.current
    if (!el) return
    const bodyHeight = 66 // must match .foam-body height in CSS

    // Bottom edge — circles centred just at bodyHeight so a clear arc protrudes below
    const bottomCount = Math.max(120, Math.ceil(window.innerWidth / 9))
    for (let i = 0; i < bottomCount; i++) {
      const size = 10 + Math.random() * 10         // 10–20px
      const x    = (i / bottomCount) * 100 + (Math.random() - 0.5) * 1.2
      const cy   = bodyHeight + (Math.random() - 0.5) * 5  // centred ~at the edge
      const b = document.createElement('div')
      b.className = 'foam-bubble'
      b.style.cssText = `width:${size}px;height:${size}px;left:${x}%;top:${cy - size / 2}px`
      el.appendChild(b)
    }
    // Second row — offset, slightly higher, fills gaps
    const midCount = Math.max(80, Math.ceil(window.innerWidth / 13))
    for (let i = 0; i < midCount; i++) {
      const size = 7 + Math.random() * 8           // 7–15px
      const x    = (i / midCount) * 100 + (50 / midCount) + (Math.random() - 0.5) * 1.5
      const cy   = bodyHeight - size * 0.4 + (Math.random() - 0.5) * 4
      const b = document.createElement('div')
      b.className = 'foam-bubble'
      b.style.cssText = `width:${size}px;height:${size}px;left:${x}%;top:${cy - size / 2}px`
      el.appendChild(b)
    }
  }, [])

  return (
    <div className="scene">
      <div className="bubble-layer" ref={layerRef} />
      <div className="fg-layer"     ref={fgLayerRef} />
      {/* foam-bubbles sits behind foam-body; fine circle arcs at bottom edge show below */}
      <div className="foam-bubbles" ref={foamRef} />
      <div className="foam-body" />
      {/* glass-fg: edge highlights simulating cylindrical glass curvature */}
      <div className="glass-fg" />
    </div>
  )
}
