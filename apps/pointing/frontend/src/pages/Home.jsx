import { useEffect, useRef, useState, useCallback } from 'react'
import { images as imageData } from '../data/images.js'

const MIN_DISTANCE = 130
const BASE_SIZE = 400

export default function Home() {
  const [ready, setReady] = useState(false)
  const [settled, setSettled] = useState([])
  const [active, setActive] = useState(null)

  const loadedPhotos = useRef([])
  const activeRef = useRef(null)
  const activeImgRef = useRef(null)
  const activeStart = useRef(null)
  const nextIdx = useRef(0)

  const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)
  const BASE = import.meta.env.BASE_URL

  // Preload images
  useEffect(() => {
    if (!imageData.length) return
    let count = 0
    const threshold = Math.min(3, imageData.length)
    imageData.forEach(data => {
      const img = new Image()
      img.src = `${BASE}${data.src}`
      img.onload = () => {
        const longest = Math.max(img.naturalWidth, img.naturalHeight)
        const scale = BASE_SIZE / longest
        loadedPhotos.current.push({
          src: img.src,
          hotspot: data.hotspot,
          w: Math.round(img.naturalWidth * scale),
          h: Math.round(img.naturalHeight * scale),
        })
        if (++count >= threshold) setReady(true)
      }
      img.onerror = () => { if (++count >= threshold) setReady(true) }
    })
  }, [BASE])

  const getNextPhoto = useCallback(() => {
    const pool = loadedPhotos.current
    if (!pool.length) return null
    const photo = pool[nextIdx.current % pool.length]
    nextIdx.current++
    return photo
  }, [])

  const placeNew = useCallback((x, y) => {
    const photo = getNextPhoto()
    if (!photo) return
    const newActive = { ...photo, id: Date.now() + Math.random(), x, y }
    activeRef.current = newActive
    activeStart.current = { x, y }
    setActive(newActive)
  }, [getNextPhoto])

  const handleCursor = useCallback((x, y) => {
    if (!ready) return

    if (!activeRef.current) {
      placeNew(x, y)
      return
    }

    const dx = x - activeStart.current.x
    const dy = y - activeStart.current.y

    if (Math.sqrt(dx * dx + dy * dy) >= MIN_DISTANCE) {
      // Settle current photo, start new
      setSettled(s => [...s, { ...activeRef.current }])
      placeNew(x, y)
    } else {
      // Drag active photo — update DOM directly for performance
      if (activeImgRef.current) {
        const p = activeRef.current
        activeImgRef.current.style.left = `${x - p.hotspot.x * p.w}px`
        activeImgRef.current.style.top = `${y - p.hotspot.y * p.h}px`
      }
      activeRef.current = { ...activeRef.current, x, y }
    }
  }, [ready, placeNew])

  useEffect(() => {
    const onMouseMove = e => handleCursor(e.clientX, e.clientY)
    const onTouch = e => {
      e.preventDefault()
      handleCursor(e.touches[0].clientX, e.touches[0].clientY)
    }
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('touchstart', onTouch, { passive: false })
    window.addEventListener('touchmove', onTouch, { passive: false })
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('touchstart', onTouch)
      window.removeEventListener('touchmove', onTouch)
    }
  }, [handleCursor])

  const photoStyle = p => ({
    position: 'fixed',
    left: p.x - p.hotspot.x * p.w,
    top: p.y - p.hotspot.y * p.h,
    width: p.w,
    height: p.h,
    pointerEvents: 'none',
    userSelect: 'none',
    display: 'block',
  })

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      background: '#fafafa',
      position: 'fixed',
      inset: 0,
      cursor: ready ? 'none' : 'default',
    }}>

      {/* Intro text — fades out when ready */}
      <div style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: ready ? 0 : 1,
        transition: 'opacity 1.2s ease',
        pointerEvents: 'none',
        zIndex: 1000,
      }}>
        <p style={{
          fontFamily: '"Inter", sans-serif',
          fontWeight: 300,
          fontSize: 'clamp(1.1rem, 3vw, 2rem)',
          color: '#0a0a0a',
          margin: 0,
          padding: '0 2rem',
          textAlign: 'center',
        }}>
          {isMobile ? "I'll point to your finger" : "I'll point to your mouse"}
        </p>
      </div>

      {/* Settled photos */}
      {settled.map(p => (
        <img
          key={p.id}
          src={p.src}
          alt=""
          draggable={false}
          style={photoStyle(p)}
        />
      ))}

      {/* Active (following) photo */}
      {active && (
        <img
          key={active.id}
          ref={activeImgRef}
          src={active.src}
          alt=""
          draggable={false}
          style={photoStyle(active)}
        />
      )}
    </div>
  )
}
