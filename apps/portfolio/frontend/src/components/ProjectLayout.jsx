import { useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { projects } from '../data/projects.js'

function setMeta(name, content, attr = 'name') {
  let el = document.querySelector(`meta[${attr}="${name}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

export default function ProjectLayout({ slug, title, subtitle, tags, credit, children }) {
  const mainRef = useRef(null)
  const navigate = useNavigate()
  const currentIndex = projects.findIndex(p => p.slug === slug)
  const project = projects[currentIndex]
  const prevProject = projects[(currentIndex - 1 + projects.length) % projects.length]
  const nextProject = projects[(currentIndex + 1) % projects.length]
  const ogImage = project?.ogImage || 'https://www.drewnotweird.co.uk/work/whiskyblender/whiskyblender-05.jpg'
  const url = `https://www.drewnotweird.co.uk/work/${slug}`
  const desc = project?.description || ''

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowLeft')  navigate(`/work/${prevProject.slug}`)
      if (e.key === 'ArrowRight') navigate(`/work/${nextProject.slug}`)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [prevProject.slug, nextProject.slug])

  useEffect(() => {
    const els = mainRef.current?.querySelectorAll('section, header')
    if (!els) return
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible')
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.1 })
    els.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    document.title = `${title} | Andrew Nicolson`
    setMeta('description', desc)
    setMeta('og:title', `${title} | Andrew Nicolson`, 'property')
    setMeta('og:image', ogImage, 'property')
    setMeta('og:url', url, 'property')
    setMeta('og:description', desc, 'property')
    setMeta('twitter:title', `${title} | Andrew Nicolson`)
    setMeta('twitter:image', ogImage)
    setMeta('twitter:description', desc)
    return () => {
      document.title = 'Andrew Nicolson | Designer'
      setMeta('og:title', 'Andrew Nicolson | Designer', 'property')
      setMeta('og:image', 'https://www.drewnotweird.co.uk/work/whiskyblender/whiskyblender-05.jpg', 'property')
      setMeta('twitter:title', 'Andrew Nicolson | Designer')
    }
  }, [title, ogImage, url])

  return (
    <>
      <Link className="back" to="/" aria-label="Back">Back</Link>
      <main ref={mainRef}>
        <header>
          <h1>{title}</h1>
          {subtitle && <h2>{subtitle}</h2>}
          {tags && <h3>{tags}</h3>}
          {credit && <h4 dangerouslySetInnerHTML={{ __html: credit }} />}
        </header>

        {children}

        <section id="project-nav">
          <Link to={`/work/${prevProject.slug}`} className="project-nav-tile">
            <div className="project-bg" style={{ backgroundImage: `url(${prevProject.cover})` }} />
            <span><em>←</em>{prevProject.title}</span>
          </Link>
          <Link to={`/work/${nextProject.slug}`} className="project-nav-tile">
            <div className="project-bg" style={{ backgroundImage: `url(${nextProject.cover})` }} />
            <span>{nextProject.title}<em>→</em></span>
          </Link>
        </section>

        <section>
          <ul id="contact">
            <li><a href="mailto:drewnotweird@gmail.com">@</a></li>
            <li><a href="https://twitter.com/drewnotweird" target="_blank" rel="noreferrer">X</a></li>
            <li><a href="https://www.linkedin.com/in/drewnotweird/" target="_blank" rel="noreferrer">LI</a></li>
            <li><a href="https://www.instagram.com/drewnotweird/" target="_blank" rel="noreferrer">IG</a></li>
            <li><a href="https://github.com/drewnotweird/" target="_blank" rel="noreferrer">GH</a></li>
          </ul>
        </section>
      </main>
    </>
  )
}
