import ProjectLayout from '../components/ProjectLayout.jsx'
import ImageSection from '../components/ImageSection.jsx'

const BASE = '/work/frontpage'

export default function FrontPage() {
  return (
    <ProjectLayout slug="frontpage"
      title="Front Page"
      subtitle="Design agency rebrand"
      tags="Branding / Logo design / Animation"
      credit={`Work created at <a href="http://www.frontpage.co.uk" target="_blank">Front Page</a>`}
    >
      <ImageSection images={[
        { src: `${BASE}/frontpage02.gif`, layout: 'half', alt: 'Front Page logo animation' },
        { src: `${BASE}/frontpage03.jpg`, layout: 'half', alt: 'Front Page brand guidelines' },
        { src: `${BASE}/frontpage01.jpg`, layout: 'full', alt: 'Front Page rebrand identity' },
      ]} />

      <section>
        <p>It's not every day you get the chance to rebrand the company you work for, but that was exactly the opportunity I was given towards the end of 2017, after almost three years at Front Page.</p>
        <p>Working with a small, close-knit team, we set out to redefine how the studio presented itself — both visually and verbally. The project wasn't about a cosmetic refresh, but about properly articulating who we were, how we worked, and what we stood for.</p>
      </section>

      <section>
        <p>Together, we introduced an entirely new set of brand guidelines, including a clear and considered tone of voice. The work touched everything from identity and layout principles through to copywriting rules, giving the studio a consistent and confident foundation to build on.</p>
      </section>

      <ImageSection images={[
        { src: `${BASE}/frontpage04.jpg`, layout: 'half', alt: 'Front Page tone of voice guidelines' },
        { src: `${BASE}/frontpage05.gif`, layout: 'half', alt: 'Front Page brand in use' },
        { src: `${BASE}/frontpage06.jpg`, layout: 'full', alt: 'Front Page website' },
      ]} />

      <section>
        <p>It was a rare opportunity to turn the same level of critical thinking normally applied to client work inward — and to help shape the future direction of the place I was part of day to day.</p>
      </section>
    </ProjectLayout>
  )
}
