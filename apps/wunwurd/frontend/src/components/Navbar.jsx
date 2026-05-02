import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useDebounce } from '../hooks/useDebounce'
import { apiFetch } from '../api'

const svgStyle = { transition: 'width 0.35s ease, height 0.35s ease' }

function SearchIcon({ size }) {
  return (
    <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" style={svgStyle}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

function CloseIcon({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={svgStyle}>
      <line x1="4" y1="4" x2="20" y2="20" />
      <line x1="20" y1="4" x2="4" y2="20" />
    </svg>
  )
}

function ProfileIcon({ size }) {
  return (
    <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" style={svgStyle}>
      <circle cx="12" cy="8" r="4" fill="none" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="square" />
    </svg>
  )
}

function LoginIcon({ size }) {
  return (
    <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" style={svgStyle}>
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" strokeLinecap="square" />
      <polyline points="10 17 15 12 10 7" />
      <line x1="15" y1="12" x2="3" y2="12" />
    </svg>
  )
}

function RandomIcon({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={svgStyle}>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="15.5" cy="8.5" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="8.5" cy="15.5" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="15.5" cy="15.5" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  )
}

function InfoIcon({ size }) {
  return (
    <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" style={svgStyle}>
      <circle cx="12" cy="12" r="9" />
      <line x1="12" y1="11" x2="12" y2="16" strokeLinecap="square" />
      <line x1="12" y1="8" x2="12.01" y2="8" strokeLinecap="round" strokeWidth="3" />
    </svg>
  )
}

const SCROLL_THRESHOLD = 320

export default function Navbar() {
  const { user, logout, serverReady } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const isHome = location.pathname === '/'

  const [scrollY, setScrollY] = useState(0)
  const [searchOpen, setSearchOpen] = useState(false)
  const [randomLoading, setRandomLoading] = useState(false)
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

  async function handleRandom() {
    if (randomLoading) return
    setRandomLoading(true)
    try {
      const r = await apiFetch('/api/movies/random', {})
      const data = await r.json()
      if (data.tmdbId) navigate(`/movie/${data.tmdbId}`)
    } catch {}
    setRandomLoading(false)
  }

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

  // At progress=0 (top of home): icons spread equally, no gap, spacer gone
  // At progress=1 (scrolled/non-home): icons at natural size, spacer fills centre, gap=12px
  const iconGrow = 1 - progress
  const spacerGrow = progress * 3
  const iconGap = progress * 12

  // Tooltip appears above icon when expanded, below when minimised
  const tooltipAbove = progress < 0.5
  const tooltipStyle = tooltipAbove
    ? { bottom: '100%', marginBottom: '4px', fontSize: '13px' }
    : { top: '100%', marginTop: '4px', fontSize: '10px' }

  return (
    <>
      <nav className="sticky top-0 z-50 bg-[#FF1493]" style={{ height: `${navHeight}px`, borderBottom: `${Math.round(progress * 8)}px solid black`, transition: 'height 0.35s ease, border-bottom-width 0.35s ease' }}>

        {/* Icon row — buttons grow to fill equally when expanded, shrink to sides when minimised */}
        <div className="flex items-center h-full px-4" style={{ gap: `${iconGap}px` }}>
          <button
            className="group relative flex items-center justify-center h-full transition-opacity duration-300 text-black"
            style={{ flexGrow: iconGrow, flexShrink: 1, flexBasis: 'auto', minWidth: `${iconSize + 8}px`, opacity: serverReady ? 1 : 0.35 }}
            onClick={() => navigate('/search')}
            disabled={!serverReady}
            aria-label="Search"
          >
            <div className="transition-transform duration-200 group-hover:scale-110"><SearchIcon size={iconSize} /></div>
            <span className="absolute left-1/2 -translate-x-1/2 hidden md:block font-bold uppercase tracking-wide text-white bg-black px-2 py-0.5 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-150 pointer-events-none whitespace-nowrap" style={tooltipStyle}>SEARCH</span>
          </button>
          <button
            className="group relative flex items-center justify-center h-full transition-opacity duration-300 text-black"
            style={{ flexGrow: iconGrow, flexShrink: 1, flexBasis: 'auto', minWidth: `${iconSize + 8}px`, opacity: serverReady ? 1 : 0.35 }}
            onClick={handleRandom}
            disabled={!serverReady}
            aria-label="Random movie"
          >
            <div className="transition-transform duration-200 group-hover:scale-110">
              {randomLoading
                ? <div style={{ width: iconSize, height: iconSize, border: '2.5px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
                : <RandomIcon size={iconSize} />}
            </div>
            <span className="absolute left-1/2 -translate-x-1/2 hidden md:block font-bold uppercase tracking-wide text-white bg-black px-2 py-0.5 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-150 pointer-events-none whitespace-nowrap" style={tooltipStyle}>RANDOM</span>
          </button>

          {/* Spacer — expands when minimised to push right icons to the right */}
          <div style={{ flexGrow: spacerGrow, flexShrink: 1, flexBasis: 0, minWidth: 0 }} />

          <button
            className="group relative flex items-center justify-center h-full transition-opacity duration-300 text-black"
            style={{ flexGrow: iconGrow, flexShrink: 1, flexBasis: 'auto', minWidth: `${iconSize + 8}px`, opacity: serverReady ? 1 : 0.35 }}
            onClick={() => navigate('/about')}
            disabled={!serverReady}
            aria-label="About"
          >
            <div className="transition-transform duration-200 group-hover:scale-110"><InfoIcon size={iconSize} /></div>
            <span className="absolute left-1/2 -translate-x-1/2 hidden md:block font-bold uppercase tracking-wide text-white bg-black px-2 py-0.5 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-150 pointer-events-none whitespace-nowrap" style={tooltipStyle}>ABOUT</span>
          </button>
          <button
            className="group relative flex items-center justify-center h-full transition-opacity duration-300 text-black"
            style={{ flexGrow: iconGrow, flexShrink: 1, flexBasis: 'auto', minWidth: `${iconSize + 8}px`, opacity: serverReady ? 1 : 0.35 }}
            onClick={handleProfileClick}
            disabled={!serverReady}
            aria-label={user ? 'Profile' : 'Log in'}
          >
            <div className="transition-transform duration-200 group-hover:scale-110">
              {user ? <ProfileIcon size={iconSize} /> : <LoginIcon size={iconSize} />}
            </div>
            <span className="absolute left-1/2 -translate-x-1/2 hidden md:block font-bold uppercase tracking-wide text-white bg-black px-2 py-0.5 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-150 pointer-events-none whitespace-nowrap" style={tooltipStyle}>{user ? 'ACCOUNT' : 'LOGIN'}</span>
          </button>
        </div>

        {/* Logo — absolutely centred, fades in as nav minimises */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" ref={searchContainerRef}>
          {searchOpen ? (
            <div className="relative w-full px-4 pointer-events-auto">
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
      </nav>

      {searchOpen && (
        <div className="fixed inset-0 bg-black/60 z-40" style={{ top: `${navHeight}px` }}
          onMouseDown={closeSearch} />
      )}
    </>
  )
}
