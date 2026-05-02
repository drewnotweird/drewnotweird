import { useEffect, useRef, useState } from 'react'
import './Lightbox.css'

export default function Lightbox({ src, clickRect, onClose }) {
  const [phase, setPhase] = useState('closed')
  const phaseRef = useRef('closed')
  const imgRef   = useRef(null)

  const bx       = clickRect.left + clickRect.width  / 2
  const by       = clickRect.top  + clickRect.height / 2
  const openSize = Math.min(window.innerWidth * 0.9, window.innerHeight * 0.85)
  const cx       = window.innerWidth  / 2
  const cy       = window.innerHeight / 2

  // open: two rAFs so closed styles paint before transition starts
  useEffect(() => {
    const id = requestAnimationFrame(() => requestAnimationFrame(() => {
      phaseRef.current = 'open'
      setPhase('open')
    }))
    return () => cancelAnimationFrame(id)
  }, [])

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') close() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  function close() {
    if (phaseRef.current !== 'open') return
    phaseRef.current = 'closing'
    setPhase('closing')
    setTimeout(onClose, 360)
  }

  // closed  → bubble-sized at click position
  // open    → full size, visible
  // closing → full size, fading out (CSS handles the transition)
  const base = { left: cx, top: cy, width: openSize, height: openSize, clipPath: 'inset(0 round 12px)' }

  const style =
    phase === 'open'    ? { ...base, opacity: 1,  filter: 'blur(0px)',   transform: 'translate(-50%, -50%) scale(1)'    } :
    phase === 'closing' ? { ...base, opacity: 0,  filter: 'blur(16px)',  transform: 'translate(-50%, -50%) scale(1.06)' } :
    /* closed */          { left: bx, top: by, width: clickRect.width, height: clickRect.height, clipPath: 'circle(50%)',
                            opacity: 1, filter: 'blur(0px)', transform: 'translate(-50%, -50%) scale(1)' }

  return (
    <div
      className={`lightbox${phase === 'open' || phase === 'closing' ? ' lightbox--open' : ''}${phase === 'closing' ? ' lightbox--closing' : ''}`}
      onClick={close}
    >
      <img
        ref={imgRef}
        src={src}
        alt=""
        className="lightbox-img"
        style={style}
        draggable={false}
      />
    </div>
  )
}
