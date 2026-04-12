import { heads, bodies, legs } from '../data/monsters'

const CrossIcon = () => (
  <svg className="compare-card-icon compare-card-icon--wrong" viewBox="0 0 40 40">
    <line x1="8" y1="8" x2="32" y2="32" stroke="white" strokeWidth="5" strokeLinecap="round"/>
    <line x1="32" y1="8" x2="8" y2="32" stroke="white" strokeWidth="5" strokeLinecap="round"/>
  </svg>
)

const TickIcon = () => (
  <svg className="compare-card-icon compare-card-icon--correct" viewBox="0 0 40 40">
    <polyline points="6,21 16,31 34,10" fill="none" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

function MonsterCard({ monster, side }) {
  return (
    <div className="compare-card-inner">
      <div className="compare-card-part">
        <img src={heads[monster.head]} alt="" draggable="false" />
      </div>
      <div className="compare-card-part">
        <img src={bodies[monster.body]} alt="" draggable="false" />
      </div>
      <div className="compare-card-part">
        <img src={legs[monster.legs]} alt="" draggable="false" />
      </div>
    </div>
  )
}

export default function CompareOverlay({ wrongMonster, correctMonster, level }) {
  const message = level <= 1
    ? 'Better luck next time'
    : `You reached level ${level}`

  return (
    <div className="compare-overlay">
      <div className="texture-overlay texture-lose" aria-hidden="true" />
      <div className="compare-overlay-title">GAME OVER</div>
      <div className="compare-overlay-cards">
        {/* Wrong card: cross to the left */}
        <div className={`compare-card compare-card--wrong`}>
          <CrossIcon />
          <MonsterCard monster={wrongMonster} side="wrong" />
        </div>
        {/* Correct card: tick to the right */}
        <div className={`compare-card compare-card--correct`}>
          <MonsterCard monster={correctMonster} side="correct" />
          <TickIcon />
        </div>
      </div>
      <div className="compare-overlay-message">{message}</div>
    </div>
  )
}
