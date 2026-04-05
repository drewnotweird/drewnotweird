import { useEffect, useRef, useState } from 'react'
import confetti from 'canvas-confetti'
import './Home.css'

export default function Home() {
  const audioRef = useRef(null)
  const containerRef = useRef(null)
  const baseUrl = import.meta.env.BASE_URL
  const [showAlt, setShowAlt] = useState(false)

  useEffect(() => {
    // Preload the alternate image so the swap is instant
    const img = new Image()
    img.src = `${baseUrl}stuart2.jpg`

    // Start playing muted on mount (browsers allow this)
    if (audioRef.current) {
      audioRef.current.muted = true
      audioRef.current.play().catch(() => {
        // If even muted autoplay is blocked, do nothing
      })
      triggerBigConfetti()
    }
  }, [])

  const handleScreenClick = () => {
    setShowAlt(prev => !prev)
    if (audioRef.current) {
      // Unmute and ensure it's playing
      audioRef.current.muted = false
      audioRef.current.play()
      triggerBigConfetti()
    }
  }

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
      const gifNum = Math.floor(Math.random() * 5) + 1
      gif.style.backgroundImage = `url(${baseUrl}40_${gifNum}.gif)`
      containerRef.current.appendChild(gif)

      setTimeout(() => gif.remove(), 4000)
    }

    const interval = setInterval(dropGif, 800)
    return () => clearInterval(interval)
  }, [baseUrl])

  return (
    <div className="home" ref={containerRef} onClick={handleScreenClick}>
      {/* Background image */}
      <div className="background" style={{ backgroundImage: `url(${baseUrl}${showAlt ? 'stuart2.jpg' : 'stuart.jpg'})` }} />

      {/* Audio element - local MP3 file */}
      <audio
        ref={audioRef}
        src={`${baseUrl}stevie.mp3`}
        loop
        muted
      />
    </div>
  )
}
