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

  // Foam scallop path — viewBox 0 0 1000 110, baseline y=72, scallops dip to ~y=86
  const foamPath = 'M 0,0 H 1000 V 72 Q 978,100 956,72 Q 940,90 924,72 Q 902,103 880,72 Q 866,88 852,72 Q 829,102 806,72 Q 792,91 778,72 Q 757,99 736,72 Q 723,87 710,72 Q 687.5,101 665,72 Q 650.5,92 636,72 Q 615,97 594,72 Q 580.5,89 567,72 Q 545.5,102 524,72 Q 511,90 498,72 Q 476,101 454,72 Q 440,91 426,72 Q 405,98 384,72 Q 370.5,88 357,72 Q 335.5,101 314,72 Q 300.5,91 287,72 Q 265.5,99 244,72 Q 231,87 218,72 Q 196,103 174,72 Q 160.5,90 147,72 Q 125.5,97 104,72 Q 90.5,88 77,72 Q 55.5,102 34,72 Q 17,92 0,72 Z'

  return (
    <div className="scene">
      <div className="bubble-layer" ref={layerRef} />
      <div className="fg-layer"     ref={fgLayerRef} />
      <svg
        className="foam-head"
        viewBox="0 0 1000 110"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="foam-inner" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="rgba(255,252,235,0.18)" />
            <stop offset="100%" stopColor="rgba(210,165,90,0.12)" />
          </linearGradient>
        </defs>

        {/* Main cream foam shape */}
        <path d={foamPath} fill="#fff9ec" />

        {/* Subtle shading gradient over the foam */}
        <rect x="0" y="0" width="1000" height="72" fill="url(#foam-inner)" />

        {/* Foam bubble circles for texture */}
        <circle cx="68"  cy="52" r="14" fill="rgba(255,255,255,0.4)" />
        <circle cx="148" cy="34" r="21" fill="rgba(255,255,255,0.34)" />
        <circle cx="238" cy="54" r="12" fill="rgba(255,255,255,0.42)" />
        <circle cx="308" cy="38" r="18" fill="rgba(255,255,255,0.32)" />
        <circle cx="405" cy="26" r="23" fill="rgba(255,255,255,0.37)" />
        <circle cx="482" cy="50" r="13" fill="rgba(255,255,255,0.41)" />
        <circle cx="568" cy="33" r="20" fill="rgba(255,255,255,0.36)" />
        <circle cx="644" cy="54" r="12" fill="rgba(255,255,255,0.43)" />
        <circle cx="724" cy="29" r="22" fill="rgba(255,255,255,0.35)" />
        <circle cx="812" cy="50" r="15" fill="rgba(255,255,255,0.4)" />
        <circle cx="890" cy="36" r="19" fill="rgba(255,255,255,0.34)" />
        <circle cx="960" cy="51" r="14" fill="rgba(255,255,255,0.39)" />

        {/* Catchlight highlights on bubbles */}
        <circle cx="63"  cy="47" r="4"  fill="rgba(255,255,255,0.72)" />
        <circle cx="142" cy="28" r="5"  fill="rgba(255,255,255,0.68)" />
        <circle cx="234" cy="49" r="3"  fill="rgba(255,255,255,0.7)"  />
        <circle cx="303" cy="33" r="4"  fill="rgba(255,255,255,0.66)" />
        <circle cx="399" cy="20" r="6"  fill="rgba(255,255,255,0.7)"  />
        <circle cx="477" cy="44" r="3"  fill="rgba(255,255,255,0.72)" />
        <circle cx="562" cy="27" r="5"  fill="rgba(255,255,255,0.67)" />
        <circle cx="639" cy="49" r="3"  fill="rgba(255,255,255,0.71)" />
        <circle cx="718" cy="23" r="5"  fill="rgba(255,255,255,0.69)" />
        <circle cx="806" cy="44" r="4"  fill="rgba(255,255,255,0.7)"  />
        <circle cx="884" cy="30" r="5"  fill="rgba(255,255,255,0.67)" />
        <circle cx="955" cy="45" r="4"  fill="rgba(255,255,255,0.71)" />
      </svg>
    </div>
  )
}
