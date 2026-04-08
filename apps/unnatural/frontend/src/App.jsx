import { useRef, useCallback, useEffect } from 'react'
import Segment from './components/Segment.jsx'
import { head, body, legs } from './data/images.js'
import './App.css'

const COLOURS = ['#898cff', '#ff89b5', '#ffdc89', '#90d4f7', '#71e096', '#eca676', '#6893e2', '#ed6d79']

function uniqueIndices() {
  const targets = []
  while (targets.length < 3) {
    const idx = Math.floor(Math.random() * 8)
    if (!targets.includes(idx)) targets.push(idx)
  }
  return targets
}

// Pick the starting configuration once, before any render
const initialTargets = uniqueIndices()
const initialColour = Math.floor(Math.random() * COLOURS.length)

// index is 0-based (image 1 = index 0)
const CREDITS = [
  { name: 'Graham Dobie',  targets: [0, 0, 0] },
  { name: 'Lewis Fraser',  targets: [1, 1, 1] },
  { name: 'Katie Guthrie', targets: [2, 2, 2] },
  { name: 'Ruth Martin',   targets: [3, 3, 3] },
  { name: 'Kath Oakley',   targets: [[5, 5, 5], [6, 6, 6]] },
  { name: 'Ben Oliphant',  targets: [4, 4, 4] },
  { name: 'Chris Whyte',   targets: [7, 7, 7] },
]

const SEGMENTS = [
  { key: 'head', images: head, label: 'Head' },
  { key: 'body', images: body, label: 'Body' },
  { key: 'legs', images: legs, label: 'Legs' },
]

export default function App() {
  const segRefs = useRef([])
  const stageRef = useRef(null)
  const colourIdx = useRef(initialColour)
  const creditToggles = useRef({})

  const advanceColour = useCallback(() => {
    colourIdx.current = (colourIdx.current + 1) % COLOURS.length
    stageRef.current.style.backgroundColor = COLOURS[colourIdx.current]
  }, [])

  const spin = useCallback((targets = uniqueIndices(), fast = false, colour = null) => {
    segRefs.current.forEach((seg, i) => seg?.spin(targets[i], fast))
    if (colour) {
      stageRef.current.style.backgroundColor = colour
    } else {
      advanceColour()
    }
  }, [advanceColour])


  // Set initial colour and auto-spin on load
  useEffect(() => {
    stageRef.current.style.backgroundColor = COLOURS[colourIdx.current]
    const id = setTimeout(spin, 50)
    return () => clearTimeout(id)
  }, [])

  const handleTap = useCallback((e) => {
    e.preventDefault()
    spin()
  }, [spin])

  return (
    <div className="stage" ref={stageRef}>
      <p className="ui-title">Unnatural</p>
      <p className="ui-credits">
        {CREDITS.map(({ name, targets }, i) => (
          <span key={name}>
            <span
              className="credit-name"
              onClick={e => {
                e.stopPropagation()
                const resolved = Array.isArray(targets[0])
                  ? targets[(creditToggles.current[name] = ((creditToggles.current[name] ?? -1) + 1) % targets.length)]
                  : targets
                spin(resolved, true, COLOURS[resolved[0]])
              }}
              onTouchEnd={e => {
                e.stopPropagation(); e.preventDefault()
                const resolved = Array.isArray(targets[0])
                  ? targets[(creditToggles.current[name] = ((creditToggles.current[name] ?? -1) + 1) % targets.length)]
                  : targets
                spin(resolved, true, COLOURS[resolved[0]])
              }}
            >{name}</span>
            {i < CREDITS.length - 1 && <span className="credit-sep"> / </span>}
          </span>
        ))}
      </p>
      <div
        className="paper"
        onClick={handleTap}
        onTouchStart={handleTap}
      >
        {SEGMENTS.map(({ key, images, label }, i) => (
          <Segment
            key={key}
            ref={el => { segRefs.current[i] = el }}
            images={images}
            label={label}
            initialIdx={initialTargets[i]}
          />
        ))}
      </div>
    </div>
  )
}
