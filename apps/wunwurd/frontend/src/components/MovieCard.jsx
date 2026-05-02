import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { apiFetch } from '../api'

export default function MovieCard({ movie, simple = false, index = 0 }) {
  const animDelay = `${Math.min(index, 8) * 40}ms`
  const [topWord, setTopWord] = useState(null)
  const [wordFetched, setWordFetched] = useState(false)

  const backdropPath = movie.backdrop_path || movie.backdropPath
  const imageUrl = backdropPath ? `https://image.tmdb.org/t/p/w780${backdropPath}` : null
  const tmdbId = movie.tmdbId || movie.id
  const title = movie.title || movie.name || ''

  useEffect(() => {
    if (simple) return
    if (wordFetched) return
    setWordFetched(true)
    apiFetch(`/api/movies/${tmdbId}/wunwurds`, {})
      .then((r) => r.json())
      .then((data) => setTopWord(data.topWord || null))
      .catch(() => {})
  }, [tmdbId, wordFetched, simple])

  return (
    <Link
      to={`/movie/${tmdbId}`}
      className="relative overflow-hidden bg-gray-900 aspect-square block group"
      style={{ animation: 'fadeInUp 350ms ease both', animationDelay: animDelay }}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full bg-gray-800" />
      )}

      {/* Base gradient (stronger) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0) 55%)' }}
      />

      {/* Hover: dark overlay (stronger) */}
      <div className="absolute inset-0 pointer-events-none bg-black opacity-0 group-hover:opacity-50 transition-opacity duration-300" />

      {/* Hover: white border */}
      <div className="absolute inset-0 pointer-events-none border-2 border-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Hover: title fades in at top */}
      <div className="absolute top-0 left-0 right-0 p-3 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <p
          className="font-bold uppercase text-white text-center leading-tight"
          style={{
            fontSize: 'clamp(0.7rem, 2.2vw, 0.95rem)',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {title}
        </p>
      </div>

      {/* Word / title at bottom — always visible */}
      <div className="absolute bottom-0 left-0 right-0 p-3 text-center pointer-events-none">
        <span
          className={`font-bold uppercase leading-none block transition-colors duration-300 ${'text-white group-hover:text-[#FF1493]'}`}
          style={{
            fontSize: 'clamp(1.75rem, 5vw, 2.75rem)',
            lineHeight: 0.85,
            display: '-webkit-box',
            WebkitLineClamp: simple ? 3 : 1,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {simple ? title : (topWord ? topWord.toUpperCase() : '')}
        </span>
      </div>
    </Link>
  )
}
