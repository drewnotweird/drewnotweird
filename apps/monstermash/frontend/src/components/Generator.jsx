import { useRef, useState, useEffect, useMemo } from 'react'
import Segment from './Segment'
import { heads, bodies, legs } from '../data/monsters'

const COUNT_STEPS = ['3', '2', '1', 'MASH!']
const COUNT_DURATIONS = [900, 900, 900, 700]

const GOLD_COLOURS = ['#ffd54f', '#ffea00', '#ffe082', '#fff176', '#ffc400', '#ffab00', '#ffffff', '#fff9c4']

function GoldSparks({ side }) {
  const sparks = useMemo(() => {
    const baseAngle = side === 'left' ? 180 : 0
    const count = 40
    return Array.from({ length: count }, (_, i) => {
      const isStar = Math.random() > 0.55  // thin elongated sparkle vs blob
      const size = isStar
        ? { w: 3 + Math.random() * 4, h: 14 + Math.random() * 22 }
        : { w: 8 + Math.random() * 20, h: 8 + Math.random() * 20 }
      return {
        id: i,
        angle: baseAngle + (i / count) * 180 - 90 + (Math.random() - 0.5) * 24,
        dist: 90 + Math.random() * 220,
        w: size.w,
        h: size.h,
        color: GOLD_COLOURS[i % GOLD_COLOURS.length],
        dur: 0.45 + Math.random() * 0.6,
        delay: Math.random() * 0.3,
        round: !isStar,
        spin: (Math.random() - 0.5) * 180,
      }
    })
  }, [side])

  return (
    <div className={`gold-sparks gold-sparks--${side}`} aria-hidden="true">
      {sparks.map(s => (
        <div
          key={s.id}
          className="gold-spark"
          style={{
            '--angle': `${s.angle}deg`,
            '--dist': `${s.dist}px`,
            '--spin': `${s.spin}deg`,
            width: s.w,
            height: s.h,
            background: s.color,
            borderRadius: s.round ? '50%' : '2px',
            animationDuration: `${s.dur}s`,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
    </div>
  )
}

export default function Generator({ revealed, onLocked, initialMonster, autoStart, showCountdown, onCountdownDone, showHint = false, level = null }) {
  const headRef = useRef()
  const bodyRef = useRef()
  const legsRef = useRef()
  const targetRef = useRef(null)
  const doneCountRef = useRef(0)
  const [locked, setLocked] = useState(false)
  const [spinning, setSpinning] = useState(!!autoStart)
  const [buttonPressed, setButtonPressed] = useState(!!autoStart)
  const [shaking, setShaking] = useState(false)
  const [thumped, setThumped] = useState(false)
  const [labelVisible, setLabelVisible] = useState(level !== 1)
  const [hintFading, setHintFading] = useState(false)
  const [hintGone, setHintGone] = useState(false)

  // Manage hint and label visibility around curtain transitions.
  useEffect(() => {
    if (!revealed) {
      // Curtain coming back down — fade label in when curtain settles
      const t = setTimeout(() => setLabelVisible(true), 1100)
      return () => clearTimeout(t)
    }
    // Curtain going up — fade hint out immediately, remove from DOM after fade
    setHintFading(true)
    const t1 = setTimeout(() => setHintGone(true), 600)
    const t2 = setTimeout(() => setButtonPressed(false), 1100)
    const t3 = setTimeout(() => setLabelVisible(false), 1100)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [revealed])

  // Countdown state — driven by showCountdown prop
  const [countStep, setCountStep] = useState(-1)

  useEffect(() => {
    if (showCountdown) setCountStep(0)
    else setCountStep(-1)
  }, [showCountdown])

  useEffect(() => {
    if (countStep < 0) return
    if (countStep >= COUNT_STEPS.length) {
      onCountdownDone?.()
      return
    }
    const t = setTimeout(() => setCountStep(s => s + 1), COUNT_DURATIONS[countStep])
    return () => clearTimeout(t)
  }, [countStep])

  useEffect(() => {
    if (!autoStart) return
    const h = Math.floor(Math.random() * 3)
    const b = Math.floor(Math.random() * 3)
    const l = Math.floor(Math.random() * 3)
    targetRef.current = { head: h, body: b, legs: l }
    doneCountRef.current = 0
    const t = setTimeout(() => {
      setSpinning(true)
      headRef.current?.spin(h)
      bodyRef.current?.spin(b)
      legsRef.current?.spin(l)
    }, 400)
    return () => clearTimeout(t)
  }, [autoStart])

  function handleButton() {
    if (spinning) return
    setButtonPressed(true)
    setShaking(true)
    setThumped(true)
    setTimeout(() => setShaking(false), 600)
    setTimeout(() => setThumped(false), 1100)
    const h = Math.floor(Math.random() * 3)
    const b = Math.floor(Math.random() * 3)
    const l = Math.floor(Math.random() * 3)
    targetRef.current = { head: h, body: b, legs: l }
    doneCountRef.current = 0
    setSpinning(true)
    headRef.current?.spin(h)
    bodyRef.current?.spin(b)
    legsRef.current?.spin(l)
  }

  function handleSegmentDone() {
    doneCountRef.current += 1
    if (doneCountRef.current >= 3) {
      setLocked(true)
      setButtonPressed(false) // fade background back to purple immediately
      setTimeout(() => onLocked(targetRef.current), 600)
    }
  }

  const countVisible = countStep >= 0 && countStep < COUNT_STEPS.length
  const isMash = countStep === 3

  return (
    <div className={`generator-panel${revealed ? ' revealed' : ''}${buttonPressed ? ' active' : ''}`}>

      <div className="texture-overlay texture-curtain" aria-hidden="true" />
      {/* Starburst — rendered before machine so it's visually behind it */}
      {locked && <div className="generator-starburst" aria-hidden="true" />}
      {locked && <GoldSparks side="left" />}
      {locked && <GoldSparks side="right" />}


      <div className={`generator-machine${shaking ? ' shaking' : ''}`}>
        <img
          className="generator-machine-img"
          src={`${import.meta.env.BASE_URL}images/machine.png`}
          alt=""
          draggable="false"
        />
        <div className="generator-tiles-overlay">
          <Segment ref={headRef} images={heads} onDone={handleSegmentDone} initialFace={initialMonster?.head ?? 0} />
          <Segment ref={bodyRef} images={bodies} onDone={handleSegmentDone} initialFace={initialMonster?.body ?? 0} />
          <Segment ref={legsRef} images={legs} onDone={handleSegmentDone} initialFace={initialMonster?.legs ?? 0} />
        </div>
        {locked && <div className="generator-locked-badge">LOCKED IN!</div>}
        {level !== null && labelVisible && (
          <div className="generator-level-label generator-level-label--fade">
            LEVEL {level}
          </div>
        )}
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
          className={`generator-button${spinning ? ' pressed' : ''}`}
          onPointerDown={handleButton}
          aria-label="Generate monster"
        />
      </div>

      {/* Countdown — outside the machine, shown to the right in landscape */}
      {countVisible && (
        <div
          className={`generator-countdown${isMash ? ' generator-countdown--mash' : ''}`}
          key={countStep}
        >
          {COUNT_STEPS[countStep]}
        </div>
      )}

      {/* "Ready to mash again?" hint — between levels, before player presses */}
      {showHint && !spinning && !locked && (
        <div className="panel-hint" key="ready-hint" aria-hidden="true">
          <p className="panel-hint-text">Let's mash<br /> another!</p>
          {/* Landscape: downward-curving arrow toward the button */}
          <svg viewBox="0 0 110 70" className="hint-arrow--right hint-arrow--down" aria-hidden="true">
            <path d="M 5,10 C 22,13 48,11 68,32 C 84,48 96,58 106,64" stroke="white" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 106,64 C 98,60 86,57 82,52" stroke="white" strokeWidth="5" fill="none" strokeLinecap="round" />
            <path d="M 106,64 C 103,55 102,46 100,42" stroke="white" strokeWidth="5" fill="none" strokeLinecap="round" />
          </svg>
          {/* Portrait: up arrow */}
          <svg viewBox="0 0 48 84" className="hint-arrow--up" aria-hidden="true">
            <path d="M 25,80 C 23,62 27,44 22,24 C 20,16 21,10 24,5" stroke="white" strokeWidth="5" fill="none" strokeLinecap="round" />
            <path d="M 24,5 C 18,14 13,20 10,28" stroke="white" strokeWidth="5" fill="none" strokeLinecap="round" />
            <path d="M 24,5 C 30,13 35,19 38,26" stroke="white" strokeWidth="5" fill="none" strokeLinecap="round" />
          </svg>
        </div>
      )}

      {/* "Find this monster" hint — travels with curtain; hintGone prevents it
          reappearing when curtain comes back down */}
      {locked && !hintGone && (
        <div className={`panel-hint panel-hint--find${hintFading ? ' panel-hint--fading' : ''}`} key="find-hint" aria-hidden="true">
          <p className="panel-hint-text">Find this<br className="landscape-br" /> monster</p>
          <svg viewBox="0 0 110 40" className="hint-arrow--right" aria-hidden="true">
            <path d="M 5,21 C 22,19 46,22 68,20 C 82,18 94,20 104,20" stroke="white" strokeWidth="5" fill="none" strokeLinecap="round" />
            <path d="M 104,20 C 96,15 88,11 83,9" stroke="white" strokeWidth="5" fill="none" strokeLinecap="round" />
            <path d="M 104,20 C 96,25 89,29 84,32" stroke="white" strokeWidth="5" fill="none" strokeLinecap="round" />
          </svg>
          <svg viewBox="0 0 48 84" className="hint-arrow--portrait-down" aria-hidden="true">
            <path d="M 24,5 C 26,23 22,41 27,61 C 29,69 28,75 25,80" stroke="white" strokeWidth="5" fill="none" strokeLinecap="round" />
            <path d="M 25,80 C 19,71 14,65 11,57" stroke="white" strokeWidth="5" fill="none" strokeLinecap="round" />
            <path d="M 25,80 C 31,72 36,66 39,58" stroke="white" strokeWidth="5" fill="none" strokeLinecap="round" />
          </svg>
        </div>
      )}

    </div>
  )
}
