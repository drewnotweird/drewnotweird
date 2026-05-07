import ProjectLayout from '../components/ProjectLayout.jsx'
import ImageSection from '../components/ImageSection.jsx'

const BASE = '/work/emojokes'

export default function Emojokes() {
  return (
    <ProjectLayout slug="emojokes"
      title="Emojokes"
      subtitle="A physics wall of dad jokes"
      tags="Concept / Design / Build"
      credit={`Self-initiated project`}
    >

      <ImageSection images={[
        { src: `${BASE}/emojokes01.jpg`, layout: 'full', alt: 'Emojokes: a wall of joke bubbles' },
      ]} />

      <section>
        <p>Dad jokes are one of my favourite things. The earnest, told-to-a-child, groan-out-loud kind. Somewhere along the way I've become the person people come to when they need one. For a kid's Halloween party, for a birthday card, for a work do, or just to cheer someone up. My daughter tells a joke to the lollipop man every afternoon on the way home from school, and for a while I was her source. Eventually coming up with a fresh one from memory every day became too difficult. So I built this, and now she can pick her own.</p>
      </section>

      <ImageSection images={[
        { src: `${BASE}/emojokes02.jpg`, layout: 'half', alt: 'Category filter menu' },
        { src: `${BASE}/emojokes03.jpg`, layout: 'half', alt: 'Joke card expanded' },
      ]} />

      <section>
        <p>Each joke lives in a bubble. Dozens of them, held together with a physics simulation. Every bubble has an emoji to hint at what's coming without giving it away. Tap one and it opens up. The rest bounce out of the way.</p>
        <p>You can filter by category using a ring menu: Animals, Puns, People, Science, Quips, Food. Pick one and the rest disappear. A strange thing to have built, but I'm glad it exists.</p>
      </section>

      <ImageSection images={[
        { src: `${BASE}/emojokes04.jpg`, layout: 'full', alt: 'Emojokes on mobile' },
      ]} />

      <section>
        <p><a href="/emojokes" target="_blank" rel="noreferrer">Visit Emojokes</a></p>
      </section>

    </ProjectLayout>
  )
}
