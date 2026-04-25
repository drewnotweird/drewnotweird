import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Search from './pages/Search'
import MovieDetail from './pages/MovieDetail'
import Login from './pages/Login'
import Profile from './pages/Profile'
import WordPage from './pages/WordPage'
import About from './pages/About'

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/movie/:tmdbId" element={<MovieDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/word/:word" element={<WordPage />} />
          <Route path="/search-words" element={<WordPage />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </div>
    </AuthProvider>
  )
}
