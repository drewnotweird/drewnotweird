import { useState, useRef, useEffect } from 'react'
import StartScreen from './components/StartScreen'
import GameScreen from './components/GameScreen'
import GameOver from './components/GameOver'
import WinScreen from './components/WinScreen'
import { TOTAL_LEVELS } from './data/levels'
import './App.css'

const LAST_MONSTER_KEY = 'mm_last_monster'

function loadLastMonster() {
  try {
    const saved = localStorage.getItem(LAST_MONSTER_KEY)
    return saved ? JSON.parse(saved) : null
  } catch { return null }
}

function saveLastMonster(monster) {
  try { localStorage.setItem(LAST_MONSTER_KEY, JSON.stringify(monster)) } catch {}
}

export default function App() {
  const [screen, setScreen] = useState('start')
  const [level, setLevel] = useState(1)
  const [totalTime, setTotalTime] = useState(0)
  const accTimeRef = useRef(0)
  const levelRef = useRef(1)
  const prevMonsterRef = useRef(null)
  const startSlideInRef = useRef(false)

  // Initialise from localStorage so home screen shows the last played monster
  const [homeMonster, setHomeMonster] = useState(loadLastMonster)

  // Set texture CSS variables with correct base path for deployment
  useEffect(() => {
    const base = import.meta.env.BASE_URL
    const root = document.documentElement
    root.style.setProperty('--tex-curtain', `url(${base}textures/curtain-backdrop.jpg)`)
    root.style.setProperty('--tex-card',    `url(${base}textures/card-backdrop.jpg)`)
    root.style.setProperty('--tex-win',     `url(${base}textures/win-backdrop.jpg)`)
    root.style.setProperty('--tex-lose',    `url(${base}textures/lose-backdrop.jpg)`)
  }, [])

  function startGame(initialMonster) {
    prevMonsterRef.current = initialMonster ?? null
    levelRef.current = 1
    accTimeRef.current = 0
    setLevel(1)
    setTotalTime(0)
    setScreen('game')
  }

  function onLevelComplete(timeUsed, lockedMonster) {
    prevMonsterRef.current = lockedMonster ?? null
    saveLastMonster(lockedMonster)
    setHomeMonster(lockedMonster)
    accTimeRef.current += timeUsed
    if (levelRef.current >= TOTAL_LEVELS) {
      setTotalTime(accTimeRef.current)
      setScreen('win')
    } else {
      levelRef.current += 1
      setLevel(levelRef.current)
    }
  }

  function onGameOver(lastMonster) {
    if (lastMonster) {
      saveLastMonster(lastMonster)
      setHomeMonster(lastMonster)
    }
    startSlideInRef.current = false
    setScreen('start')
  }

  return (
    <div className="app-root">
      {screen === 'start' && (
        <StartScreen
          onPlay={startGame}
          slideIn={startSlideInRef.current}
          initialMonster={homeMonster}
        />
      )}
      {screen === 'game' && (
        <GameScreen
          key={level}
          level={level}
          totalLevels={TOTAL_LEVELS}
          onComplete={onLevelComplete}
          onGameOver={onGameOver}
          initialMonster={prevMonsterRef.current}
        />
      )}
      {screen === 'gameover' && (
        <GameOver level={level} totalTime={totalTime} onPlay={startGame} />
      )}
      {screen === 'win' && (
        <WinScreen totalTime={totalTime} onPlay={startGame} />
      )}
    </div>
  )
}
