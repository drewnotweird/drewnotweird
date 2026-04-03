import { useEffect, useRef, useState } from 'react'
import confetti from 'canvas-confetti'
import './Home.css'

export default function Home() {
  const audioRef = useRef(null)
  const containerRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    // Trigger confetti on load
    triggerConfetti()
  }, [])

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    })
  }

  const handlePlay = () => {
    if (audioRef.current) {
      audioRef.current.play()
      setIsPlaying(true)
      triggerConfetti()
    }
  }

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }

  // Drop "40" GIFs periodically when playing
  useEffect(() => {
    if (!isPlaying) return

    const dropGif = () => {
      if (!containerRef.current) return

      const gif = document.createElement('div')
      gif.className = 'falling-40'
      gif.style.left = Math.random() * 100 + '%'
      gif.style.backgroundImage = 'url(/40.gif)'
      containerRef.current.appendChild(gif)

      setTimeout(() => gif.remove(), 4000)
    }

    const interval = setInterval(dropGif, 1000)
    return () => clearInterval(interval)
  }, [isPlaying])

  return (
    <div className="home" ref={containerRef}>
      {/* Background image */}
      <div className="background" style={{ backgroundImage: 'url(/birthday-bg.jpg)' }} />

      {/* Content overlay */}
      <div className="content">
        <div className="text-box">
          <h1>Happy 40th Birthday! 🎉</h1>
          <p>Let's celebrate with Stevie Wonder</p>
        </div>

        {/* Audio player controls */}
        <div className="controls">
          {!isPlaying ? (
            <button className="play-btn" onClick={handlePlay}>
              ▶ Play "Happy Birthday"
            </button>
          ) : (
            <button className="pause-btn" onClick={handlePause}>
              ⏸ Pause
            </button>
          )}
        </div>
      </div>

      {/* Hidden audio element - Spotify preview URL will go here */}
      <audio
        ref={audioRef}
        src="https://p.scdn.co/mp3-preview/4b3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e"
        crossOrigin="anonymous"
      />
    </div>
  )
}
