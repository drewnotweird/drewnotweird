import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import Home from './pages/Home.jsx'
import Project from './pages/Project.jsx'

const FADE = 300

function AnimatedRoutes() {
  const location = useLocation()
  const [displayed, setDisplayed] = useState(location)
  const [overlayOpacity, setOverlayOpacity] = useState(0)
  const timer = useRef(null)

  useEffect(() => {
    if (location.pathname === displayed.pathname) return
    clearTimeout(timer.current)
    // Instantly cover, swap, then fade out
    setOverlayOpacity(1)
    timer.current = setTimeout(() => {
      setDisplayed(location)
      window.scrollTo(0, 0)
      timer.current = setTimeout(() => setOverlayOpacity(0), 20)
    }, 50)
    return () => clearTimeout(timer.current)
  }, [location.pathname])

  return (
    <>
      <div style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: '#fafafa',
        opacity: overlayOpacity,
        transition: overlayOpacity === 0 ? `opacity ${FADE}ms ease` : 'none',
        pointerEvents: 'none',
      }} />
      <Routes location={displayed} key={displayed.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/work/:slug" element={<Project />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  )
}
