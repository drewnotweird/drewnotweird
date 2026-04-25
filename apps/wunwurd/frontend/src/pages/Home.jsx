import { useEffect, useState, useRef, useCallback } from 'react'
import MovieCard from '../components/MovieCard'
import SkeletonCard from '../components/SkeletonCard'
import { apiFetch } from '../api'

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

export default function Home() {
  const cached = useRef(loadCache())
  const [movies, setMovies] = useState(cached.current || [])
  const [loading, setLoading] = useState(!cached.current)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [scrollY, setScrollY] = useState(0)
  const [waking, setWaking] = useState(false)
  const pageRef = useRef(1)
  const fetchingRef = useRef(false)

  useEffect(() => {
    const h = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])

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
    let attempt = 0
    const delays = [0, 5000, 10000, 15000] // retry up to 3 times

    async function fetchPage1() {
      while (attempt < delays.length) {
        if (attempt > 0) await new Promise(r => setTimeout(r, delays[attempt]))
        if (cancelled) return
        if (attempt > 0) setWaking(true)
        try {
          const r = await apiFetch('/api/movies/trending?page=1', {})
          if (!r.ok) throw new Error()
          const data = await r.json()
          const results = Array.isArray(data) ? data : []
          if (cancelled) return
          setMovies(results)
          setLoading(false)
          setWaking(false)
          pageRef.current = 2
          if (results.length > 0) saveCache(results)
          return
        } catch {
          attempt++
        }
      }
      // All retries failed — show cache if we have it, otherwise empty
      if (cancelled) return
      setLoading(false)
      setWaking(false)
    }

    fetchPage1()
    return () => { cancelled = true }
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
      <div className="bg-[#FF1493] px-6 pb-10 text-center">
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
            style={{ fontSize: 'clamp(4rem, 18vw, 10rem)' }}
          >
            WUNWURD
          </h1>
          <p className="text-black font-bold uppercase mt-2 text-base sm:text-xl">
            SINGLE-WORD REVIEWS
          </p>
        </div>
      </div>

      {/* Waking up indicator */}
      {waking && (
        <p className="text-center text-gray-500 text-sm py-3 animate-pulse">
          Waking up…
        </p>
      )}

      {/* Grid */}
      <div className="px-2 py-2">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
          {loading
            ? Array.from({ length: COLS * ROWS }).map((_, i) => <SkeletonCard key={i} />)
            : movies.map(movie => <MovieCard key={movie.id || movie.tmdbId} movie={movie} />)}
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
