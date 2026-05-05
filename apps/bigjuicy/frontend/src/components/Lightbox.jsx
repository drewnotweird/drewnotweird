import { useEffect, useRef, useState } from 'react'
import { images } from '../data/images'
import './Lightbox.css'

export default function Lightbox({ imgIndex, clickRect, onClose }) {
  const [phase, setPhase]             = useState('closed')
  const phaseRef                      = useRef('closed')
  const [currentIndex, setCurrentIndex] = useState(imgIndex)
  const [navFading, setNavFading]     = useState(false)
  const navFadingRef                  = useRef(false)
  const touchStartX                   = useRef(null)
  const touchStartY                   = useRef(null)

  const src = `${import.meta.env.BASE_URL}photos/${images[currentIndex].src}`

  const isMobile = window.innerWidth <= 600
  const bx       = clickRect.left + clickRect.width  / 2
  const by       = clickRect.top  + clickRect.height / 2
  // On mobile: constrain height more so arrows have clear space below the image
  const openSize = Math.min(window.innerWidth * 0.9, window.innerHeight * (isMobile ? 0.60 : 0.85))
  const cx       = window.innerWidth  / 2
  // On mobile: centre image in the upper portion, leaving room for arrows below
  const cy       = isMobile ? window.innerHeight * 0.38 : window.innerHeight / 2

  // Preload adjacent images so navigation doesn't stall on cache miss
  useEffect(() => {
    const prev = new Image()
    const next = new Image()
    prev.src = `${import.meta.env.BASE_URL}photos/${images[(currentIndex - 1 + images.length) % images.length].src}`
    next.src = `${import.meta.env.BASE_URL}photos/${images[(currentIndex + 1) % images.length].src}`
  }, [currentIndex])

  // Open: two rAFs so closed styles paint before transition starts
  useEffect(() => {
    const id = requestAnimationFrame(() => requestAnimationFrame(() => {
      phaseRef.current = 'open'
      setPhase('open')
    }))
    return () => cancelAnimationFrame(id)
  }, [])

  function close() {
    if (phaseRef.current !== 'open') return
    phaseRef.current = 'closing'
    setPhase('closing')
    setTimeout(onClose, 360)
  }

  function navigate(delta) {
    if (navFadingRef.current) return
    navFadingRef.current = true
    setNavFading(true)
    setTimeout(() => {
      setCurrentIndex(prev => (prev + delta + images.length) % images.length)
      navFadingRef.current = false
      setNavFading(false)
    }, 80)
  }

  // Keyboard: arrows navigate, Escape closes
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape')     close()
      if (e.key === 'ArrowRight') navigate(+1)
      if (e.key === 'ArrowLeft')  navigate(-1)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  // Touch: horizontal swipe → navigate, vertical swipe down → close
  useEffect(() => {
    const onStart = (e) => {
      touchStartX.current = e.touches[0].clientX
      touchStartY.current = e.touches[0].clientY
    }
    const onEnd = (e) => {
      if (touchStartX.current === null) return
      const dx = e.changedTouches[0].clientX - touchStartX.current
      const dy = e.changedTouches[0].clientY - touchStartY.current
      touchStartX.current = null
      touchStartY.current = null
      if (dy > 80 && Math.abs(dy) > Math.abs(dx)) { close(); return }
      if (Math.abs(dx) > 50) navigate(dx < 0 ? +1 : -1)
    }
    document.addEventListener('touchstart', onStart)
    document.addEventListener('touchend',   onEnd)
    return () => {
      document.removeEventListener('touchstart', onStart)
      document.removeEventListener('touchend',   onEnd)
    }
  }, [])

  const base = { left: cx, top: cy, width: openSize, height: openSize, clipPath: 'inset(0 round 12px)' }

  const style =
    phase === 'open'    ? { ...base, opacity: navFading ? 0 : 1, filter: 'blur(0px)',  transform: 'translate(-50%, -50%) scale(1)'    } :
    phase === 'closing' ? { ...base, opacity: 0,                  filter: 'blur(0px)',  transform: 'translate(-50%, -50%) scale(1.06)' } :
    /* closed */          { left: bx, top: by, width: clickRect.width, height: clickRect.height, clipPath: 'circle(50%)',
                            opacity: 1, filter: 'blur(0px)', transform: 'translate(-50%, -50%) scale(1)' }

  return (
    <div
      className={`lightbox${phase === 'open' || phase === 'closing' ? ' lightbox--open' : ''}${phase === 'closing' ? ' lightbox--closing' : ''}`}
      onClick={close}
    >
      <img
        src={src}
        alt=""
        className="lightbox-img"
        style={style}
        draggable={false}
      />
      {phase === 'open' && (
        <>
          <button
            className="lightbox-nav lightbox-nav--prev"
            onClick={e => { e.stopPropagation(); navigate(-1) }}
          >‹</button>
          <button
            className="lightbox-nav lightbox-nav--next"
            onClick={e => { e.stopPropagation(); navigate(+1) }}
          >›</button>
        </>
      )}
    </div>
  )
}
