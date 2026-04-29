import ProjectLayout from '../components/ProjectLayout.jsx'
import ImageSection from '../components/ImageSection.jsx'

const BASE = '/work/airnewzealand'

export default function AirNewZealand() {
  return (
    <ProjectLayout slug="airnewzealand"
      title="Air New Zealand"
      subtitle="Cabin Viewer"
      tags="VR app / UI / illustration"
      credit={`Work created at <a href="http://www.frontpage.co.uk" target="_blank">Front Page</a>`}
    >
      <section>
        <p>My first project with Air New Zealand explored how emerging technology could help people better understand what they were buying before committing to a long-haul flight. We worked on a Google Cardboard app and custom viewer that allowed customers to virtually step inside the aircraft and look around different cabin classes.</p>
      </section>

      <ImageSection images={[
        { src: `${BASE}/anzcabinviewer01.jpg`, layout: 'full' },
      ]} />

      <section>
        <p>The idea was simple but powerful. Using a smartphone mounted inside a low-cost cardboard headset, users could experience a 360° view of the cabin interiors. The app split the screen for each eye and used the phone's gyroscope to respond to head movement, creating a surprisingly immersive sense of space. It wasn't VR for novelty's sake — it was a practical tool to remove uncertainty, letting customers understand layout, comfort, and atmosphere before booking.</p>
      </section>

      <ImageSection images={[
        { src: `${BASE}/anzcabinviewer05.gif`, layout: 'half' },
        { src: `${BASE}/anzcabinviewer08.jpg`, layout: 'half' },
      ]} />

      <section>
        <p>The accessibility of Google Cardboard was a key part of the thinking. Rather than positioning VR as something futuristic and exclusive, this approach made it lightweight, approachable, and easy to distribute — an early example of using emerging technology in a way that genuinely supported decision-making.</p>
      </section>

      <ImageSection images={[
        { src: `${BASE}/anzcabinviewer04.jpg`, layout: 'full' },
      ]} />

      <section>
        <p>The second project moved away from product experience and into brand-led communication. The Bet You Didn't Know campaign was built around a simple insight: many travellers didn't realise Air New Zealand flies direct from London to Los Angeles. Instead of leading with the route, the campaign leaned into curiosity and surprise.</p>
      </section>

      <ImageSection images={[
        { src: `${BASE}/anzbetyoudidntknow01.gif`, layout: 'full' },
      ]} />

      <section>
        <p>Running predominantly across London Underground stations, the creative used unexpected facts to grab attention — "babies can't dream", "lobsters taste with their feet", "mangoes get sunburn", "bees do have knees" — before revealing the airline's daily direct service. The tone was light-hearted and slightly irreverent, designed to feel human rather than corporate.</p>
      </section>

      <ImageSection images={[
        { src: `${BASE}/anzbetyoudidntknow02.jpg`, layout: 'full' },
        { src: `${BASE}/anzbetyoudidntknow03.gif`, layout: 'full' },
        { src: `${BASE}/anzbetyoudidntknow04.gif`, layout: 'full' },
      ]} />

      <section>
        <p>Together, the two projects reflected the same underlying approach: use creativity and technology not to shout louder, but to make the product clearer, more tangible, and more memorable. Whether through immersive VR or a poster glimpsed on a platform, the goal was always the same — help people understand what makes Air New Zealand different, and remember it when it mattered.</p>
      </section>
    </ProjectLayout>
  )
}
