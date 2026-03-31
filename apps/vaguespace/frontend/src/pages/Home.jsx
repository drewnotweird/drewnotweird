import { TRACKS } from '../data/tracks.js'
import TrackSection from '../components/TrackSection.jsx'
import { useAudioPlayer } from '../hooks/useAudioPlayer.js'

const CURSOR = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40' width='40' height='40'%3E%3Cpath fill='%23ffffff' d='M6.88,1.3h4.95c-1.69,3.75-2.92,7.24-3.69,10.43-.63,2.72-.96,5.61-.96,8.67,0,5.95,1.53,12.03,4.62,18.31h-4.95c-2.52-3.55-4.29-6.81-5.32-9.7s-1.53-5.91-1.53-9.07.53-6.41,1.59-9.37S4.45,4.52,6.88,1.3Z'/%3E%3Cpath fill='%23ffffff' d='M38.41,10.56c1.06,2.96,1.59,6.08,1.59,9.37s-.5,6.18-1.53,9.07c-1.03,2.89-2.79,6.11-5.32,9.7h-4.95c3.09-6.28,4.62-12.36,4.62-18.31,0-3.09-.33-5.98-.96-8.67-.76-3.19-1.99-6.68-3.69-10.43h4.95c2.43,3.22,4.15,6.31,5.22,9.27h.07Z'/%3E%3C/svg%3E") 20 20, auto`

export default function Home() {
  const { activeIndex, toggle, getAudioData } = useAudioPlayer()

  return (
    <div className="grid" style={{ cursor: CURSOR }}>
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
