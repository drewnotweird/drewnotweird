import { useState, useRef, useMemo } from 'react'
import Generator from './Generator'
import CardTable from './CardTable'
import HandSlap from './HandSlap'
import CompareOverlay from './CompareOverlay'
import TimeoutScreen from './TimeoutScreen'
import { LEVEL_CONFIG } from '../data/levels'

const BURST_COLOURS = ['#ffd54f', '#ff6d00', '#e91e63', '#00e5ff', '#76ff03', '#ff1744', '#ffea00', '#d500f9', '#00e676', '#ff9100']


function MashedBurst() {
  const pieces = useMemo(() =>
    Array.from({ length: 56 }, (_, i) => ({
      id: i,
      angle: (i / 56) * 360 + (Math.random() - 0.5) * 12,
      distance: 160 + Math.random() * 280,
      size: 10 + Math.random() * 18,
      color: BURST_COLOURS[i % BURST_COLOURS.length],
      duration: 0.7 + Math.random() * 0.6,
      delay: Math.random() * 0.25,
      shape: Math.random() > 0.5 ? '50%' : '3px',
    })), [])

  return (
    <div className="mashed-burst" aria-hidden="true">
      {pieces.map(p => (
        <div
          key={p.id}
          className="mashed-burst-piece"
          style={{
            '--angle': `${p.angle}deg`,
            '--dist': `${p.distance}px`,
            width: p.size,
            height: p.size,
            background: p.color,
            borderRadius: p.shape,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  )
}

export default function GameScreen({ level, totalLevels, onComplete, onGameOver, initialMonster }) {
  const [phase, setPhase] = useState('generating')
  const [monster, setMonster] = useState(null)
  const [generatorRevealed, setGeneratorRevealed] = useState(false)
  const [slapTarget, setSlapTarget] = useState(null)
  const [slapCorrect, setSlapCorrect] = useState(false)
  const [wrongMonster, setWrongMonster] = useState(null)
  const [levelTime, setLevelTime] = useState(0)
  const startTimeRef = useRef(0)

  const cfg = LEVEL_CONFIG[level - 1] ?? LEVEL_CONFIG[LEVEL_CONFIG.length - 1]
  const timeLimit = cfg.time
  const cardCount = cfg.cards

  function handleMonsterLocked(m) {
    setMonster(m)
    setPhase('countdown')
  }

  function handleCountdownDone() {
    setGeneratorRevealed(true)
    startTimeRef.current = performance.now()
    setTimeout(() => setPhase('playing'), 250)
  }

  function handleCardTap(isCorrect, rect, tappedMonster) {
    if (phase !== 'playing') return
    setSlapTarget(rect)
    setSlapCorrect(isCorrect)
    if (!isCorrect) setWrongMonster(tappedMonster)
    setPhase('slapping')
  }

  function handleTimeout() {
    if (phase !== 'playing') return
    setPhase('timeout')
    // Lower curtain over timeout screen, then exit
    setTimeout(() => setGeneratorRevealed(false), 3500)
    setTimeout(() => onGameOver(monster), 4600)
  }

  function handleSlapDone() {
    const elapsed = (performance.now() - startTimeRef.current) / 1000
    if (slapCorrect) {
      setLevelTime(elapsed)
      setPhase('celebrating')
      setTimeout(() => setGeneratorRevealed(false), 3000)
      setTimeout(() => onComplete(elapsed, monster), 4100)
    } else {
      setPhase('comparing')
      setTimeout(() => setGeneratorRevealed(false), 3500)
      setTimeout(() => onGameOver(monster), 4600)
    }
  }

  const tableActive = phase === 'playing'
  const tableFail = phase === 'fail' || phase === 'comparing' || phase === 'celebrating' || phase === 'timeout'

  return (
    <div className="game-screen">
      {monster && (
        <CardTable
          monster={monster}
          level={level}
          cardCount={cardCount}
          active={tableActive}
          onCardTap={handleCardTap}
          fail={tableFail || phase === 'slapping'}
          timerDuration={timeLimit}
          onTimeout={handleTimeout}
          revealed={generatorRevealed}
        />
      )}

      <Generator
        revealed={generatorRevealed}
        onLocked={handleMonsterLocked}
        initialMonster={initialMonster}
        autoStart={level === 1}
        showCountdown={phase === 'countdown'}
        onCountdownDone={handleCountdownDone}
        showHint={phase === 'generating' && level > 1}
        level={level}
      />

      {phase === 'slapping' && slapTarget && (
        <HandSlap target={slapTarget} isCorrect={slapCorrect} onComplete={handleSlapDone} />
      )}

      {phase === 'celebrating' && (
        <div className="level-clear">
          <div className="texture-overlay texture-win" aria-hidden="true" />
          <MashedBurst key={level} />
          <div className="level-clear-level">LEVEL {level}</div>
          <div className="level-clear-cleared">MASHED!</div>
          <div className="level-clear-time">{levelTime.toFixed(2)}s</div>
          {levelTime < timeLimit * 0.45 && (
            <div className="level-clear-bonus">LIGHTNING FAST!</div>
          )}
        </div>
      )}

      {phase === 'comparing' && wrongMonster && monster && (
        <CompareOverlay wrongMonster={wrongMonster} correctMonster={monster} level={level} />
      )}

      {phase === 'timeout' && monster && (
        <TimeoutScreen level={level} correctMonster={monster} />
      )}
    </div>
  )
}
