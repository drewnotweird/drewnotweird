import ProjectLayout from '../components/ProjectLayout.jsx'
import ImageSection from '../components/ImageSection.jsx'

const BASE = '/work/rumblender'

export default function RumBlender() {
  return (
    <ProjectLayout
      title="Rum Blender"
      subtitle="Journey collection"
      tags="Web / Product / UI / Packaging / Print"
      credit={`In collaboration with <a href="http://cargocollective.com/lisahenderson" target="_blank">Lisa Adamson</a>, <a href="https://linkedin.com/in/laura-service" target="_blank">Laura Service</a> and <a href="https://linkedin.com/in/emma-fraser-edinburgh" target="_blank">Emma Fraser</a> (while at Front Page)`}
    >
      <section>
        <p>The challenge was to create a limited-edition rum collection that told the story of Rum Blender, a side project I had recently started with a friend.</p>
        <p>It all kicked off one evening after hours, with a group of us gathered around a boardroom table, learning a thing or two about rum — how it's made, the different styles, what Rum Blender was trying to be — and, inevitably, tasting our way through a flight of seven different rums. There were tasting notes, opinions, scribbles, and by the end of the session, three original blends had emerged to take forward. There were also a number of us who were fairly drunk.</p>
      </section>

      <ImageSection images={[
        { src: `${BASE}/rumblenderjourney01.jpg`, layout: 'full' },
      ]} />

      <section>
        <p>Fast-forward seven months of lunch breaks, early starts, and incremental progress, and we finally signed off the creative to send away for engraving. The concept was to represent the journey the rum takes — from where it's made, to where it's blended, to where it's bottled — through three simple, stylised illustrations.</p>
      </section>

      <ImageSection images={[
        { src: `${BASE}/rumblenderjourney03.jpg`, layout: 'half' },
        { src: `${BASE}/rumblenderjourney05.jpg`, layout: 'half' },
      ]} />

      <section>
        <p>The first captured a sun-soaked Caribbean island in the West Indies. The second referenced the narrow canal-side buildings of Amsterdam in the Netherlands. The final depicted Bothwell Castle in Scotland. While three different designers worked on the illustrations individually, they were all built on a single, shared grid system we developed to ensure consistency of style, weight, and rhythm across the set.</p>
        <p>I'm incredibly proud of this work, but the best part wasn't just the finished bottles. It was the chance to work so closely with people who brought even more creative energy, passion, positivity, and enthusiasm than I did. It was a balanced, generous, and genuinely rewarding collaboration — one that resulted not only in three beautiful bottles of rum, but in a shared sense of accomplishment and pride.</p>
      </section>

      <ImageSection images={[
        { src: `${BASE}/rumblenderjourney04.gif`, layout: 'full' },
      ]} />

      <section>
        <p>As Massimo Vignelli once said, "You do design because you feel it inside." Nobody gets into design for the money. We do it because we can't help ourselves — because we need to make things, and often it's our own ideas that we most want to explore.</p>
      </section>
    </ProjectLayout>
  )
}
