import ProjectLayout from '../components/ProjectLayout.jsx'
import ImageSection from '../components/ImageSection.jsx'

const BASE = '/work/vaguespace'

export default function VagueSpace() {
  return (
    <ProjectLayout slug="vaguespace"
      title="Vague Space"
      subtitle="True Scottish Indie Rock"
      tags="Performing live 2003—2013"
    >

      <ImageSection images={[
        { src: `${BASE}/vaguespace.gif`, layout: 'full', alt: 'Vague Space band photos compilation' },
      ]} />
      <section>
        <p>I spent well over 10 years pretending to be a drummer in a band my friends and I started while we were still at school. This page is less about design and more about remembering how fun it all was. That said, being in a band is a great way to develop design skills: posters, merch, website, social presence, album art, music videos, project management, and more!</p>
        <p>By far the greatest thing about being in a band is the gigs. For me, this was because it was the ultimate excuse to meet up with pals and have a night out. And because you have to sell Tshirts, you end up with a bunch of people you know and love (plus the occasional stranger) all wearing your band name.</p>
      </section>

      <ImageSection images={[
        { src: `${BASE}/vaguespace02.jpg`, layout: 'third', alt: 'Vague Space' },
        { src: `${BASE}/vaguespace03.jpg`, layout: 'third', alt: 'Vague Space' },
        { src: `${BASE}/vaguespace04.jpg`, layout: 'third', alt: 'Vague Space' },
        { src: `${BASE}/vaguespace05.jpg`, layout: 'third', alt: 'Vague Space' },
        { src: `${BASE}/vaguespace06.jpg`, layout: 'third', alt: 'Vague Space' },
        { src: `${BASE}/vaguespace07.jpg`, layout: 'third', alt: 'Vague Space' },
        { src: `${BASE}/vaguespace09.jpg`, layout: 'third', alt: 'Vague Space' },
        { src: `${BASE}/vaguespace10.jpg`, layout: 'third', alt: 'Vague Space' },
        { src: `${BASE}/vaguespace11.jpg`, layout: 'third', alt: 'Vague Space' },
        { src: `${BASE}/vaguespace12.jpg`, layout: 'third', alt: 'Vague Space' },
        { src: `${BASE}/vaguespace13.jpg`, layout: 'third', alt: 'Vague Space' },
        { src: `${BASE}/vaguespace14.jpg`, layout: 'third', alt: 'Vague Space' },
        { src: `${BASE}/vaguespace15.jpg`, layout: 'third', alt: 'Vague Space' },
        { src: `${BASE}/vaguespace16.jpg`, layout: 'third', alt: 'Vague Space' },
        { src: `${BASE}/vaguespace17.jpg`, layout: 'third', alt: 'Vague Space' },
        { src: `${BASE}/vaguespace18.jpg`, layout: 'third', alt: 'Vague Space' },
        { src: `${BASE}/vaguespace19.jpg`, layout: 'third', alt: 'Vague Space' },
        { src: `${BASE}/vaguespace20.jpg`, layout: 'third', alt: 'Vague Space' },
        { src: `${BASE}/vaguespace21.jpg`, layout: 'third', alt: 'Vague Space' },
        { src: `${BASE}/vaguespace22.jpg`, layout: 'third', alt: 'Vague Space' },
        { src: `${BASE}/vaguespace23.jpg`, layout: 'third', alt: 'Vague Space' },
        { src: `${BASE}/vaguespace24.jpg`, layout: 'third', alt: 'Vague Space' },
        { src: `${BASE}/vaguespace25.jpg`, layout: 'third', alt: 'Vague Space' },
        { src: `${BASE}/vaguespace26.jpg`, layout: 'third', alt: 'Vague Space' },
        { src: `${BASE}/vaguespace27.jpg`, layout: 'third', alt: 'Vague Space' },
        { src: `${BASE}/vaguespace28.jpg`, layout: 'third', alt: 'Vague Space' },
        { src: `${BASE}/vaguespace29.jpg`, layout: 'third', alt: 'Vague Space' },
        { src: `${BASE}/vaguespace01.jpg`, layout: 'full', alt: 'Vague Space band' },
      ]} />

      <section>
        <p>Sample our <a href="/vaguespace" target="_blank" rel="noreferrer">Equilibrium EP</a>.</p>
      </section>

    </ProjectLayout>
  )
}
