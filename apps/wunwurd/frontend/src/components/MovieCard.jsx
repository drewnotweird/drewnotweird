import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { apiFetch } from '../api'


export default function MovieCard({ movie, simple = false }) {
  const [topHovered, setTopHovered] = useState(false)
  const [bottomHovered, setBottomHovered] = useState(false)
  const [topWord, setTopWord] = useState(null)
  const [wordFetched, setWordFetched] = useState(false)

  const backdropPath = movie.backdrop_path || movie.backdropPath
  const imageUrl = backdropPath ? `https://image.tmdb.org/t/p/w780${backdropPath}` : null
  const tmdbId = movie.tmdbId || movie.id
  const title = movie.title || movie.name || ''

  useEffect(() => {
    if (simple) return
    async function fetchWunwurd() {
      if (!wordFetched) {
        setWordFetched(true)
        try {
          const r = await apiFetch(`/api/movies/${tmdbId}/wunwurds`, {})
          const data = await r.json()
          setTopWord(data.topWord || null)
        } catch {}
      }
    }
    fetchWunwurd()
  }, [tmdbId, wordFetched, simple])

  if (simple) {
    return (
      <Link to={`/movie/${tmdbId}`} className="relative overflow-hidden bg-gray-900 aspect-square block">
        {imageUrl ? (
          <img src={imageUrl} alt={title} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full bg-gray-800" />
        )}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)' }}
        />
        <div className="absolute bottom-0 left-0 right-0 h-1/2 flex items-center justify-center p-3">
          <span
            className="font-bold uppercase w-full block text-center text-white"
            style={{ fontSize: 'clamp(1.75rem, 5vw, 2.75rem)', lineHeight: 0.85, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
          >
            {title}
          </span>
        </div>
      </Link>
    )
  }

  return (
    <div className="relative overflow-hidden bg-gray-900 aspect-square">
      {imageUrl ? (
        <img src={imageUrl} alt={title} className="w-full h-full object-cover" loading="lazy" />
      ) : (
        <div className="w-full h-full bg-gray-800" />
      )}

      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0 transition-opacity duration-300"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 100%)', opacity: 1 }}
        />
        <div
          className="absolute inset-0 transition-opacity duration-300"
          style={{
            background: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)',
            opacity: topHovered ? 1 : 0,
          }}
        />
        <div
          className="absolute inset-0 transition-opacity duration-300"
          style={{
            background: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)',
            opacity: bottomHovered ? 1 : 0,
          }}
        />
      </div>

      <div className="absolute inset-0 flex flex-col">
        <Link
          to={`/movie/${tmdbId}`}
          className="flex-1 flex items-center justify-center p-3 w-full cursor-pointer"
          onMouseEnter={() => setTopHovered(true)}
          onMouseLeave={() => setTopHovered(false)}
        >
          <span
            className="font-bold uppercase leading-none w-full text-center"
            style={{ fontSize: 'clamp(1.25rem, 5vw, 2.75rem)', lineHeight: 0.85, opacity: topHovered ? 1 : 0, color: '#FF1493', transition: 'opacity 0.3s', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
          >
            {title}
          </span>
        </Link>

        <Link
          to={`/movie/${tmdbId}`}
          className="flex-1 flex items-center justify-center p-3 w-full cursor-pointer transition-opacity duration-300"
          style={{ opacity: topHovered ? 0 : 1 }}
          onMouseEnter={() => setBottomHovered(true)}
          onMouseLeave={() => setBottomHovered(false)}
        >
          {topWord && (
            <span
              className="font-bold uppercase leading-none w-full text-center"
              style={{ fontSize: 'clamp(1.75rem, 5vw, 2.75rem)', lineHeight: 0.85, opacity: 1, color: bottomHovered ? '#FF1493' : '#ffffff', transition: 'color 0.4s', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
            >
              {topWord.toUpperCase()}
            </span>
          )}
        </Link>
      </div>
    </div>
  )
}
