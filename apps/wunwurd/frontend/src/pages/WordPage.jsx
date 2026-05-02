import React, { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useDebounce } from '../hooks/useDebounce'
import MovieCard from '../components/MovieCard'
import SkeletonCard from '../components/SkeletonCard'
import WordCloud from '../components/WordCloud'
import { apiFetch } from '../api'

export default function WordPage() {
  const { word } = useParams()
  const [searchMode, setSearchMode] = useState('wunwurds')
  const [searchTerm, setSearchTerm] = useState(word || '')
  const debouncedTerm = useDebounce(searchTerm, 300)
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const pageRef = useRef(1)
  const fetchingRef = useRef(false)
  const [allWords, setAllWords] = useState([])
  const allWordsFetchedRef = useRef(false)
  const [allMovies, setAllMovies] = useState([])
  const allMoviesFetchedRef = useRef(false)

  useEffect(() => {
    setSearchTerm(word || '')
    setSearchMode('wunwurds')
    pageRef.current = 1
  }, [word])

  useEffect(() => {
    if (searchMode === 'wunwurds' && !allWordsFetchedRef.current) {
      allWordsFetchedRef.current = true
      apiFetch('/api/words')
        .then((r) => r.json())
        .then((data) => setAllWords(Array.isArray(data) ? data : []))
        .catch(() => {})
    }
    if (searchMode === 'movies' && !allMoviesFetchedRef.current) {
      allMoviesFetchedRef.current = true
      apiFetch('/api/movies/trending?page=1')
        .then((r) => r.json())
        .then((data) => setAllMovies(Array.isArray(data) ? data : []))
        .catch(() => {})
    }
  }, [searchMode])

  useEffect(() => {
    window.scrollTo(0, 0)
    setMovies([])
    setHasMore(false)
    pageRef.current = 1

    if (!debouncedTerm.trim()) {
      setLoading(false)
      return
    }
    setLoading(true)

    const endpoint = searchMode === 'wunwurds'
      ? `/api/words/${encodeURIComponent(debouncedTerm)}?page=1`
      : `/api/movies/search?q=${encodeURIComponent(debouncedTerm)}`

    apiFetch(endpoint, {})
      .then((r) => r.json())
      .then((data) => {
        if (searchMode === 'wunwurds') {
          setMovies(Array.isArray(data.movies) ? data.movies : [])
          setHasMore(!!data.hasMore)
          pageRef.current = 2
        } else {
          setMovies(Array.isArray(data) ? data : [])
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [debouncedTerm, searchMode])

  async function loadMore() {
    if (fetchingRef.current || !hasMore) return
    fetchingRef.current = true
    setLoadingMore(true)
    try {
      const r = await apiFetch(`/api/words/${encodeURIComponent(debouncedTerm)}?page=${pageRef.current}`, {})
      const data = await r.json()
      setMovies(prev => [...prev, ...(Array.isArray(data.movies) ? data.movies : [])])
      setHasMore(!!data.hasMore)
      pageRef.current += 1
    } catch {
      // silently fail
    } finally {
      setLoadingMore(false)
      fetchingRef.current = false
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-center border-b-2 border-[#FF1493]">
        <div className="pt-8 pb-4 px-4 max-w-4xl w-full">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent text-white font-bold leading-none uppercase outline-none border-none text-center placeholder-gray-700"
            style={{ fontSize: 'clamp(2.5rem, 12vw, 6rem)' }}
            placeholder={searchMode === 'movies' ? 'Movie' : 'Adjective'}
            autoFocus={!word}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex justify-center border-b-2 border-gray-900">
        <div className="flex gap-3 pt-4">
          <button
            onClick={() => setSearchMode('wunwurds')}
            className={`px-4 py-2 font-bold uppercase transition-colors ${
              searchMode === 'wunwurds'
                ? 'text-[#FF1493] border-b-2 border-[#FF1493]'
                : 'text-gray-400 border-b-2 border-transparent'
            }`}
            style={{ fontSize: 'clamp(1.25rem, 4vw, 1.75rem)' }}
          >
            Wurd
          </button>
          <button
            onClick={() => setSearchMode('movies')}
            className={`px-4 py-2 font-bold uppercase transition-colors ${
              searchMode === 'movies'
                ? 'text-[#FF1493] border-b-2 border-[#FF1493]'
                : 'text-gray-400 border-b-2 border-transparent'
            }`}
            style={{ fontSize: 'clamp(1.25rem, 4vw, 1.75rem)' }}
          >
            Title
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="flex justify-center py-4">
        <div className="px-2 w-full">
          {!loading && searchTerm.trim() && movies.length === 0 && (
            <p className="text-center text-gray-400 uppercase py-16">
              No {searchMode === 'movies' ? 'movies' : 'wunwurds'} found.
            </p>
          )}
          {!loading && !searchTerm.trim() && searchMode === 'movies' && (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 max-w-full mx-auto">
              {allMovies.map((movie, i) => <MovieCard key={movie.id || movie.tmdbId} movie={movie} index={i} simple />)}
            </div>
          )}
          {!loading && !searchTerm.trim() && searchMode === 'wunwurds' && (
            <WordCloud words={allWords} />
          )}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 max-w-full mx-auto">
            {loading
              ? Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)
              : movies.map((movie) => <MovieCard key={movie.tmdbId} movie={movie} simple />)}
          </div>

          {/* Load more */}
          {!loading && hasMore && (
            <div className="flex justify-center mt-8 mb-4">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="bg-gray-900 text-white font-bold uppercase px-8 py-3 hover:bg-gray-800 transition-colors disabled:opacity-40"
              >
                {loadingMore ? 'LOADING...' : 'LOAD MORE'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
