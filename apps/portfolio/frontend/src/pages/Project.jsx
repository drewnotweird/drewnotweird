import { lazy, Suspense } from 'react'
import { useParams, Navigate } from 'react-router-dom'

const projectMap = {
  whiskyblender: lazy(() => import('../projects/whiskyblender.jsx')),
  royalcaribbean: lazy(() => import('../projects/royalcaribbean.jsx')),
  airnewzealand: lazy(() => import('../projects/airnewzealand.jsx')),
  rumblender: lazy(() => import('../projects/rumblender.jsx')),
  frontpage: lazy(() => import('../projects/frontpage.jsx')),
  introducing: lazy(() => import('../projects/introducing.jsx')),
  logos: lazy(() => import('../projects/logos.jsx')),
  vaguespace: lazy(() => import('../projects/vaguespace.jsx')),
  wunwurd: lazy(() => import('../projects/wunwurd.jsx')),
}

export default function Project() {
  const { slug } = useParams()
  const ProjectComponent = projectMap[slug]

  if (!ProjectComponent) {
    return <Navigate to="/" replace />
  }

  return (
    <Suspense fallback={<div style={{ padding: '5vw 10vw' }}>Loading…</div>}>
      <ProjectComponent />
    </Suspense>
  )
}
