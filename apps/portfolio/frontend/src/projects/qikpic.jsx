import ProjectLayout from '../components/ProjectLayout.jsx'
import ImageSection from '../components/ImageSection.jsx'

const BASE = '/work/qikpic'

export default function QikPic() {
  return (
    <ProjectLayout slug="qikpic"
      title="QikPic"
      subtitle="Avatar & profile picture maker"
      tags="Concept / Design / Product"
      credit={`Self-initiated project (in collaboration with Heather Miller and Grant Kerr)`}
    >

      <ImageSection images={[
        { src: `${BASE}/qikpic1.jpg`, layout: 'full', alt: 'QikPic app interface' },
      ]} />

      <section>
        <p>Before every social platform had its own built-in avatar tool, getting a decent profile picture meant either having a good photo or knowing someone who could draw. QikPic was a mobile app that closed that gap — letting anyone build a cartoon version of themselves from a library of illustrated heads, eyes, mouths, hair and accessories.</p>
        <p>The characters were designed to be instantly recognisable and endlessly combinable. You could make your mum, your boss, a colleague, or someone you spotted on the bus. Once happy with the result, you could set it as your profile picture across Facebook, Twitter and Instagram, share it with friends, or assign it as a caller ID.</p>
      </section>

      <ImageSection images={[
        { src: `${BASE}/qikpic2.jpg`, layout: 'full', alt: 'QikPic character customisation' },
        { src: `${BASE}/qikpic4.jpg`, layout: 'full', alt: 'QikPic character examples' },
      ]} />

      <section>
        <p>The project was a genuine three-way collaboration. I led the design and product thinking, Heather brought the illustration style that gave the characters their personality, and Grant built the whole thing — a cross-platform app that worked on both iOS and Android. All three had to work in lockstep to make the experience feel quick and fun rather than fiddly.</p>
      </section>

      <div className="video-embed">
        <iframe
          src="https://player.vimeo.com/video/517108302"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          title="QikPic demo"
        />
      </div>

    </ProjectLayout>
  )
}
