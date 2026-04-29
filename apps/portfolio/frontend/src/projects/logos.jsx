import ProjectLayout from '../components/ProjectLayout.jsx'
import ImageSection from '../components/ImageSection.jsx'

const BASE = '/work/logos'

export default function Logos() {
  return (
    <ProjectLayout slug="logos"
      title="Logos"
    >
      <section>
        <p>A logo has to work everywhere — big, small, in colour, in black and white, on a business card and on a billboard. A selection from across 20-odd years of client and self-initiated work.</p>
      </section>

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
