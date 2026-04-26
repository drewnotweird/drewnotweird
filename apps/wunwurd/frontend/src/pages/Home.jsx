import { useEffect, useState, useRef, useCallback } from 'react'
import MovieCard from '../components/MovieCard'
import SkeletonCard from '../components/SkeletonCard'
import Navbar from '../components/Navbar'
import { apiFetch } from '../api'
import { useAuth } from '../context/AuthContext'

const SCROLL_THRESHOLD = 140
const COLS = 4
const ROWS = 5
const CACHE_KEY = 'wunwurd_movies_cache'
const CACHE_TTL = 1000 * 60 * 60 * 24 // 24 hours

function loadCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const { movies, ts } = JSON.parse(raw)
    if (Date.now() - ts > CACHE_TTL) return null
    return movies
  } catch {
    return null
  }
}

function saveCache(movies) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ movies, ts: Date.now() }))
  } catch {}
}

const COLD_START_SECONDS = 30

export default function Home() {
  const { setServerReady } = useAuth()
  const cached = useRef(loadCache())
  const [movies, setMovies] = useState(cached.current || [])
  const [loading, setLoading] = useState(!cached.current)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [scrollY, setScrollY] = useState(0)
  const [waking, setWaking] = useState(false)
  const [wakingDone, setWakingDone] = useState(false)
  const [countdown, setCountdown] = useState(COLD_START_SECONDS)
  const countdownRef = useRef(null)
  const wasWakingRef = useRef(false)
  const pageRef = useRef(1)
  const fetchingRef = useRef(false)

  useEffect(() => {
    const h = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])

  useEffect(() => {
    if (waking) {
      setCountdown(COLD_START_SECONDS)
      countdownRef.current = setInterval(() => {
        setCountdown(c => Math.max(0, c - 1))
      }, 1000)
    } else {
      clearInterval(countdownRef.current)
      setCountdown(COLD_START_SECONDS)
    }
    return () => clearInterval(countdownRef.current)
  }, [waking])

  const loadMore = useCallback(async () => {
    if (fetchingRef.current) return
    fetchingRef.current = true
    setLoadingMore(true)
    try {
      const r = await apiFetch(`/api/movies/trending?page=${pageRef.current}`, {})
      if (!r.ok) throw new Error()
      const data = await r.json()
      const results = Array.isArray(data) ? data : []
      if (results.length === 0) {
        setHasMore(false)
      } else {
        setMovies(prev => [...prev, ...results])
        pageRef.current += 1
      }
    } catch {
      // silently fail, user can scroll again
    } finally {
      setLoadingMore(false)
      fetchingRef.current = false
    }
  }, [])

  // Initial load with retry for cold starts
  useEffect(() => {
    let cancelled = false

    // After 500ms with no response, reveal the countdown banner
    const wakeTimer = setTimeout(() => {
      if (!cancelled) {
        wasWakingRef.current = true
        setWaking(true)
        setServerReady(false)
      }
    }, 500)

    async function fetchPage1() {
      while (!cancelled) {
        const ctrl = new AbortController()
        const abortTimer = setTimeout(() => ctrl.abort(), 8000)
        try {
          const r = await apiFetch('/api/movies/trending?page=1', { signal: ctrl.signal })
          clearTimeout(abortTimer)
          if (!r.ok) throw new Error()
          const data = await r.json()
          const results = Array.isArray(data) ? data : []
          if (cancelled) return
          clearTimeout(wakeTimer)
          setMovies(results)
          setLoading(false)
          setWaking(false)
          setServerReady(true)
          if (wasWakingRef.current) {
            wasWakingRef.current = false
            setWakingDone(true)
            setTimeout(() => setWakingDone(false), 1500)
          }
          pageRef.current = 2
          if (results.length > 0) saveCache(results)
          return
        } catch {
          clearTimeout(abortTimer)
          if (cancelled) return
          await new Promise(res => setTimeout(res, 5000))
        }
      }
    }

    fetchPage1()
    return () => {
      cancelled = true
      clearTimeout(wakeTimer)
    }
  }, [])

  // Scroll to bottom check
  useEffect(() => {
    const handleScroll = () => {
      if (!hasMore || fetchingRef.current || loading) return
      const nearBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 100
      if (nearBottom) loadMore()
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [hasMore, loading, loadMore])

  const bannerProgress = Math.min(1, scrollY / SCROLL_THRESHOLD)
  const bannerOpacity = 1 - bannerProgress
  const bannerScale = 1 - bannerProgress * 0.08

  return (
    <div>
      {/* Hero */}
      <div className="bg-[#FF1493] px-6 pt-10 pb-14 text-center">
        <div
          style={{
            opacity: bannerOpacity,
            transform: `scale(${bannerScale})`,
            transition: 'opacity 0.1s linear, transform 0.1s linear',
            transformOrigin: 'top center',
          }}
        >
          <h1
            className="text-black font-bold leading-none uppercase"
            style={{ fontSize: 'clamp(4rem, 22vw, 10rem)' }}
          >
            WUNWURD
          </h1>
          <p className="text-black font-bold uppercase mt-2 text-base sm:text-xl">
            SINGLE-WORD REVIEWS
          </p>
        </div>
      </div>

      <Navbar />

      {/* Cold-start countdown */}
      <div
        className="text-center overflow-hidden"
        style={{
          maxHeight: (waking || wakingDone) ? '500px' : '0px',
          paddingTop: (waking || wakingDone) ? '2.5rem' : '0',
          paddingBottom: (waking || wakingDone) ? '2.5rem' : '0',
          borderBottom: (waking || wakingDone) ? '4px solid #FF1493' : '0px solid #FF1493',
          transition: 'max-height 0.6s ease-in-out, padding 0.6s ease-in-out, border-bottom-width 0.6s ease-in-out',
        }}
      >
        {wakingDone ? (
          <p className="text-[#FF1493] font-black uppercase leading-none"
            style={{ fontSize: 'clamp(5rem, 22vw, 10rem)' }}>
            YAS!
          </p>
        ) : (
          <>
            <p className="text-[#FF1493] font-bold uppercase tracking-widest text-sm">
              Server warming up
            </p>
            {countdown > 0 ? (
              <p className="text-white font-bold leading-none mt-2"
                style={{ fontSize: 'clamp(5rem, 22vw, 10rem)' }}>
                {countdown}
              </p>
            ) : (
              <p className="text-white font-bold text-3xl mt-4 animate-pulse">
                Any moment now…
              </p>
            )}
            <p className="text-gray-600 text-xs uppercase tracking-wide mt-3">
              Buttons disabled until ready
            </p>
          </>
        )}
      </div>

      {/* Grid */}
      <div className="px-2 py-2">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
          {loading
            ? Array.from({ length: COLS * ROWS }).map((_, i) => <SkeletonCard key={i} />)
            : movies.map((movie, i) => <MovieCard key={movie.id || movie.tmdbId} movie={movie} index={i} />)}
        </div>

        {loadingMore && (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 mt-2">
            {Array.from({ length: COLS * ROWS }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}
      </div>
    </div>
  )
}
