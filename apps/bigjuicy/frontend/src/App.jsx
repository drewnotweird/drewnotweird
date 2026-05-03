import { useState } from 'react'
import PintGlass from './components/PintGlass'
import Lightbox from './components/Lightbox'

export default function App() {
  const [lightbox, setLightbox] = useState(null) // { imgIndex, rect }

  return (
    <>
      <PintGlass onPhotoClick={(imgIndex, rect) => setLightbox({ imgIndex, rect })} />
      {lightbox && (
        <Lightbox
          imgIndex={lightbox.imgIndex}
          clickRect={lightbox.rect}
          onClose={() => setLightbox(null)}
        />
      )}
    </>
  )
}
