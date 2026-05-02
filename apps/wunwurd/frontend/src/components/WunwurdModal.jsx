import React, { useState, useEffect, useRef } from 'react'
import { apiFetch } from '../api'

export default function WunwurdModal({ tmdbId, existingWord, onClose, onSuccess }) {
  const [word, setWord] = useState(existingWord ? existingWord.toUpperCase() : '')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const inputRef = useRef(null)

  // Lock body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    inputRef.current?.focus()
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  // Close on Escape
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  function handleInput(e) {
    const cleaned = e.target.value.replace(/[^a-zA-Z]/g, '').slice(0, 30)
    setWord(cleaned.toUpperCase())
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const trimmed = word.trim()
    if (!trimmed) return setError('Type a word first!')
    if (trimmed.includes(' ')) return setError('ONE word only — no spaces!')
    if (trimmed.length < 3) return setError('At least 3 letters!')

    setLoading(true)
    try {
      const r = await apiFetch(`/api/movies/${tmdbId}/wunwurds`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        
        body: JSON.stringify({ word: trimmed.toLowerCase() }),
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data.error)
      onSuccess(trimmed.toLowerCase())
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center px-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <form onSubmit={handleSubmit} className="w-full max-w-sm">
        <h2 className="text-[#FF1493] font-bold text-3xl uppercase mb-10 text-center">
          {existingWord ? 'CHANGE YOUR WUNWURD' : '+ WUNWURD!'}
        </h2>

        <input
          ref={inputRef}
          value={word}
          onChange={handleInput}
          placeholder="TYPE ONE WORD"
          maxLength={30}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="characters"
          spellCheck={false}
          className="w-full bg-transparent border-b-2 border-[#FF1493] text-white font-bold text-5xl uppercase text-center py-3 outline-none placeholder-gray-800 mb-2"
        />

        {error && (
          <p className="text-red-500 text-sm uppercase text-center mt-3">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !word.trim()}
          className="w-full bg-[#FF1493] text-black font-bold text-xl uppercase py-4 mt-8 disabled:opacity-30 hover:bg-white transition-colors"
        >
          {loading ? 'SUBMITTING...' : 'SUBMIT WUNWURD'}
        </button>

        <button
          type="button"
          onClick={onClose}
          className="w-full text-gray-400 uppercase text-sm py-4 hover:text-white transition-colors"
        >
          CANCEL
        </button>
      </form>
    </div>
  )
}
