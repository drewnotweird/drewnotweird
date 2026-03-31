import Equalizer from './Equalizer.jsx'
import CosmicBackground from './CosmicBackground.jsx'

export default function TrackSection({ track, isActive, onTap, getAudioData }) {
  return (
    <div
      className={`track-section track-section--${track.id} ${isActive ? 'track-section--active' : ''}`}
      style={{ '--base': track.baseColor, '--accent': track.accentColor }}
      onClick={onTap}
    >
      <CosmicBackground trackId={track.id} accentColor={track.accentColor} isActive={isActive} getAudioData={getAudioData} />
      <div className="track-title-wrap">
        <h2 className="track-title">{track.title}</h2>
      </div>
      <div className="track-eq-wrap">
        <Equalizer eqStyle={track.eqStyle} isActive={isActive} accentColor={track.accentColor} />
      </div>
    </div>
  )
}
