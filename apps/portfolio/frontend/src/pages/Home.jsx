import { Link } from 'react-router-dom'
import { projects } from '../data/projects.js'

export default function Home() {
  return (
    <main>
      {projects.map((project) => (
        <section className="work" key={project.slug}>
          <Link to={`/work/${project.slug}`}>
            <div
              className="project"
              style={{ backgroundImage: `url(${project.cover})` }}
            />
            <div className="project-gradient" />
            <span>{project.title}</span>
          </Link>
        </section>
      ))}

      <section>
        <ul id="contact">
          <li><a href="mailto:drew@drewgibson.co" target="_blank" rel="noreferrer">@</a></li>
          <li><a href="https://x.com/drewnotweird" target="_blank" rel="noreferrer">X</a></li>
          <li><a href="https://linkedin.com/in/drewnotweird" target="_blank" rel="noreferrer">LI</a></li>
          <li><a href="https://instagram.com/drewnotweird" target="_blank" rel="noreferrer">IG</a></li>
        </ul>
      </section>
    </main>
  )
}
