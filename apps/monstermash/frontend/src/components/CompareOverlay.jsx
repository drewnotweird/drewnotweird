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

export default function CompareOverlay({ wrongMonster, correctMonster }) {
  return (
    <div className="compare-overlay">
      <div className="texture-overlay texture-lose" aria-hidden="true" />
      <MonsterCard monster={wrongMonster} label="Mashed" side="wrong" />
      <MonsterCard monster={correctMonster} label="Correct" side="correct" />
    </div>
  )
}
