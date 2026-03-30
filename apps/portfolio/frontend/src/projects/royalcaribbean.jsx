import ProjectLayout from '../components/ProjectLayout.jsx'
import ImageSection from '../components/ImageSection.jsx'

const BASE = '/work/royalcaribbean'

export default function RoyalCaribbean() {
  return (
    <ProjectLayout slug="royalcaribbean"
      title="Royal Caribbean"
      subtitle="Responsive web components"
      tags="UI / Prototyping"
      credit={`Work created at <a href="http://www.frontpage.co.uk" target="_blank">Front Page</a>`}
    >
      <section>
        <p>Royal Caribbean's website had grown to over 400 pages, long before mobile was the primary way people browsed. The challenge wasn't just making it responsive, but making it usable.</p>
        <p>Rather than redesign everything at once, I took a phased approach — designing a flexible system of responsive modules that could gradually replace existing pages without breaking the site. At the centre of the work was a new global navigation, rebuilt from the ground up to reorganise content, simplify journeys, and work consistently across devices.</p>
        <p>The result was a scalable, mobile-first foundation that allowed the site to evolve without starting over.</p>
      </section>

      <ImageSection images={[
        { src: `${BASE}/royalcaribbean01.jpg`, layout: 'full' },
        { src: `${BASE}/royalcaribbean02.jpg`, layout: 'full' },
        { src: `${BASE}/royalcaribbean03.gif`, layout: 'full' },
        { src: `${BASE}/royalcaribbean04.jpg`, layout: 'full' },
      ]} />
    </ProjectLayout>
  )
}
