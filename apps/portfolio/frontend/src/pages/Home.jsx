import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { projects } from '../data/projects.js'

export default function Home() {
  const mainRef = useRef(null)

  useEffect(() => {
    const sections = mainRef.current?.querySelectorAll('section, header')
    if (!sections) return
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible')
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.1 })
    sections.forEach(section => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  return (
    <main ref={mainRef}>
      <header>
        <h1>Andrew Nicolson</h1>
        <p>
          Multidisciplinary designer with over 20 years' experience across different industries&mdash;bringing adaptability, resourcefulness, and a focus on making things happen.
        </p>
      </header>

      {projects.map((project) => (
        <section className="work" key={project.slug}>
          <Link
            to={`/work/${project.slug}`}
            className="project"
          >
            <div className="project-bg" style={{ backgroundImage: `url(${project.cover})` }} />
            <span>{project.title}</span>
          </Link>
        </section>
      ))}

      <section>
        <p>
          I also volunteer for <a href="https://makeithappen.club/" target="_blank" rel="noreferrer">Make It Happen</a>; <a href="/lessons" target="_blank" rel="noreferrer">mentor</a> final year design students at GCU; run an Instagram{' '}
          <a href="https://www.instagram.com/introducing___" target="_blank" rel="noreferrer">introducing</a> creatives
          from around the world; let people{' '}
          <a href="https://www.whiskyblender.com/" target="_blank" rel="noreferrer">create their own whisky</a>;{' '}
          <a href="https://justgiving.com/fundraising/fulltandy" target="_blank" rel="noreferrer">raise funds</a> for Glasgow
          NE Foodbank; enjoy the odd  <a href="/bigjuicy" target="_blank" rel="noreferrer">Big Juicy</a>, tell <a href="/emojokes" target="_blank" rel="noreferrer">bad jokes</a>, and <a href="/pointing" target="_blank" rel="noreferrer">point at things</a>.
        </p>
      </section>

      <section>
        <ul id="contact">
          <li><a href="mailto:drewnotweird@gmail.com" aria-label="Email">@</a></li>
          <li><a href="https://twitter.com/drewnotweird" target="_blank" rel="noreferrer" aria-label="X (Twitter)">X</a></li>
          <li><a href="https://www.linkedin.com/in/drewnotweird/" target="_blank" rel="noreferrer" aria-label="LinkedIn">LI</a></li>
          <li><a href="https://www.instagram.com/drewnotweird/" target="_blank" rel="noreferrer" aria-label="Instagram">IG</a></li>
          <li><a href="https://github.com/drewnotweird/" target="_blank" rel="noreferrer" aria-label="GitHub">GH</a></li>
        </ul>
      </section>
    </main>
  )
}
