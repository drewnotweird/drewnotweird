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

  const src = `${import.meta.env.BASE_URL}photos/${images[currentIndex].src}`

  const bx       = clickRect.left + clickRect.width  / 2
  const by       = clickRect.top  + clickRect.height / 2
  const openSize = Math.min(window.innerWidth * 0.9, window.innerHeight * 0.85)
  const cx       = window.innerWidth  / 2
  const cy       = window.innerHeight / 2

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
    }, 160)
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

  // Touch swipe to navigate
  useEffect(() => {
    const onStart = (e) => { touchStartX.current = e.touches[0].clientX }
    const onEnd   = (e) => {
      if (touchStartX.current === null) return
      const dx = e.changedTouches[0].clientX - touchStartX.current
      touchStartX.current = null
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
    phase === 'closing' ? { ...base, opacity: 0,                  filter: 'blur(16px)', transform: 'translate(-50%, -50%) scale(1.06)' } :
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
          <div className="lightbox-counter" onClick={e => e.stopPropagation()}>
            {currentIndex + 1} / {images.length}
          </div>
        </>
      )}
    </div>
  )
}
