import ProjectLayout from '../components/ProjectLayout.jsx'
import ImageSection from '../components/ImageSection.jsx'

const BASE = '/work/logos'

export default function Logos() {
  return (
    <ProjectLayout
      title="Logos"
    >
      <ImageSection images={[
        { src: `${BASE}/logos01.png`, layout: 'half' },
        { src: `${BASE}/logos02.png`, layout: 'half' },
        { src: `${BASE}/logos03.png`, layout: 'half' },
        { src: `${BASE}/logos04.png`, layout: 'half' },
        { src: `${BASE}/logos05.png`, layout: 'half' },
        { src: `${BASE}/logos06.png`, layout: 'half' },
        { src: `${BASE}/logos07.png`, layout: 'half' },
        { src: `${BASE}/logos08.png`, layout: 'half' },
        { src: `${BASE}/logos09.png`, layout: 'half' },
        { src: `${BASE}/logos10.png`, layout: 'half' },
        { src: `${BASE}/logos11.png`, layout: 'half' },
        { src: `${BASE}/logos12.png`, layout: 'half' },
        { src: `${BASE}/logos13.png`, layout: 'half' },
        { src: `${BASE}/logos14.png`, layout: 'half' },
        { src: `${BASE}/logos15.png`, layout: 'half' },
        { src: `${BASE}/logos16.png`, layout: 'half' },
        { src: `${BASE}/logos17.png`, layout: 'half' },
        { src: `${BASE}/logos18.png`, layout: 'half' },
      ]} />
    </ProjectLayout>
  )
}
