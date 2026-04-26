import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useDebounce } from '../hooks/useDebounce'
import MovieCard from '../components/MovieCard'
import SkeletonCard from '../components/SkeletonCard'
import { apiFetch } from '../api'

export default function WordPage() {
  const { word } = useParams()
  const [searchMode, setSearchMode] = useState('wunwurds')
  const [searchTerm, setSearchTerm] = useState(word || '')
  const debouncedTerm = useDebounce(searchTerm, 300)
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    window.scrollTo(0, 0)
    if (!debouncedTerm.trim()) {
      setMovies([])
      setLoading(false)
      return
    }
    setLoading(true)
    
    const endpoint = searchMode === 'wunwurds'
      ? `/api/words/${encodeURIComponent(debouncedTerm)}`
      : `/api/movies/search?q=${encodeURIComponent(debouncedTerm)}`
    
    apiFetch(endpoint, {})
      .then((r) => r.json())
      .then((data) => { setMovies(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [debouncedTerm, searchMode])

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
          {!loading && !searchTerm.trim() && (
            <p className="text-center text-gray-400 uppercase py-16">
              Start typing to search for {searchMode === 'movies' ? 'movies' : 'wunwurds'}.
            </p>
          )}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 max-w-full mx-auto">
            {loading
              ? Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)
              : movies.map((movie) => <MovieCard key={movie.tmdbId} movie={movie} simple />)}
          </div>
        </div>
      </div>
    </div>
  )
}
