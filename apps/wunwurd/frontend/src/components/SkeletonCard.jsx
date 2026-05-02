import React from 'react'

export default function SkeletonCard() {
  return (
    <div className="aspect-square bg-gray-900 animate-pulse relative overflow-hidden">
      <div
        className="absolute bottom-0 left-0 right-0 h-1/2 pointer-events-none"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 100%)' }}
      />
      <div className="absolute bottom-0 left-0 right-0 p-3 flex justify-center">
        <div className="h-8 w-2/3 bg-gray-700" />
      </div>
    </div>
  )
}
