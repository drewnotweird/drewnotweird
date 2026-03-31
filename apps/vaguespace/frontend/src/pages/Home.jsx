import { TRACKS } from '../data/tracks.js'
import TrackSection from '../components/TrackSection.jsx'
import { useAudioPlayer } from '../hooks/useAudioPlayer.js'

export default function Home() {
  const { activeIndex, toggle, getAudioData } = useAudioPlayer()

  return (
    <div className="grid">
      {TRACKS.map((track, i) => (
        <TrackSection
          key={track.id}
          track={track}
          isActive={activeIndex === i}
          onTap={() => toggle(i)}
          getAudioData={activeIndex === i ? getAudioData : null}
        />
      ))}
    </div>
  )
}
