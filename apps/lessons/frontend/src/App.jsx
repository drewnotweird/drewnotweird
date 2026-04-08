import { useState, useEffect, useRef, useCallback } from 'react'
import { lessons } from './data/lessons.js'
import Particles from './components/Particles.jsx'
import Typewriter from './components/Typewriter.jsx'
import './App.css'

const TOTAL = lessons.length
const BASE = 'https://www.drewnotweird.co.uk/lessons/'

function formatNum(n) {
  return `#${String(n + 1).padStart(3, '0')}`
}

function lessonUrl(n) {
  return `${BASE}#${n + 1}`
}

// Read hash on load; fall back to random
function initialIdx() {
  const hash = parseInt(window.location.hash.slice(1), 10)
  if (!isNaN(hash) && hash >= 1 && hash <= TOTAL) return hash - 1
  return Math.floor(Math.random() * TOTAL)
}

function updateMeta(idx) {
  const lesson = lessons[idx]
  const title = `Read / Heard / Thought / Learned — ${lesson.number}`
  const desc = lesson.headline
  const url = lessonUrl(idx)

  document.title = title
  document.querySelector('meta[name="description"]')?.setAttribute('content', desc)
  document.querySelector('meta[property="og:title"]')?.setAttribute('content', title)
  document.querySelector('meta[property="og:description"]')?.setAttribute('content', desc)
  document.querySelector('meta[property="og:url"]')?.setAttribute('content', url)
  document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', title)
  document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', desc)
}

export default function App() {
  const [idx, setIdx] = useState(initialIdx)
  const [displayNum, setDisplayNum] = useState(() => initialIdx())
  const [animClass, setAnimClass] = useState('')
  const [smallVisible, setSmallVisible] = useState(true)
  const [copied, setCopied] = useState(false)
  const transitioning = useRef(false)
  const touchStartX = useRef(null)
  const counterRef = useRef(null)

  // Sync hash and meta on idx change
  useEffect(() => {
    window.location.hash = idx + 1
    updateMeta(idx)
  }, [idx])

  // Handle back/forward browser navigation
  useEffect(() => {
    const onHashChange = () => {
      const hash = parseInt(window.location.hash.slice(1), 10)
      if (!isNaN(hash) && hash >= 1 && hash <= TOTAL) {
        setIdx(hash - 1)
        setDisplayNum(hash - 1)
      }
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const go = useCallback((fromIdx, toIdx, dir) => {
    if (transitioning.current) return
    transitioning.current = true

    setAnimClass(`exit-${dir}`)
    setSmallVisible(false)

    clearInterval(counterRef.current)
    const step = toIdx > fromIdx ? 1 : -1
    let current = fromIdx
    counterRef.current = setInterval(() => {
      current += step
      setDisplayNum(current)
      if (current === toIdx) clearInterval(counterRef.current)
    }, 60)

    setTimeout(() => {
      // Phase 2: swap content while still invisible, no animation class
      setIdx(toIdx)
      setAnimClass('hidden')

      // Phase 3: enter animation starts only after content has committed to DOM
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setAnimClass(`enter-${dir}`)
          setSmallVisible(true)
          setTimeout(() => {
            setAnimClass('')
            transitioning.current = false
          }, 450)
        })
      })
    }, 300)
  }, [])

  const prev = useCallback(() => go(idx, (idx - 1 + TOTAL) % TOTAL, 'prev'), [idx, go])
  const next = useCallback(() => go(idx, (idx + 1) % TOTAL, 'next'), [idx, go])

  // Keyboard
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft') prev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [prev, next])

  useEffect(() => () => clearInterval(counterRef.current), [])

  // Touch: swipe = directional, tap = next
  const onTouchStart = useCallback((e) => {
    touchStartX.current = e.touches[0].clientX
  }, [])

  const onTouchEnd = useCallback((e) => {
    if (touchStartX.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    touchStartX.current = null
    if (Math.abs(dx) < 40) next()
    else dx < 0 ? next() : prev()
  }, [prev, next])

  // Desktop: left/right half click
  const onMouseClick = useCallback((e) => {
    if (e.target.closest('.ui-share')) return
    e.clientX < window.innerWidth / 2 ? prev() : next()
  }, [prev, next])

  // Share: Web Share API → clipboard fallback
  const handleShare = useCallback(async (e) => {
    e.preventDefault()
    const lesson = lessons[idx]
    const url = lessonUrl(idx)
    const shareData = {
      title: `Read / Heard / Thought / Learned — ${lesson.number}`,
      text: lesson.headline,
      url,
    }
    if (navigator.share) {
      try { await navigator.share(shareData) } catch (_) {}
    } else {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [idx])

  const lesson = lessons[idx]

  return (
    <div className="stage" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <div className="bg" style={{ backgroundImage: `url(${import.meta.env.BASE_URL}noise.gif)` }} />
      <Particles />

      <div className="zone zone--prev" onClick={onMouseClick} />
      <div className="zone zone--next" onClick={onMouseClick} />

      <p className="ui-label">Read / heard / thought / learned</p>
      <p className="ui-number">{formatNum(displayNum)}</p>

      {lesson.small && (
        <p className={`ui-small ${smallVisible ? 'small--in' : 'small--out'}`}>
          <Typewriter text={lesson.small} active={smallVisible} />
        </p>
      )}

      <p className="ui-share">
        <a href={lessonUrl(idx)} onClick={handleShare}>
          {copied ? 'Copied ✓' : 'Share ↗'}
        </a>
      </p>

      <div className={`content lesson-${idx + 1} ${animClass}`}>
        <p>{lesson.headline}</p>
      </div>
    </div>
  )
}
