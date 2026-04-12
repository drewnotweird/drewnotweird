import { useRef, useEffect, useState } from 'react'
import Segment from './Segment'
import { heads, bodies, legs, titleImgs } from '../data/monsters'

// Build 3-face segment arrays dynamically so face 0 is always the initialMonster's
// exact image (any of the 3 game indices), face 1 is the title, face 2 is a
// different monster part for variety after button press.
function buildArrays(initialMonster) {
  const hIdx = initialMonster?.head ?? 0
  const bIdx = initialMonster?.body ?? 0
  const lIdx = initialMonster?.legs ?? 0

  // Face 2: pick a different index so spinning gives variety
  const altH = hIdx === 2 ? 0 : hIdx + 1
  const altB = bIdx === 2 ? 0 : bIdx + 1
  const altL = lIdx === 2 ? 0 : lIdx + 1

  return {
    imgH: [heads[hIdx], titleImgs[0], heads[altH]],
    imgB: [bodies[bIdx], titleImgs[1], bodies[altB]],
    imgL: [legs[lIdx],  titleImgs[2], legs[altL]],
    // game index for each face: face 0 = initial, face 2 = alt
    faceGameH: [hIdx, null, altH],
    faceGameB: [bIdx, null, altB],
    faceGameL: [lIdx, null, altL],
  }
}

export default function StartScreen({ onPlay, slideIn = false, initialMonster = null }) {
  const headRef = useRef()
  const bodyRef = useRef()
  const legsRef = useRef()
  const [pressed, setPressed] = useState(false)
  const [entering, setEntering] = useState(!!slideIn)
  const [titleSettled, setTitleSettled] = useState(false)
  const [shaking, setShaking] = useState(false)
  const [thumped, setThumped] = useState(false)
  const [infoOpen, setInfoOpen] = useState(false)

  // Build arrays once on mount from the initialMonster snapshot
  const arraysRef = useRef(buildArrays(initialMonster))
  const { imgH, imgB, imgL, faceGameH, faceGameB, faceGameL } = arraysRef.current

  // Slide down from above when returning from a game
  useEffect(() => {
    if (!slideIn) return
    const t = setTimeout(() => setEntering(false), 30)
    return () => clearTimeout(t)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const callbackActive = useRef(false)
  const doneCount = useRef(0)
  const pickedFaces = useRef({ head: 0, body: 0, legs: 0 })

  // Attract spin: from face 0 (last monster) through to title (face 1).
  // titleSettled fires at 1500ms (300ms delay + 1100ms longest spin + 100ms buffer).
  useEffect(() => {
    const spinTimer = setTimeout(() => {
      headRef.current?.spin(1, { laps: 1, duration: 850 })
      bodyRef.current?.spin(1, { laps: 1, duration: 980 })
      legsRef.current?.spin(1, { laps: 1, duration: 1100 })
    }, 300)
    const settleTimer = setTimeout(() => setTitleSettled(true), 1500)
    return () => { clearTimeout(spinTimer); clearTimeout(settleTimer) }
  }, [])

  function handleSegmentDone() {
    if (!callbackActive.current) return
    doneCount.current += 1
    if (doneCount.current >= 3) {
      callbackActive.current = false
      const f = pickedFaces.current
      onPlay({
        head: faceGameH[f.head],
        body: faceGameB[f.body],
        legs: faceGameL[f.legs],
      })
    }
  }

  function handleButton() {
    if (pressed || !titleSettled) return
    setPressed(true)
    setShaking(true)
    setThumped(true)
    setTimeout(() => setShaking(false), 600)
    setTimeout(() => setThumped(false), 1100)
    doneCount.current = 0
    callbackActive.current = true
    // Pick face 0 or 2 — both are monster images
    const pick = () => (Math.random() < 0.5 ? 0 : 2)
    const h = pick(), b = pick(), l = pick()
    pickedFaces.current = { head: h, body: b, legs: l }
    headRef.current?.spin(h, { laps: 1, duration: 1000 })
    bodyRef.current?.spin(b, { laps: 1, duration: 1150 })
    legsRef.current?.spin(l, { laps: 1, duration: 1300 })
  }

  const buttonLocked = !titleSettled || pressed

  return (
    <div className={`start-screen${pressed ? ' start-active' : ''}${entering ? ' entering' : ''}`}>
      <div className="start-green-overlay" />
      <div className="texture-overlay texture-curtain" aria-hidden="true" />
      <div className={`generator-machine${shaking ? ' shaking' : ''}`}>
        <img
          className="generator-machine-img"
          src={`${import.meta.env.BASE_URL}images/machine.png`}
          alt=""
          draggable="false"
        />
        <div className="generator-tiles-overlay">
          <Segment ref={headRef} images={imgH} onDone={handleSegmentDone} initialFace={0} />
          <Segment ref={bodyRef} images={imgB} onDone={handleSegmentDone} initialFace={0} />
          <Segment ref={legsRef} images={imgL} onDone={handleSegmentDone} initialFace={0} />
        </div>
        {thumped && (
          <>
            <div className="button-thud-ring button-thud-ring--1" />
            <div className="button-thud-ring button-thud-ring--2" />
            <div className="button-thud-ring button-thud-ring--3" />
            <div className="button-thud-ring button-thud-ring--4" />
            <div className="button-thud-ring button-thud-ring--5" />
          </>
        )}
        <button
          className={`generator-button${buttonLocked ? ' pressed' : ''}`}
          onPointerDown={handleButton}
          style={{ pointerEvents: buttonLocked ? 'none' : 'auto' }}
          aria-label="Play"
        />
      </div>

      {/* Info button — only before button pressed */}
      {!pressed && (
        <button className="info-button" onClick={() => setInfoOpen(true)} aria-label="How to play">?</button>
      )}

      {/* Info overlay */}
      {infoOpen && (
        <div className="info-overlay" onClick={() => setInfoOpen(false)}>
          <div className="info-panel" onClick={e => e.stopPropagation()}>
            <div className="info-title">MONSTER MASH</div>
            <p className="info-body">Spin up your monster, then find it among the scattered cards — before time runs out!</p>
            <ul className="info-list">
              <li>Press the big red button to generate your monster</li>
              <li>Study it carefully as the countdown goes</li>
              <li>Find the matching card and mash it!</li>
              <li>Faster is better — 15 levels, shrinking time limits</li>
            </ul>
            <button className="info-close" onClick={() => setInfoOpen(false)}>GOT IT!</button>
          </div>
        </div>
      )}

      {/* "Mash that button" hint
          Landscape: text then downward-pointing arrow, centred in left third.
          Portrait:  up-arrow above text, all centred at bottom. */}
      <div className={`start-hint${pressed ? ' start-hint--out' : ''}`} aria-hidden="true">
        <p className="start-hint-text">Mash that<br /> button</p>
        <svg viewBox="0 0 110 70" className="hint-arrow--right hint-arrow--down" aria-hidden="true">
          <path d="M 5,10 C 22,13 48,11 68,32 C 84,48 96,58 106,64" stroke="white" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 106,64 C 98,60 86,57 82,52" stroke="white" strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M 106,64 C 103,55 102,46 100,42" stroke="white" strokeWidth="5" fill="none" strokeLinecap="round" />
        </svg>
        <svg viewBox="0 0 48 84" className="hint-arrow--up" aria-hidden="true">
          <path d="M 25,80 C 23,62 27,44 22,24 C 20,16 21,10 24,5" stroke="white" strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M 24,5 C 18,14 13,20 10,28" stroke="white" strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M 24,5 C 30,13 35,19 38,26" stroke="white" strokeWidth="5" fill="none" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  )
}
