import React from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import MovieDetail from './pages/MovieDetail'
import Login from './pages/Login'
import Profile from './pages/Profile'
import WordPage from './pages/WordPage'
import About from './pages/About'
import Lab from './pages/Lab'

function AppContent() {
  const { pathname } = useLocation()
  return (
    <div className="min-h-screen bg-black text-white">
      {pathname !== '/' && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<WordPage />} />
        <Route path="/movie/:tmdbId" element={<MovieDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/word/:word" element={<WordPage />} />
        <Route path="/about" element={<About />} />
        <Route path="/lab" element={<Lab />} />
      </Routes>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
