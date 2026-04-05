import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiFetch } from '../api'

export default function Profile() {
  const { user, loading: authLoading, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/')
  }
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login?from=/profile')
      return
    }
    if (user) {
      apiFetch('/api/profile', {})
        .then((r) => r.json())
        .then((data) => {
          setProfile(data)
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }
  }, [user, authLoading])

  async function handleRemove(tmdbId) {
    await apiFetch(`/api/movies/${tmdbId}/wunwurds`, {
      method: 'DELETE',
      
    })
    setProfile((prev) => ({
      ...prev,
      wunwurds: prev.wunwurds.filter((w) => w.movie.tmdbId !== tmdbId),
    }))
  }

  if (authLoading || loading) {
    return (
      <div className="px-4 py-6">
        <div className="h-8 bg-gray-900 animate-pulse w-48 mb-2" />
        <div className="h-4 bg-gray-900 animate-pulse w-32 mb-8" />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-square bg-gray-900 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  const joinDate = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
      })
    : ''
  const count = profile?.wunwurds?.length || 0

  return (
    <div className="px-4 py-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8 border-b-2 border-gray-900 pb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-[#FF1493] font-bold text-4xl uppercase leading-none">
            {profile?.username?.toUpperCase()}
          </h1>
          <p className="text-gray-400 text-base uppercase mt-2">
            MEMBER SINCE {joinDate.toUpperCase()}
          </p>
          <p className="text-gray-400 text-base uppercase mt-1">
            {count} WUNWURD{count !== 1 ? 'S' : ''} SUBMITTED
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="self-start flex-shrink-0 border-2 border-gray-600 text-gray-400 text-sm uppercase px-4 py-2 hover:border-[#FF1493] hover:text-[#FF1493] transition-colors"
        >
          LOG OUT
        </button>
      </div>

      {count === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-400 uppercase text-lg mb-4">
            NO WUNWURDS YET
          </p>
          <Link
            to="/"
            className="text-[#FF1493] uppercase text-sm hover:text-white transition-colors"
          >
            BROWSE MOVIES →
          </Link>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {profile?.wunwurds?.map((w) => {
          const posterUrl = w.movie.backdropPath
            ? `https://image.tmdb.org/t/p/w780${w.movie.backdropPath}`
            : null
          return (
            <div key={w.id} className="relative group">
              <Link
                to={`/movie/${w.movie.tmdbId}`}
                className="block relative aspect-square bg-gray-900 overflow-hidden"
              >
                {posterUrl ? (
                  <img
                    src={posterUrl}
                    alt={w.movie.title}
                    className="w-full h-full object-cover opacity-50"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-800" />
                )}
                {/* Their word overlaid */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span
                    className="text-white font-bold uppercase text-center px-2 drop-shadow-lg leading-none"
                    style={{ fontSize: 'clamp(1.5rem, 5vw, 2.5rem)' }}
                  >
                    {w.word.toUpperCase()}
                  </span>
                </div>
                {/* Movie title at bottom */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2 pt-6">
                  <p className="text-[#FF1493] text-lg uppercase leading-tight font-bold text-center line-clamp-2">
                    {w.movie.title}
                  </p>
                </div>
              </Link>

              {/* Remove button — appears on hover */}
              <button
                onClick={() => handleRemove(w.movie.tmdbId)}
                className="absolute top-2 right-2 bg-black/90 text-gray-500 text-xs px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500 uppercase"
              >
                ✕
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
