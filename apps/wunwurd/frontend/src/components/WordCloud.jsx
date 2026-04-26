import React from 'react'
import { Link } from 'react-router-dom'

export default function WordCloud({ words, userWord }) {
  if (!words || words.length === 0) return null

  return (
    <div className="flex flex-wrap gap-x-8 gap-y-3 justify-center py-4">
      {words.map(({ word, count }, i) => {
        const isUserWord = userWord && word === userWord.toLowerCase()
        return (
          <Link
            key={word}
            to={`/word/${word}`}
            className={`font-bold uppercase text-4xl hover:text-[#FF1493] transition-colors ${
              isUserWord ? 'text-[#FF1493]' : 'text-white'
            }`}
            title={`${count} vote${count !== 1 ? 's' : ''}`}
            style={{ animation: 'fadeIn 400ms ease both', animationDelay: `${i * 70}ms` }}
          >
            {word.toUpperCase()}
          </Link>
        )
      })}
    </div>
  )
}
