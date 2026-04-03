import { useEffect, useRef, useState } from 'react'
import confetti from 'canvas-confetti'
import './Home.css'

export default function Home() {
  const audioRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    // Autoplay on mount
    if (audioRef.current) {
      audioRef.current.play()
      triggerBigConfetti()
    }
  }, [])

  const triggerBigConfetti = () => {
    confetti({
      particleCount: 200,
      spread: 100,
      origin: { y: 0.6 },
      scalar: 1.5,
    })
  }

  // Drop "40" GIFs constantly
  useEffect(() => {
    const dropGif = () => {
      if (!containerRef.current) return

      const gif = document.createElement('div')
      gif.className = 'falling-40'
      gif.style.left = Math.random() * 100 + '%'
      // Randomly pick one of the 40 GIFs (40_1.gif through 40_5.gif)
      const gifNum = Math.floor(Math.random() * 5) + 1
      gif.style.backgroundImage = `url(/40_${gifNum}.gif)`
      containerRef.current.appendChild(gif)

      setTimeout(() => gif.remove(), 4000)
    }

    // Drop GIFs every 800ms continuously
    const interval = setInterval(dropGif, 800)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="home" ref={containerRef}>
      {/* Background image */}
      <div className="background" style={{ backgroundImage: 'url(/stuart.jpg)' }} />

      {/* Hidden audio element - autoplays */}
      <audio
        ref={audioRef}
        src="https://p.scdn.co/mp3-preview/4b3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e"
        crossOrigin="anonymous"
        autoPlay
        loop
      />
    </div>
  )
}
