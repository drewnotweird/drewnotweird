import React from 'react'
import { Link } from 'react-router-dom'

export default function About() {
  return (
    <div className="min-h-[80vh] max-w-2xl mx-auto px-6 py-16 text-center">

      <h1 className="text-5xl font-black uppercase text-[#FF1493] mb-12 leading-none">
        Single-word reviews
      </h1>

      <div className="space-y-8 text-xl leading-relaxed">

        <p className="text-white">
          Every film gets a number. IMDb gives you one, Rotten Tomatoes gives you another,
          Metacritic gives you a third. You can tell if something is broadly good or bad,
          but that's about it.
        </p>

        <p className="text-white">
          What if, alongside all those numbers, you also got a word?
        </p>

        <div className="border-t-4 border-b-4 border-[#FF1493] py-4">
          <p className="text-[#FF1493] font-bold uppercase text-2xl leading-snug">
            One word per film. A small piece of context.
          </p>
        </div>

        <p className="text-white">
          Anyone can submit a single word for any film. The most commonly submitted word
          rises to the top and represents that film. <span className="text-gray-400 italic">Haunting. Epic. Heartbreaking.</span> Something
          more human than a score out of 10.
        </p>

        <p className="text-white">
          You can also search by word to discover films that others have described the same way —
          find everything people have called <Link to="/word/devastating" className="text-[#FF1493] font-bold hover:text-white transition-colors">devastating</Link>,
          or <Link to="/word/unsettling" className="text-[#FF1493] font-bold hover:text-white transition-colors">unsettling</Link>,
          or <Link to="/word/joyful" className="text-[#FF1493] font-bold hover:text-white transition-colors">joyful</Link>.
        </p>

        <p className="text-gray-400">
          This idea has been rattling around for almost 20 years. It's here now. Finally.
        </p>

      </div>

      <div className="mt-16 pt-8 border-t border-gray-800 text-gray-500 text-sm">
        <p>
          Film data provided by{' '}
          <a
            href="https://www.themoviedb.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white underline transition-colors"
          >
            The Movie Database (TMDB)
          </a>
          . This product uses the TMDB API but is not endorsed or certified by TMDB. It is merely a wee idea dreamt up and put together by {' '}
          <a
            href="https://www.drewnotweird.co.uk"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white underline transition-colors"
          >
            Andrew Nicolson
          </a>.
        </p>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          to="/"
          className="inline-block bg-[#FF1493] text-black font-bold text-lg uppercase px-8 py-4 hover:bg-white transition-colors text-center"
        >
          BROWSE FILMS
        </Link>
        <Link
          to="/search"
          className="inline-block border-2 border-[#FF1493] text-[#FF1493] font-bold text-lg uppercase px-8 py-4 hover:bg-[#FF1493] hover:text-black transition-colors text-center"
        >
          SEARCH BY WORD
        </Link>
      </div>

    </div>
  )
}
