import { useState } from 'react'
import PintGlass from './components/PintGlass'
import Lightbox from './components/Lightbox'

export default function App() {
  const [lightbox, setLightbox] = useState(null) // { src, rect }

  return (
    <>
      <PintGlass onPhotoClick={(src, rect) => setLightbox({ src, rect })} />
      {lightbox && (
        <Lightbox
          src={lightbox.src}
          clickRect={lightbox.rect}
          onClose={() => setLightbox(null)}
        />
      )}
    </>
  )
}
