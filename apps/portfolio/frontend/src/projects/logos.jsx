import ProjectLayout from '../components/ProjectLayout.jsx'
import ImageSection from '../components/ImageSection.jsx'

const BASE = '/work/logos'

export default function Logos() {
  return (
    <ProjectLayout slug="logos"
      title="Logos"
    >
      <ImageSection images={[
        { src: `${BASE}/logos01.png`, layout: 'half', alt: 'QikPic logo' },
        { src: `${BASE}/logos02.png`, layout: 'half', alt: 'Introducing logo' },
        { src: `${BASE}/logos03.png`, layout: 'half', alt: 'Organisational Elephant logo' },
        { src: `${BASE}/logos04.png`, layout: 'half', alt: 'SlapSticker logo' },
        { src: `${BASE}/logos05.png`, layout: 'half', alt: 'Little Rosy Cheeks logo' },
        { src: `${BASE}/logos06.png`, layout: 'half', alt: 'Scotch Whisky Academy logo' },
        { src: `${BASE}/logos07.png`, layout: 'half', alt: 'Front Page logo' },
        { src: `${BASE}/logos08.png`, layout: 'half', alt: 'INF Officials logo' },
        { src: `${BASE}/logos09.png`, layout: 'half', alt: 'Andrews of Bothwell logo' },
        { src: `${BASE}/logos10.png`, layout: 'half', alt: 'Casa Coalburn logo' },
        { src: `${BASE}/logos11.png`, layout: 'half', alt: 'Bothwell logo' },
        { src: `${BASE}/logos12.png`, layout: 'half', alt: 'Product Experience logo' },
        { src: `${BASE}/logos13.png`, layout: 'half', alt: 'Stylish Whisky logo' },
        { src: `${BASE}/logos14.png`, layout: 'half', alt: 'Vague Space logo' },
        { src: `${BASE}/logos15.png`, layout: 'half', alt: 'High Kings logo' },
        { src: `${BASE}/logos16.png`, layout: 'half', alt: 'Loch Ness Craft logo' },
        { src: `${BASE}/logos17.png`, layout: 'half', alt: 'Maltstock logo' },
        { src: `${BASE}/logos18.png`, layout: 'half', alt: 'Glasgow Dictionary logo' },
      ]} />

      <section>
        <p>A small selection showing how a logo must work across context, scale and usage.</p>
      </section>
    </ProjectLayout>
  )
}
