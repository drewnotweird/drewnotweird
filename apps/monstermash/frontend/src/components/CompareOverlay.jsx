import { heads, bodies, legs } from '../data/monsters'

function MonsterCard({ monster, label, side }) {
  return (
    <div className={`compare-card compare-card--${side}`}>
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
      <div className="compare-card-label">{label}</div>
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
      <div className="compare-overlay-header">
        <div className="compare-overlay-title">GAME OVER</div>
        <div className="compare-overlay-message">{message}</div>
      </div>
      <div className="compare-overlay-cards">
        <MonsterCard monster={wrongMonster} label="Mashed" side="wrong" />
        <MonsterCard monster={correctMonster} label="Correct" side="correct" />
      </div>
    </div>
  )
}
