import { useNavigate } from 'react-router-dom'

export default function ProjectLayout({ title, subtitle, tags, credit, children }) {
  const navigate = useNavigate()

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
            <li><a href="mailto:drew@drewgibson.co" target="_blank" rel="noreferrer">@</a></li>
            <li><a href="https://x.com/drewnotweird" target="_blank" rel="noreferrer">X</a></li>
            <li><a href="https://linkedin.com/in/drewnotweird" target="_blank" rel="noreferrer">LI</a></li>
            <li><a href="https://instagram.com/drewnotweird" target="_blank" rel="noreferrer">IG</a></li>
          </ul>
        </section>
      </main>
    </>
  )
}
