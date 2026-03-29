import { useEffect, useState, useRef, useCallback } from 'react'
import MovieCard from '../components/MovieCard'
import SkeletonCard from '../components/SkeletonCard'
import { apiFetch } from '../api'

const SCROLL_THRESHOLD = 140

export default function Home() {
  const [movies, setMovies] = useState([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState(null)
  const [scrollY, setScrollY] = useState(0)
  const sentinelRef = useRef(null)

  useEffect(() => {
    const h = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])

  // Load a page of movies
  const loadPage = useCallback(async (pageNum) => {
    if (pageNum === 1) setLoading(true)
    else setLoadingMore(true)

    try {
      const r = await apiFetch(`/api/movies/trending?page=${pageNum}`, { credentials: 'include' })
      if (!r.ok) throw new Error('Failed to load')
      const data = await r.json()
      const results = Array.isArray(data) ? data : []
      setMovies(prev => pageNum === 1 ? results : [...prev, ...results])
      setHasMore(results.length > 0)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [])

  useEffect(() => { loadPage(1) }, [loadPage])

  // IntersectionObserver — triggers when sentinel comes into view
  useEffect(() => {
    if (!sentinelRef.current) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !loadingMore && !loading) {
          setPage(prev => prev + 1)
        }
      },
      { rootMargin: '200px' }
    )
    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [hasMore, loadingMore, loading])

  useEffect(() => {
    if (page > 1) loadPage(page)
  }, [page, loadPage])

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

      {/* Grid */}
      <div className="px-2 py-2">
        {error && <p className="text-center text-[#FF1493] uppercase py-8">{error}</p>}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
          {loading
            ? Array.from({ length: 20 }).map((_, i) => <SkeletonCard key={i} />)
            : movies.map(movie => <MovieCard key={movie.id} movie={movie} />)}
        </div>

        {/* Sentinel + loading indicator */}
        <div ref={sentinelRef} className="py-6 flex justify-center">
          {loadingMore && (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 w-full">
              {Array.from({ length: 20 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
