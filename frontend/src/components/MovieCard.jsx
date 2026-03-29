import { Link } from 'react-router-dom'

export default function MovieCard({ movie }) {
  const backdropPath = movie.backdrop_path || movie.backdropPath
  const imageUrl = backdropPath ? `https://image.tmdb.org/t/p/w780${backdropPath}` : null
  const tmdbId = movie.tmdbId || movie.id
  const title = movie.title || movie.name || ''

  return (
    <Link to={`/movie/${tmdbId}`} className="relative overflow-hidden bg-gray-900 aspect-[2/3] block">
      {/* Image */}
      {imageUrl ? (
        <img src={imageUrl} alt={title} className="w-full h-full object-cover" loading="lazy" />
      ) : (
        <div className="w-full h-full bg-gray-800" />
      )}

      {/* Gradient overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 60%)' }}
      />

      {/* Title always visible at bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <span
          className="font-bold uppercase leading-none break-words w-full block text-center text-white"
          style={{ fontSize: 'clamp(1.25rem, 5vw, 2.75rem)', overflowWrap: 'break-word', wordBreak: 'break-word' }}
        >
          {title}
        </span>
      </div>
    </Link>
  )
}
