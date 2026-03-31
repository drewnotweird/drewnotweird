import { useEffect, useRef, useState } from 'react'
import { TRACKS } from '../data/tracks.js'

export function useAudioPlayer() {
  const [activeIndex, setActiveIndex] = useState(null)
  const audioRef = useRef(null)
  const activeIndexRef = useRef(null)
  const analyserRef = useRef(null)
  const dataRef = useRef(new Uint8Array(128))
  const contextRef = useRef(null)

  useEffect(() => {
    const audio = new Audio()
    audio.preload = 'none'
    audio.crossOrigin = 'anonymous'
    audioRef.current = audio

    const onEnded = () => {
      const current = activeIndexRef.current
      if (current === null) return
      playTrack((current + 1) % TRACKS.length)
    }
    audio.addEventListener('ended', onEnded)

    return () => {
      audio.removeEventListener('ended', onEnded)
      audio.pause()
      audio.src = ''
      contextRef.current?.close()
    }
  }, [])

  const ensureAnalyser = () => {
    if (analyserRef.current) return
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const analyser = ctx.createAnalyser()
    analyser.fftSize = 256
    analyser.smoothingTimeConstant = 0.75
    const source = ctx.createMediaElementSource(audioRef.current)
    source.connect(analyser)
    analyser.connect(ctx.destination)
    contextRef.current = ctx
    analyserRef.current = analyser
    dataRef.current = new Uint8Array(analyser.frequencyBinCount)
  }

  const getAudioData = () => {
    if (!analyserRef.current) return null
    analyserRef.current.getByteFrequencyData(dataRef.current)
    return dataRef.current
  }

  const playTrack = (index) => {
    const audio = audioRef.current
    if (!audio) return
    ensureAnalyser()
    contextRef.current?.resume()
    audio.pause()
    audio.src = TRACKS[index].previewUrl
    audio.currentTime = 0
    audio.play().catch(() => {})
    activeIndexRef.current = index
    setActiveIndex(index)
  }

  const stopTrack = () => {
    const audio = audioRef.current
    if (!audio) return
    audio.pause()
    audio.currentTime = 0
    activeIndexRef.current = null
    setActiveIndex(null)
  }

  const toggle = (index) => {
    if (activeIndexRef.current === index) stopTrack()
    else playTrack(index)
  }

  return { activeIndex, toggle, getAudioData }
}
