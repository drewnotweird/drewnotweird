import { Link } from 'react-router-dom'
import { projects } from '../data/projects.js'

export default function Home() {
  return (
    <main>
      <header>
        <h1>Andrew Nicolson</h1>
        <p>
          With over 20 years experience, working in a variety of roles and sectors &mdash; including
          freelance, academia, startup, creative agency and global technology &mdash; I consider myself a
          multidisciplinary designer with a wide range of skills and expertise.
        </p>
      </header>

      {projects.map((project) => (
        <section className="work" key={project.slug}>
          <Link
            to={`/work/${project.slug}`}
            className="project"
            style={{ backgroundImage: `url(${project.cover})` }}
          >
            <span>{project.title}</span>
          </Link>
        </section>
      ))}

      <section>
        <p>
          I also volunteer for <a href="https://makeithappen.club/" target="_blank" rel="noreferrer">Make It Happen</a>; mentor
          final year design students at GCU; run an Instagram{' '}
          <a href="https://www.instagram.com/introducing___" target="_blank" rel="noreferrer">introducing</a> different
          creatives; let people{' '}
          <a href="https://www.whiskyblender.com/" target="_blank" rel="noreferrer">create their own whisky</a>;{' '}
          <a href="https://justgiving.com/fundraising/fulltandy" target="_blank" rel="noreferrer">raise funds</a> for Glasgow
          NE Foodbank; enjoy the odd  <a href="/bigjuicy" target="_blank" rel="noreferrer">Big Juicy</a>, and <a href="/pointing" target="_blank" rel="noreferrer">point at things</a>.
        </p>
      </section>

      <section>
        <ul id="contact">
          <li><a href="mailto:drewnotweird@gmail.com">@</a></li>
          <li><a href="https://twitter.com/drewnotweird" target="_blank" rel="noreferrer">X</a></li>
          <li><a href="https://www.linkedin.com/in/drewnotweird/" target="_blank" rel="noreferrer">LI</a></li>
          <li><a href="https://www.instagram.com/drewnotweird/" target="_blank" rel="noreferrer">IG</a></li>
        </ul>
      </section>
    </main>
  )
}
