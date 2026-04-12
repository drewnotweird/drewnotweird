import { heads, bodies, legs } from '../data/monsters'

export default function TimeoutScreen({ level, correctMonster }) {
  return (
    <div className="timeout-screen">
      <div className="texture-overlay texture-lose" aria-hidden="true" />
      <div className="timeout-title">TIME'S UP!</div>
      <div className="timeout-level">Level {level}</div>
      {correctMonster && (
        <div className="timeout-monster-wrap">
          <p className="timeout-label">The monster was…</p>
          <div className="timeout-monster-card">
            <div className="timeout-monster-part">
              <img src={heads[correctMonster.head]} alt="" draggable="false" />
            </div>
            <div className="timeout-monster-part">
              <img src={bodies[correctMonster.body]} alt="" draggable="false" />
            </div>
            <div className="timeout-monster-part">
              <img src={legs[correctMonster.legs]} alt="" draggable="false" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
