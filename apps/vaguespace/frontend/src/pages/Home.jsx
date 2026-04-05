import { useState } from 'react'
import { TRACKS } from '../data/tracks.js'
import Visualizer from '../components/Visualizer.jsx'
import { useAudioPlayer } from '../hooks/useAudioPlayer.js'

const BASE = import.meta.env.BASE_URL

export default function Home() {
  const { activeIndex, toggle, getTimeDomainData } = useAudioPlayer()
  const activeTrack = activeIndex !== null ? TRACKS[activeIndex] : TRACKS[0]
  const [bandInfoOpen, setBandInfoOpen] = useState(false)

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100dvh', background: '#000', overflow: 'hidden' }}>
      <Visualizer
        getTimeDomainData={activeIndex !== null ? getTimeDomainData : null}
        track={activeTrack}
        isActive={activeIndex !== null}
      />

      <div className="track-bar">
        {TRACKS.slice(0, 3).map((track, i) => (
          <button
            key={i}
            className={`track-btn ${activeIndex === i ? 'track-btn--active' : ''}`}
            style={{ '--accent': track.accentColor }}
            onClick={() => toggle(i)}
          >
            <span className="track-num">{String(i + 1).padStart(2, '0')}</span>
            <span className="track-name">{track.title}</span>
          </button>
        ))}

        <button className="band-logo-btn" onClick={() => setBandInfoOpen(true)}>
          <img src={`${BASE}brackets.svg`} alt="Vague Space" className="band-logo-svg" />
        </button>

        {TRACKS.slice(3).map((track, i) => {
          const idx = i + 3
          return (
            <button
              key={idx}
              className={`track-btn ${activeIndex === idx ? 'track-btn--active' : ''}`}
              style={{ '--accent': track.accentColor }}
              onClick={() => toggle(idx)}
            >
              <span className="track-num">{String(idx + 1).padStart(2, '0')}</span>
              <span className="track-name">{track.title}</span>
            </button>
          )
        })}
      </div>

      {bandInfoOpen && (
        <div className="band-info-overlay" onClick={() => setBandInfoOpen(false)}>
          <div className="band-info-content" onClick={e => e.stopPropagation()}>
            <button className="band-info-close" onClick={() => setBandInfoOpen(false)}>✕</button>
            {/* <img src={`${BASE}brackets.svg`} alt="Vague Space" className="band-info-logo" /> */}
            <h1 className="band-info-name">VAGUE ( ) SPACE</h1>
            <p className="band-info-location">Glasgow, Scotland</p>
            <p className="band-info-bio">
              True Scottish indie rock. Six songs about love, loss, and the endless static between.
            </p>
            <div className="band-info-ep">
              <p className="band-info-ep-label">Debut EP</p>
              <p className="band-info-ep-title">Equilibrium</p>
            </div>
            {/* <ul className="band-info-tracklist">
              {TRACKS.map((t, i) => (
                <li key={i}>
                  <span className="band-info-track-num">{String(i + 1).padStart(2, '0')}</span>
                  <span className="band-info-track-name">{t.title}</span>
                </li>
              ))}
            </ul> */}
          </div>
        </div>
      )}
    </div>
  )
}
