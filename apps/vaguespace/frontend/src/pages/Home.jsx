import { TRACKS } from '../data/tracks.js'
import SolarScene from '../components/SolarScene.jsx'
import { useAudioPlayer } from '../hooks/useAudioPlayer.js'

export default function Home() {
  const { activeIndex, toggle, getAudioData } = useAudioPlayer()
  return (
    <div style={{ position: 'relative', width: '100vw', height: '100dvh', background: '#020207', overflow: 'hidden' }}>
      <SolarScene
        getAudioData={activeIndex !== null ? getAudioData : null}
      />

      <div className="track-bar">
        {TRACKS.map((track, i) => (
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
      </div>
    </div>
  )
}
