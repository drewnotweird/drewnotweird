import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { apiFetch } from '../api'

const KEY_STORAGE = 'ww_lab_key'

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

function StatBox({ label, value, sub }) {
  return (
    <div className="border border-gray-800 p-5">
      <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">{label}</p>
      <p className="text-white font-black text-4xl leading-none">{value}</p>
      {sub && <p className="text-gray-500 text-xs mt-1">{sub}</p>}
    </div>
  )
}

export default function Lab() {
  const [key, setKey] = useState(() => localStorage.getItem(KEY_STORAGE) || '')
  const [input, setInput] = useState('')
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  function load(k) {
    setLoading(true)
    setError(null)
    apiFetch(`/api/stats?key=${encodeURIComponent(k)}`)
      .then((r) => {
        if (r.status === 403) throw new Error('Wrong key')
        if (!r.ok) throw new Error('Server error')
        return r.json()
      })
      .then((data) => {
        localStorage.setItem(KEY_STORAGE, k)
        setKey(k)
        setStats(data)
        setLoading(false)
      })
      .catch((e) => {
        localStorage.removeItem(KEY_STORAGE)
        setKey('')
        setError(e.message)
        setLoading(false)
      })
  }

  useEffect(() => {
    if (key) load(key)
  }, [])

  if (!key || error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <h1 className="text-[#FF1493] font-black uppercase text-4xl mb-8 text-center">STATS</h1>
          {error && <p className="text-red-400 text-sm text-center mb-4">{error}</p>}
          <input
            type="password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && input && load(input)}
            placeholder="Key"
            autoFocus
            className="w-full bg-transparent border-2 border-gray-700 text-white px-4 py-3 text-lg font-bold uppercase focus:border-[#FF1493] outline-none mb-4"
          />
          <button
            onClick={() => input && load(input)}
            disabled={loading || !input}
            className="w-full bg-[#FF1493] text-black font-bold uppercase py-3 text-lg hover:bg-white transition-colors disabled:opacity-40"
          >
            {loading ? '...' : 'ENTER'}
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return <div className="text-center py-32 text-gray-500 uppercase text-sm">Loading...</div>
  }

  if (!stats) return null

  const { users, wunwurds, movies } = stats

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-12">

      <div className="flex items-baseline justify-between">
        <h1 className="text-[#FF1493] font-black uppercase text-5xl">STATS</h1>
        <button
          onClick={() => { localStorage.removeItem(KEY_STORAGE); setKey(''); setStats(null); setInput('') }}
          className="text-gray-600 text-xs uppercase hover:text-gray-400 transition-colors"
        >
          Lock
        </button>
      </div>

      {/* Overview */}
      <section>
        <h2 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-4">Overview</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <StatBox label="Total users" value={users.total} sub={`${users.active} have submitted`} />
          <StatBox label="Wunwurds" value={wunwurds.total} />
          <StatBox label="Distinct words" value={wunwurds.distinctWords} />
          <StatBox label="Movies in DB" value={movies.total} sub={`${movies.withWunwurds} with wunwurds`} />
        </div>
      </section>

      {/* Last submission */}
      {wunwurds.last && (
        <section>
          <h2 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-4">Last submission</h2>
          <div className="border border-gray-800 p-5">
            <p className="text-[#FF1493] font-black uppercase text-3xl leading-none mb-1">
              {wunwurds.last.word.toUpperCase()}
            </p>
            <p className="text-white text-sm">
              <Link to={`/movie/${wunwurds.last.tmdbId}`} className="hover:text-[#FF1493] transition-colors">
                {wunwurds.last.movie}
              </Link>
              {' '}— by <span className="text-gray-300">{wunwurds.last.by}</span>
            </p>
            <p className="text-gray-500 text-xs mt-1">
              {timeAgo(wunwurds.last.at)} · {formatDate(wunwurds.last.at)}
            </p>
          </div>
        </section>
      )}

      {/* Top words */}
      <section>
        <h2 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-4">Top words</h2>
        <div className="space-y-1">
          {wunwurds.topWords.map((w, i) => {
            const pct = Math.round((w.count / wunwurds.topWords[0].count) * 100)
            return (
              <Link key={w.word} to={`/word/${w.word}`} className="flex items-center gap-3 group">
                <span className="text-gray-600 text-xs w-4 text-right">{i + 1}</span>
                <div className="flex-1 relative h-8 flex items-center">
                  <div
                    className="absolute inset-y-0 left-0 bg-gray-900 group-hover:bg-gray-800 transition-colors"
                    style={{ width: `${pct}%` }}
                  />
                  <span className="relative text-white font-bold uppercase text-sm px-2">
                    {w.word}
                  </span>
                </div>
                <span className="text-gray-400 text-sm font-bold w-8 text-right">{w.count}</span>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Top movies */}
      <section>
        <h2 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-4">Most wunwurded films</h2>
        <div className="space-y-2">
          {movies.top.map((m, i) => (
            <div key={m.tmdbId} className="flex items-center gap-3">
              <span className="text-gray-600 text-xs w-4 text-right">{i + 1}</span>
              <Link
                to={`/movie/${m.tmdbId}`}
                className="flex-1 text-white font-bold uppercase text-sm hover:text-[#FF1493] transition-colors"
              >
                {m.title}
              </Link>
              <span className="text-gray-400 text-sm font-bold">{m.wunwurdCount}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Users */}
      <section>
        <h2 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-4">
          Users <span className="text-gray-700 normal-case font-normal">— sorted by wunwurds</span>
        </h2>
        <div className="space-y-px">
          {users.list.map((u) => (
            <div key={u.id} className="flex items-center gap-3 py-2.5 border-b border-gray-900">
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold uppercase text-sm">{u.username}</p>
                <p className="text-gray-600 text-xs truncate">{u.email}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[#FF1493] font-bold text-sm">
                  {u.wunwurdCount} {u.wunwurdCount === 1 ? 'word' : 'words'}
                </p>
                <p className="text-gray-600 text-xs">{formatDate(u.joinedAt)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  )
}
