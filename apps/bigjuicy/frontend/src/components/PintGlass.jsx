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

    const activeIndices = new Set()

    function spawnPhoto(seeded = false) {
      // Pick an index not currently on screen
      let imgIndex
      let attempts = 0
      do {
        imgIndex = Math.floor(Math.random() * images.length)
        attempts++
      } while (activeIndices.has(imgIndex) && attempts < images.length)
      activeIndices.add(imgIndex)
      const img = images[imgIndex]
      const size     = 56 + Math.random() * 54
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

      let rotTarget = 0
      let rotCurrent = 0
      let rotRaf = null
      const lerp = () => {
        rotCurrent += (rotTarget - rotCurrent) * 0.18
        b.style.rotate = `${rotCurrent.toFixed(2)}deg`
        if (Math.abs(rotTarget - rotCurrent) > 0.05) {
          rotRaf = requestAnimationFrame(lerp)
        } else {
          b.style.rotate = rotTarget === 0 ? '' : `${rotTarget.toFixed(2)}deg`
          rotRaf = null
        }
      }

      b.addEventListener('mouseenter', () => {
        b.style.scale  = '1.12'
        b.style.filter = baseFilter ? `${baseFilter} brightness(1.10)` : 'brightness(1.10)'
      })
      b.addEventListener('mousemove', (e) => {
        const r  = b.getBoundingClientRect()
        rotTarget = ((e.clientX - (r.left + r.width / 2)) / (r.width / 2)) * 5
        if (!rotRaf) rotRaf = requestAnimationFrame(lerp)
      })
      b.addEventListener('mouseleave', () => {
        rotTarget = 0
        b.style.scale  = ''
        b.style.filter = baseFilter || ''
        if (!rotRaf) rotRaf = requestAnimationFrame(lerp)
      })

      b.addEventListener('click', () => {
        const rect = b.getBoundingClientRect()
        onClickRef.current(imgIndex, rect)
      })
      b.addEventListener('animationend', (e) => {
        if (e.animationName === 'rise') { activeIndices.delete(imgIndex); b.remove() }
      })
      el.appendChild(b)
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

    function spawnCluster(seeded = false, clickX = null) {
      const cx    = clickX ?? (4 + Math.random() * 92)
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

    for (let i = 0; i < 18; i++) spawnPhoto(true)
    for (let i = 0; i < 16; i++) spawnPlain(true)
    for (let i = 0; i < 10; i++) spawnCluster(true)

    function tick(t) {
      if (t >= nextPhotoAt.current) {
        spawnPhoto()
        nextPhotoAt.current = t + 1700 + Math.random() * 400
      }
      if (t >= nextPlainAt.current) {
        spawnPlain()
        nextPlainAt.current = t + 450 + Math.random() * 200
      }
      if (t >= nextClusterAt.current) {
        spawnCluster()
        nextClusterAt.current = t + 300 + Math.random() * 150
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    // Clicking empty beer spawns a bubble cluster at that point
    el.addEventListener('click', (e) => {
      if (e.target !== el) return
      spawnCluster(false, (e.clientX / window.innerWidth) * 100)
    })

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])


  return (
    <div className="scene">
      <div className="bubble-layer" ref={layerRef} />
      <div className="fg-layer"     ref={fgLayerRef} />
      <div className="foam-body" />
      <div className="glass-fg" />
    </div>
  )
}
