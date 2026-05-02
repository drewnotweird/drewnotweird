import React, { useState, useEffect, useRef } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useDebounce } from '../hooks/useDebounce'
import { apiFetch } from '../api'

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [searchType, setSearchType] = useState(searchParams.get('type') || 'movies')
  const debouncedQuery = useDebounce(query, 300)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [allWords, setAllWords] = useState([])
  const allWordsFetchedRef = useRef(false)
  const [allMovies, setAllMovies] = useState([])
  const allMoviesFetchedRef = useRef(false)

  useEffect(() => {
    if (searchType === 'wunwurds' && !allWordsFetchedRef.current) {
      allWordsFetchedRef.current = true
      apiFetch('/api/words')
        .then((r) => r.json())
        .then((data) => setAllWords(Array.isArray(data) ? data : []))
        .catch(() => {})
    }
    if (searchType === 'movies' && !allMoviesFetchedRef.current) {
      allMoviesFetchedRef.current = true
      apiFetch('/api/movies/trending?page=1')
        .then((r) => r.json())
        .then((data) => setAllMovies(Array.isArray(data) ? data : []))
        .catch(() => {})
    }
  }, [searchType])

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([])
      return
    }
    setLoading(true)
    setSearchParams({ q: debouncedQuery, type: searchType }, { replace: true })
    
    const endpoint = searchType === 'wunwurds' 
      ? `/api/words/search?q=${encodeURIComponent(debouncedQuery)}`
      : `/api/movies/search?q=${encodeURIComponent(debouncedQuery)}`
    
    apiFetch(endpoint, {
      
    })
      .then((r) => r.json())
      .then((data) => {
        setResults(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [debouncedQuery, searchType, setSearchParams])

  return (
    <div className="px-4 pt-6 pb-20 max-w-2xl mx-auto">
      <div className="mb-6 flex gap-3">
        <button
          onClick={() => setSearchType('wunwurds')}
          className={`px-4 py-2 font-bold uppercase text-sm transition-colors ${
            searchType === 'wunwurds'
              ? 'bg-[#FF1493] text-black'
              : 'bg-gray-900 text-white border-2 border-[#FF1493]'
          }`}
        >
          Wurd
        </button>
        <button
          onClick={() => setSearchType('movies')}
          className={`px-4 py-2 font-bold uppercase text-sm transition-colors ${
            searchType === 'movies'
              ? 'bg-[#FF1493] text-black'
              : 'bg-gray-900 text-white border-2 border-[#FF1493]'
          }`}
        >
          Title
        </button>
      </div>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={searchType === 'movies' ? 'Movie' : 'Adjective'}
        autoFocus
        className="w-full bg-transparent border-b-2 border-[#FF1493] text-white font-bold text-2xl uppercase py-2 outline-none placeholder-gray-700 mb-8"
      />

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-10 h-14 bg-gray-900 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-900 w-3/4" />
                <div className="h-3 bg-gray-900 w-1/4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && results.length === 0 && debouncedQuery.trim() && (
        <p className="text-[#FF1493] uppercase text-center py-12 text-lg font-bold">
          NO {searchType === 'movies' ? 'MOVIES' : 'WUNWURDS'} FOUND
        </p>
      )}

      {/* Prompt before typing / all wurds */}
      {!loading && !debouncedQuery.trim() && (
        searchType === 'wunwurds'
          ? (
            <div className="flex flex-wrap gap-x-8 gap-y-3 justify-center py-4">
              {allWords.map(({ word }, i) => (
                <Link
                  key={word}
                  to={`/word/${word}`}
                  className="font-bold uppercase text-4xl text-white hover:text-[#FF1493] transition-colors"
                  style={{ animation: 'fadeIn 400ms ease both', animationDelay: `${Math.min(i, 20) * 40}ms` }}
                >
                  {word.toUpperCase()}
                </Link>
              ))}
            </div>
          )
          : (
            <div className="space-y-1">
              {allMovies.map((movie) => {
                const poster = movie.poster_path ? `https://image.tmdb.org/t/p/w92${movie.poster_path}` : null
                const year = movie.release_date ? movie.release_date.slice(0, 4) : null
                return (
                  <Link key={movie.id} to={`/movie/${movie.id}`} className="flex items-center gap-4 p-2 hover:bg-gray-900 transition-colors">
                    {poster
                      ? <img src={poster} alt={movie.title} className="w-10 h-14 object-cover flex-shrink-0" />
                      : <div className="w-10 h-14 bg-gray-800 flex-shrink-0" />}
                    <div>
                      <p className="text-white font-bold text-lg uppercase leading-none">{movie.title}</p>
                      {year && <p className="text-[#FF1493] text-sm font-bold">{year}</p>}
                    </div>
                  </Link>
                )
              })}
            </div>
          )
      )}

      {/* Results */}
      <div className="space-y-1">
        {searchType === 'movies' ? (
          results.map((movie) => {
            const poster = movie.poster_path
              ? `https://image.tmdb.org/t/p/w92${movie.poster_path}`
              : null
            const year = movie.release_date ? movie.release_date.slice(0, 4) : null
            return (
              <Link
                key={movie.id}
                to={`/movie/${movie.id}`}
                className="flex items-center gap-4 p-2 hover:bg-gray-900 transition-colors"
              >
                {poster ? (
                  <img
                    src={poster}
                    alt={movie.title}
                    className="w-10 h-14 object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-14 bg-gray-800 flex-shrink-0" />
                )}
                <div>
                  <p className="text-white font-bold text-lg uppercase leading-none">
                    {movie.title}
                  </p>
                  {year && (
                    <p className="text-[#FF1493] text-sm font-bold">{year}</p>
                  )}
                </div>
              </Link>
            )
          })
        ) : (
          results.map((word) => (
            <Link
              key={word.id || word.word}
              to={`/word/${word.word}`}
              className="flex items-center gap-4 p-3 hover:bg-gray-900 transition-colors"
            >
              <div>
                <p className="text-white font-bold text-lg uppercase leading-none">
                  {word.word}
                </p>
                {word.count && (
                  <p className="text-[#FF1493] text-sm font-bold">{word.count} wurd{word.count !== 1 ? 's' : ''}</p>
                )}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
