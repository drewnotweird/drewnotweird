import ProjectLayout from '../components/ProjectLayout.jsx'
import ImageSection from '../components/ImageSection.jsx'

const BASE = '/work/wunwurd'

export default function Wunwurd() {
  return (
    <ProjectLayout slug="wunwurd"
      title="WUNWURD"
      subtitle="Single-word review site"
      tags="AI-collab / Branding / UX / Build"
      credit={`Self-initiated project`}
    >

      <ImageSection images={[
        { src: `${BASE}/wunwurd02.jpg`, layout: 'full', alt: 'WUNWURD film listing interface' },
      ]} />
      <section>
        <p>When you search for a film you get numbers. IMDb gives you a score out of 10. Rotten Tomatoes gives you a percentage. Metacritic has its own number as well. You can tell if something is broadly "good" or "bad", but that's about it. If you actually want anything more, you have to start exploring deeper — video reviews, articles from critics, user-submitted comments — and it can be difficult to do this and avoid spoilers, when most of the time you're just looking for the tiniest bit of context.</p>
        <p>I'm also much more likely to rate a movie as "haunting", or "epic", or "heartbreaking" than I am 60% or 3 stars or whatever arbitrary number.</p>
      </section>

      <ImageSection images={[
        { src: `${BASE}/wunwurd06.jpg`, layout: 'full', alt: 'WUNWURD browse by word feature' },
      ]} />

      <section>
        <p>What if, alongside all those numbers, you also got a word. One word per film. A small piece of context. Enough to tell you something about the experience without having to read a full review. This was my idea for Wunwurd. And I had that idea almost 20 years ago.</p>
        <p>I immediately mocked it up and spoke to developer friends in the hope that one of them might embark on this silly side project with me. Selling the idea was easy, but apparently that's all that was easy about it. Databases, API calls, authentication — the usual things that would stop me before I'd really started, because those are all things I didn't understand or have the time to learn well enough to build on my own. So it never happened.</p>
        <p>The idea just stuck around. Every so often I'd watch something and think, <em>devastating</em>, or <em>unsettling</em>. Or I'd be searching a movie and be met with 4/10 ratings next to 60% scores and Wunwurd would pop into my head again.</p>
      </section>

      <ImageSection images={[
        { src: `${BASE}/wunwurd04.jpg`, layout: 'half', alt: 'WUNWURD mobile view' },
        { src: `${BASE}/wunwurd05.jpg`, layout: 'half', alt: 'WUNWURD word submission' },
      ]} />

      <section>
        <p>Until one day I decided to explore Claude Code and knew instantly what idea I wanted to test it out on. Just the idea, not detailing implementation or dictating tools. People submit single words against movies and the more commonly submitted words rise to the top — with a single word representing that film. You can also search for movies that people have described with a specific word. Simple, silly, but I wanted to see it.</p>
        <p>I worked on it for a few hours to get the concept built. Took a break, and when the kids were in bed I worked on getting it deployed. Films, words, profiles — all working. The kind of stuff that used to block me because it was such an undertaking was solved in a single evening.</p>
      </section>

      <ImageSection images={[
        { src: `${BASE}/wunwurd03.jpg`, layout: 'full', alt: 'WUNWURD film page' },
      ]} />

      <section>
        <p>I don't think I'll ever convince Google to implement it next to those ratings in movie search results, like I always wanted. But just having the site as a wee proof of concept has been enough to finally scratch that itch after so many years.</p>
        <p><a href="/wunwurd" target="_blank" rel="noreferrer">Visit WUNWURD</a></p>
      </section>
    </ProjectLayout>
  )
}
