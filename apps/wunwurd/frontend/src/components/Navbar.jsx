import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useDebounce } from '../hooks/useDebounce'
import { apiFetch } from '../api'

function SearchIcon({ size }) {
  return (
    <svg width={size} height={size} fill="none" stroke="black" strokeWidth="2.5" viewBox="0 0 24 24"
      style={{ transition: 'width 0.35s ease, height 0.35s ease' }}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

function CloseIcon({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5"
      style={{ transition: 'width 0.35s ease, height 0.35s ease' }}>
      <line x1="4" y1="4" x2="20" y2="20" />
      <line x1="20" y1="4" x2="4" y2="20" />
    </svg>
  )
}

function ProfileIcon({ size }) {
  return (
    <svg width={size} height={size} fill="none" stroke="black" strokeWidth="2.5" viewBox="0 0 24 24"
      style={{ transition: 'width 0.35s ease, height 0.35s ease' }}>
      <circle cx="12" cy="8" r="4" fill="none" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="square" />
    </svg>
  )
}

function LoginIcon({ size }) {
  return (
    <svg width={size} height={size} fill="none" stroke="black" strokeWidth="2.5" viewBox="0 0 24 24"
      style={{ transition: 'width 0.35s ease, height 0.35s ease' }}>
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" strokeLinecap="square" />
      <polyline points="10 17 15 12 10 7" />
      <line x1="15" y1="12" x2="3" y2="12" />
    </svg>
  )
}

function InfoIcon({ size }) {
  return (
    <svg width={size} height={size} fill="none" stroke="black" strokeWidth="2.5" viewBox="0 0 24 24"
      style={{ transition: 'width 0.35s ease, height 0.35s ease' }}>
      <circle cx="12" cy="12" r="9" />
      <line x1="12" y1="11" x2="12" y2="16" strokeLinecap="square" />
      <line x1="12" y1="8" x2="12.01" y2="8" strokeLinecap="round" strokeWidth="3" />
    </svg>
  )
}

const SCROLL_THRESHOLD = 140

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const isHome = location.pathname === '/'

  const [scrollY, setScrollY] = useState(0)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const debouncedQuery = useDebounce(query, 300)
  const inputRef = useRef(null)
  const searchContainerRef = useRef(null)

  // Track scroll
  useEffect(() => {
    const h = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', h, { passive: true })
    h()
    return () => window.removeEventListener('scroll', h)
  }, [])

  // Fetch search results
  useEffect(() => {
    if (!debouncedQuery.trim()) { setResults([]); setLoading(false); return }
    setLoading(true)
    apiFetch(`/api/movies/search?q=${encodeURIComponent(debouncedQuery)}`, {})
      .then(r => r.json())
      .then(data => { setResults(Array.isArray(data) ? data.slice(0, 8) : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [debouncedQuery])

  useEffect(() => {
    if (searchOpen) setTimeout(() => inputRef.current?.focus(), 50)
    else { setQuery(''); setResults([]) }
  }, [searchOpen])

  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') closeSearch() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [])

  useEffect(() => {
    const h = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) closeSearch()
    }
    if (searchOpen) document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [searchOpen])

  function closeSearch() { setSearchOpen(false); setQuery(''); setResults([]) }
  function handleResultClick(movie) { navigate(`/movie/${movie.id}`); closeSearch() }
  function handleProfileClick() {
    if (user) {
      navigate('/profile')
    } else {
      const dest = location.pathname.startsWith('/movie/') ? location.pathname : '/profile'
      navigate(`/login?from=${encodeURIComponent(dest)}`)
    }
  }

  // Scroll progress: 0 = at top of home page, 1 = scrolled / not home page
  const progress = isHome ? Math.min(1, scrollY / SCROLL_THRESHOLD) : 1

  // Icon size interpolates from 42px → 28px
  const iconSize = Math.round(42 - progress * 14)

  // Navbar height interpolates from 64px → 52px
  const navHeight = Math.round(64 - progress * 12)

  // Logo in navbar: fades in from progress 0.4 → 1.0
  const logoOpacity = Math.max(0, (progress - 0.4) / 0.6)
  const logoScale = 0.75 + logoOpacity * 0.25

  const showDropdown = searchOpen && (loading || results.length > 0 || (query.trim() && !loading))

  return (
    <>
      <nav className="sticky top-0 z-50 bg-[#FF1493]" style={{ height: `${navHeight}px`, borderBottom: `${Math.round(progress * 4)}px solid black`, transition: 'height 0.35s ease, border-bottom-width 0.35s ease' }}>
        <div className="flex items-center h-full px-4 gap-3">

          {/* Left — search */}
          <button
            className="flex items-center justify-center flex-shrink-0"
            style={{ width: `${iconSize + 8}px`, height: `${iconSize + 8}px` }}
            onClick={() => navigate('/search-words')}
            aria-label="Search"
          >
            <SearchIcon size={iconSize} />
          </button>

          {/* Centre — logo (hidden at top of home, fades in on scroll) */}
          <div className="flex-1 flex justify-center" ref={searchContainerRef}>
            {searchOpen ? (
              <div className="relative w-full">
                <input
                  ref={inputRef}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="SEARCH MOVIES..."
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  className="w-full bg-transparent border-b-2 border-black text-black font-bold uppercase text-xl px-1 py-1 outline-none placeholder-black/40"
                />
                {showDropdown && (
                  <div className="absolute top-full left-0 right-0 bg-black border-2 border-t-0 border-[#FF1493] z-50 max-h-[75vh] overflow-y-auto">
                    {loading && (
                      <div className="divide-y divide-gray-900">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <div key={i} className="flex items-center gap-4 px-4 py-3 animate-pulse">
                            <div className="w-14 h-20 bg-gray-900 flex-shrink-0" />
                            <div className="flex-1 space-y-3">
                              <div className="h-5 bg-gray-900 w-3/4" />
                              <div className="h-4 bg-gray-900 w-1/4" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {!loading && results.length > 0 && (
                      <div className="divide-y divide-gray-900">
                        {results.map(movie => {
                          const poster = movie.poster_path ? `https://image.tmdb.org/t/p/w185${movie.poster_path}` : null
                          const year = movie.release_date?.slice(0, 4)
                          return (
                            <button key={movie.id} onMouseDown={() => handleResultClick(movie)}
                              className="w-full flex items-center gap-4 px-4 py-3 hover:bg-gray-900 transition-colors text-left">
                              {poster
                                ? <img src={poster} alt={movie.title} className="w-14 h-20 object-cover flex-shrink-0" />
                                : <div className="w-14 h-20 bg-gray-800 flex-shrink-0" />}
                              <div className="flex-1 min-w-0">
                                <p className="text-white font-bold text-xl uppercase leading-none truncate">{movie.title}</p>
                                {year && <p className="text-[#FF1493] text-base font-bold mt-1">{year}</p>}
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    )}
                    {!loading && results.length === 0 && query.trim() && (
                      <p className="text-gray-400 text-base uppercase text-center py-8 px-4">
                        NO RESULTS FOR "{query.trim().toUpperCase()}"
                      </p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/"
                style={{
                  opacity: logoOpacity,
                  transform: `scale(${logoScale})`,
                  transition: 'opacity 0.35s ease, transform 0.35s ease',
                  pointerEvents: logoOpacity < 0.2 ? 'none' : 'auto',
                }}
                className="text-black font-bold text-2xl uppercase leading-none"
              >
                WUNWURD
              </Link>
            )}
          </div>

          {/* Right — about + profile/login */}
          <button
            className="flex items-center justify-center flex-shrink-0"
            style={{ width: `${iconSize + 8}px`, height: `${iconSize + 8}px` }}
            onClick={() => navigate('/about')}
            aria-label="About"
          >
            <InfoIcon size={iconSize} />
          </button>
          <button
            className="flex items-center justify-center flex-shrink-0"
            style={{ width: `${iconSize + 8}px`, height: `${iconSize + 8}px` }}
            onClick={handleProfileClick}
            aria-label={user ? 'Profile' : 'Log in'}
          >
            {user ? <ProfileIcon size={iconSize} /> : <LoginIcon size={iconSize} />}
          </button>
        </div>
      </nav>

      {searchOpen && (
        <div className="fixed inset-0 bg-black/60 z-40" style={{ top: `${navHeight}px` }}
          onMouseDown={closeSearch} />
      )}
    </>
  )
}
