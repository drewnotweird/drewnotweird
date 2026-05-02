import ProjectLayout from '../components/ProjectLayout.jsx'
import ImageSection from '../components/ImageSection.jsx'

const BASE = '/work/mickey90'

export default function Mickey90() {
  return (
    <ProjectLayout slug="mickey90"
      title="Mickey's 90th"
      subtitle="A crowd-sourced celebration"
      tags="Project Management / Graphic Design / Print"
      credit={`Poster submission for <a href="https://www.instagram.com/_posterproject/" target="_blank">Poster Project</a>`}
    >

      <ImageSection images={[
        { src: `${BASE}/mickey9003.gif`, layout: 'full', alt: 'Ninety crowd-sourced Mickey Mouse drawings layered together' },
      ]} />

      <section>
        <p>To celebrate Mickey Mouse's 90th birthday, I asked ninety people to draw Mickey from memory &ndash; no reference, just whatever their mind conjured up. The results ranged from confident to chaotic, but the bet was that when you crowd-source an icon this deeply embedded in popular culture, the similarities will far outweigh the differences.</p>
      </section>

      <ImageSection images={[
        { src: `${BASE}/mickey9002.jpg`, layout: 'full', alt: 'Individual Mickey Mouse drawings from memory' },
      ]} />
      <section>
        <p>It paid off. Layering all ninety drawings on top of each other, the noise cancelled out and Mickey emerged &ndash; unmistakable.</p>
      </section>

      <ImageSection images={[
        { src: `${BASE}/mickey9004.jpg`, layout: 'full', alt: 'Mickey Mouse emerging from layered crowd-sourced drawings' },
        { src: `${BASE}/mickey9001.jpg`, layout: 'full', alt: 'Mickey\'s 90th anniversary poster' },
      ]} />
      
      <section>
        <p>Layering ninety drawings proved the power of collective creativity — Mickey emerges unmistakably from the crowd.</p>
      </section>
    </ProjectLayout>
  )
}