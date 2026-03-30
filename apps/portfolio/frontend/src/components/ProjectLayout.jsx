import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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
  const navigate = useNavigate()
  const project = projects.find(p => p.slug === slug)
  const ogImage = project?.ogImage || 'https://www.drewnotweird.co.uk/work/whiskyblender/whiskyblender-05.jpg'
  const url = `https://www.drewnotweird.co.uk/work/${slug}`
  const desc = 'User Interface, User Experience, Logo, Brand, Website, iOS, Android, Digital, Print (Glasgow)'

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
      <a className="back" onClick={() => navigate(-1)} href="#back" aria-label="Back">Back</a>
      <main>
        <header>
          <h1>{title}</h1>
          {subtitle && <h2>{subtitle}</h2>}
          {tags && <h3>{tags}</h3>}
          {credit && <h4 dangerouslySetInnerHTML={{ __html: credit }} />}
        </header>

        {children}

        <section>
          <ul id="contact">
            <li><a href="mailto:drewnotweird@gmail.com">@</a></li>
            <li><a href="https://twitter.com/drewnotweird" target="_blank" rel="noreferrer">X</a></li>
            <li><a href="https://www.linkedin.com/in/drewnotweird/" target="_blank" rel="noreferrer">LI</a></li>
            <li><a href="https://www.instagram.com/drewnotweird/" target="_blank" rel="noreferrer">IG</a></li>
          </ul>
        </section>
      </main>
    </>
  )
}
