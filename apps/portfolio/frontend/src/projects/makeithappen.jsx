import ProjectLayout from '../components/ProjectLayout.jsx'
import ImageSection from '../components/ImageSection.jsx'

const BASE = '/work/makeithappen'

export default function MakeItHappen() {
  return (
    <ProjectLayout slug="makeithappen"
      title="Make it Happen"
      subtitle="Inspiring digital learning"
      tags="App / UI / Animation / Illustration"
      credit={`Collaborated with Maria McParland as volunteers for <a href="https://makeithappen.club/" target="_blank" rel="noreferrer">Make it Happen</a> (at J.P. Morgan)`}
    >

      <ImageSection images={[
        { src: `${BASE}/makeithappen01.jpg`, layout: 'full' },
      ]} />
      <section>
        <p>Make it Happen is a charity with the aim to inspire children's digital learning. They run an innovative and exciting app design competition for Primary Schools across Scotland, and I have been fortunate enough to be given the opportunity of getting involved.</p>
        <p>I've helped realise a number of different apps since I started volunteering on the programme. Apps to battle climate change, help with basic colour theory, educate kids on the Coronavirus, learn about space, measuring out ingredients for recipes, anything&hellip; and all designed by kids.</p>
      </section>

      <ImageSection images={[
        { src: `${BASE}/makeithappen02.jpg`, layout: 'full' },
      ]} />

      <section>
        <p>A couple of volunteers visit a school to chat about tech and engineering. They introduce a high level workflow of getting an idea into production, and set them the challenge of designing an app. The team take all the app ideas and shortlist them for prizes before choosing one to actually create.</p>
      </section>

      <ImageSection images={[
        { src: `${BASE}/makeithappen03.jpg`, layout: 'full' },
        { src: `${BASE}/makeithappen04.jpg`, layout: 'full' },
        { src: `${BASE}/makeithappen03.gif`, layout: 'full' },
      ]} />

      <section>
        <p>The idea is quickly fleshed out, the journey flow is mapped, the UI designed, assets produced, and the app is then built in Thunkable and launched into the app stores for download. Using Thunkable means that once complete the kids can continue to evolve it on their own as it uses a block-based visual programming language designed for children and early coders.</p>
      </section>

      <ImageSection images={[
        { src: `${BASE}/makeithappen05.gif`, layout: 'full' },
      ]} />

      <section>
        <p>Working in a role where projects can span several months or even years, being able to be part of something that requires rapid turnarounds and tight deliverables is great for maintaining energy levels and creative satisfaction.</p>
        <p>If you're interested in finding out more about Make It Happen or what apps the team have helped produce on behalf of the schoolkids, you can find it all on the <a href="https://makeithappen.club/" target="_blank" rel="noreferrer">Make it Happen website</a>.</p>
      </section>
    </ProjectLayout>
  )
}
