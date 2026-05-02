import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import WordCloud from '../components/WordCloud'
import WunwurdModal from '../components/WunwurdModal'
import { apiFetch } from '../api'

export default function MovieDetail() {
  const { tmdbId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [movie, setMovie] = useState(null)
  const [wunwurds, setWunwurds] = useState({ words: [], topWord: null, userWord: null })
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      apiFetch(`/api/movies/${tmdbId}`, {}).then((r) => r.json()),
      apiFetch(`/api/movies/${tmdbId}/wunwurds`, {}).then((r) => r.json()),
    ])
      .then(([movieData, wData]) => {
        setMovie(movieData)
        setWunwurds(wData)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [tmdbId])

  function handleWunwurdClick() {
    if (!user) {
      navigate(`/login?from=/movie/${tmdbId}`)
    } else {
      setShowModal(true)
    }
  }

  function handleSuccess(submittedWord) {
    setShowModal(false)
    // Optimistic update
    setWunwurds((prev) => {
      let updated = [...prev.words]

      // Remove count from old user word
      if (prev.userWord && prev.userWord !== submittedWord) {
        updated = updated
          .map((w) =>
            w.word === prev.userWord ? { ...w, count: w.count - 1 } : w
          )
          .filter((w) => w.count > 0)
      }

      // Add or increment new word
      const existing = updated.find((w) => w.word === submittedWord)
      if (existing) {
        updated = updated.map((w) =>
          w.word === submittedWord ? { ...w, count: w.count + 1 } : w
        )
      } else {
        updated = [...updated, { word: submittedWord, count: 1 }]
      }

      updated.sort((a, b) => b.count - a.count)
      return {
        words: updated,
        topWord: updated[0]?.word || null,
        userWord: submittedWord,
      }
    })
  }

  async function handleDelete() {
    await apiFetch(`/api/movies/${tmdbId}/wunwurds`, {
      method: 'DELETE',
      
    })
    setWunwurds((prev) => {
      const updated = prev.words
        .map((w) =>
          w.word === prev.userWord ? { ...w, count: w.count - 1 } : w
        )
        .filter((w) => w.count > 0)
      return {
        words: updated,
        topWord: updated[0]?.word || null,
        userWord: null,
      }
    })
  }

  if (loading) {
    return (
      <div>
        {/* Hero skeleton — matches actual hero dimensions */}
        <div className="relative bg-gray-800 animate-pulse" style={{ minHeight: '320px', maxHeight: '600px', height: '70vw' }}>
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
          <div className="absolute inset-0 flex flex-col items-end justify-end px-6 pb-6">
            <div className="w-full text-center space-y-3">
              <div className="h-5 bg-gray-600 w-40 mx-auto" />
              <div className="h-24 bg-gray-600 w-1/2 mx-auto" />
            </div>
          </div>
        </div>

        {/* Body skeleton — centred to match actual layout */}
        <div className="px-4 pt-0 pb-6 max-w-2xl mx-auto">
          <div className="h-14 bg-gray-800 animate-pulse w-full mt-0" />
          <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 justify-center py-4">
            {[120, 90, 140, 80, 110, 70, 100].map((w, i) => (
              <div key={i} className="h-10 bg-gray-800 animate-pulse" style={{ width: w }} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!movie || movie.error) {
    return (
      <p className="text-center py-16 text-gray-400 uppercase">
        Movie not found.
      </p>
    )
  }

  function formatRuntime(mins) {
    const h = Math.floor(mins / 60)
    const m = mins % 60
    return h ? `${h}h ${m}m` : `${m}m`
  }

  const backdropUrl = movie.backdropPath
    ? `https://image.tmdb.org/t/p/original${movie.backdropPath}`
    : null
  const totalVotes = wunwurds.words.reduce((s, w) => s + w.count, 0)

  return (
    <div>
      {/* Backdrop hero */}
      <div className="relative overflow-hidden bg-gray-900" style={{ minHeight: '320px', maxHeight: '600px', height: '70vw' }}>
        {backdropUrl && (
          <img
            src={backdropUrl}
            alt={movie.title}
            className="w-full h-full object-cover"
            style={{ position: 'absolute', inset: 0 }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />

        {/* Content over backdrop */}
        <div className="absolute inset-0 flex flex-col items-end justify-end px-6 pb-6 text-center"
          style={{ animation: 'fadeIn 600ms ease both' }}>
          <div className="w-full">
            <h1
              className="text-white font-bold uppercase leading-none drop-shadow-lg"
              style={{ fontSize: 'clamp(1.25rem, 5vw, 3rem)' }}
            >
              {movie.title}
            </h1>
            {movie.year && (
              <p className="text-gray-400 font-bold uppercase mb-2 drop-shadow-lg" style={{ fontSize: 'clamp(0.75rem, 2vw, 1rem)' }}>
                {movie.year}
              </p>
            )}

            {wunwurds.topWord && (
              <Link
                to={`/word/${wunwurds.topWord}`}
                className="text-[#FF1493] font-bold uppercase leading-none drop-shadow-lg hover:text-white transition-colors"
                style={{ fontSize: 'clamp(3rem, 15vw, 8rem)' }}
              >
                {wunwurds.topWord.toUpperCase()}
              </Link>
            )}

            {!wunwurds.topWord && (
              <p className="text-gray-400 uppercase text-base">
                NO WUNWURDS YET
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-4 pt-0 pb-6 max-w-2xl mx-auto">
        {/* CTA button — hidden once user has submitted */}
        {!(user && wunwurds.userWord) && (
          <button
            onClick={handleWunwurdClick}
            className="w-full bg-[#FF1493] text-black font-bold text-2xl uppercase py-4 hover:bg-white transition-colors"
            style={{ animation: 'fadeInUp 400ms ease both', animationDelay: '150ms' }}
          >
            + WUNWURD!
          </button>
        )}

        {/* User's existing submission */}
        {user && wunwurds.userWord && (
          <div className="mt-4 flex items-center justify-between border-2 border-[#FF1493] px-4 py-3"
            style={{ animation: 'fadeInUp 400ms ease both', animationDelay: '150ms' }}>
            <div>
              <span className="text-gray-500 text-xs uppercase block">
                YOUR WUNWURD
              </span>
              <span className="text-[#FF1493] font-bold text-3xl uppercase">
                {wunwurds.userWord.toUpperCase()}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowModal(true)}
                className="text-white text-xs uppercase border border-white px-3 py-2 hover:border-[#FF1493] hover:text-[#FF1493] transition-colors"
              >
                EDIT
              </button>
              <button
                onClick={handleDelete}
                className="text-gray-400 text-xs uppercase border border-gray-500 px-3 py-2 hover:border-red-500 hover:text-red-500 transition-colors"
              >
                REMOVE
              </button>
            </div>
          </div>
        )}

        {/* Word cloud */}
        <div className="mt-10" style={{ animation: 'fadeInUp 500ms ease both', animationDelay: '250ms' }}>
          <WordCloud words={wunwurds.words.slice(1)} userWord={wunwurds.userWord} />
        </div>

        {/* Movie info */}
        {(movie.overview || movie.genres?.length > 0 || movie.director || movie.cast?.length > 0) && (
          <div className="mt-10 border-t border-gray-800 pt-8 space-y-8 text-center"
            style={{ animation: 'fadeInUp 500ms ease both', animationDelay: '350ms' }}>

            {/* Overview */}
            {movie.overview && (
              <div>
                {movie.tagline && (
                  <p className="text-[#FF1493] font-bold uppercase text-sm mb-3 tracking-wide">{movie.tagline}</p>
                )}
                <p className="text-gray-300 leading-relaxed text-base">{movie.overview}</p>
              </div>
            )}

            {/* Genres + runtime + rating */}
            {(movie.genres?.length > 0 || movie.runtime || movie.voteAverage) && (
              <div className="flex flex-wrap gap-2 justify-center">
                {movie.runtime > 0 && (
                  <span className="border border-gray-600 text-white font-bold uppercase text-xs px-3 py-1.5 tracking-wide">
                    {formatRuntime(movie.runtime)}
                  </span>
                )}
                {movie.voteAverage > 0 && (
                  <span className="border border-gray-600 text-white font-bold uppercase text-xs px-3 py-1.5 tracking-wide">
                    ★ {movie.voteAverage.toFixed(1)}
                  </span>
                )}
                {movie.genres?.map(g => (
                  <span key={g} className="bg-[#FF1493] text-black font-bold uppercase text-xs px-3 py-1.5 tracking-wide">
                    {g}
                  </span>
                ))}
              </div>
            )}

            {/* Director */}
            {movie.director && (
              <div>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Director</p>
                <p className="text-white font-bold uppercase text-lg">{movie.director}</p>
              </div>
            )}

            {/* Cast — horizontal scroll photo cards */}
            {movie.cast?.length > 0 && (
              <div>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-3">Cast</p>
                <div className="overflow-x-auto -mx-4 pb-2 text-center" style={{ scrollbarWidth: 'none' }}>
                  <div className="inline-flex gap-3 px-4">
                    {movie.cast.map((person, i) => (
                      <div key={i} className="flex-shrink-0 w-[72px] text-center">
                        {person.profilePath
                          ? <img
                              src={`https://image.tmdb.org/t/p/w185${person.profilePath}`}
                              alt={person.name}
                              className="w-[72px] h-[108px] object-cover object-top bg-gray-900"
                            />
                          : <div className="w-[72px] h-[108px] bg-gray-900 flex items-center justify-center">
                              <span className="text-gray-600 font-bold text-2xl uppercase">{person.name[0]}</span>
                            </div>
                        }
                        <p className="text-white font-bold uppercase text-xs mt-1.5 leading-tight" style={{ wordBreak: 'break-word' }}>{person.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* Onwards */}
        <div className="mt-8 border-t border-gray-800 pt-8 space-y-6 pb-4 text-center"
          style={{ animation: 'fadeInUp 500ms ease both', animationDelay: '450ms' }}>

          {/* Where to watch */}
          {movie.watch && (movie.watch.stream?.length > 0 || movie.watch.rent?.length > 0) && (
            <div>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-3">Where to Watch</p>
              <div className="flex flex-wrap gap-4 justify-center">
                {[...movie.watch.stream, ...movie.watch.rent.filter(r => !movie.watch.stream.find(s => s.name === r.name))].map(p => (
                  <a key={p.name} href={movie.watch.link} target="_blank" rel="noopener noreferrer"
                    className="flex flex-col items-center gap-1.5 group">
                    {p.logoPath
                      ? <img src={`https://image.tmdb.org/t/p/w92${p.logoPath}`} alt={p.name}
                          className="w-10 h-10 rounded-lg group-hover:opacity-80 transition-opacity" />
                      : <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">{p.name[0]}</span>
                        </div>
                    }
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* External links */}
          <div className="flex gap-3 justify-center">
            {movie.imdbId && (
              <a href={`https://www.imdb.com/title/${movie.imdbId}`} target="_blank" rel="noopener noreferrer"
                className="border border-gray-600 text-gray-400 font-bold uppercase text-xs px-4 py-2.5 hover:border-white hover:text-white transition-colors tracking-wide">
                IMDb ↗
              </a>
            )}
            <a href={`https://www.themoviedb.org/movie/${tmdbId}`} target="_blank" rel="noopener noreferrer"
              className="border border-gray-600 text-gray-400 font-bold uppercase text-xs px-4 py-2.5 hover:border-white hover:text-white transition-colors tracking-wide">
              TMDB ↗
            </a>
          </div>

        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <WunwurdModal
          tmdbId={tmdbId}
          existingWord={wunwurds.userWord}
          onClose={() => setShowModal(false)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  )
}
