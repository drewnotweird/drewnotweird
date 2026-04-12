import { forwardRef, useMemo } from 'react'
import { heads, bodies, legs } from '../data/monsters'

export default forwardRef(function Card(
  { monster, position, cardW, cardH, active, fail, onTap, index, isSlapped, isWrong, flyAway },
  ref
) {
  const { x, y, rotation } = position

  // Random fly direction — stable per card instance
  const flyDx = useMemo(() => (Math.random() - 0.5) * 500, [])
  const flyDy = useMemo(() => (Math.random() - 0.5) * 500, [])
  const flySpin = useMemo(() => (Math.random() - 0.5) * 60, [])

  const style = {
    '--rot': `${rotation}deg`,
    '--fly-dx': flyDx,
    '--fly-dy': flyDy,
    '--fly-spin': `${flySpin}deg`,
    left: `${x}px`,
    top: `${y}px`,
    width: `${cardW}px`,
    height: `${cardH}px`,
    transform: `rotate(${rotation}deg)`,
    zIndex: index + 2,
  }

  let cls = 'card'
  if (active) cls += ' card--active'
  if (isSlapped) cls += ' card--slapped'
  if (isWrong) cls += ' card--wrong'
  if (flyAway) cls += ' card--fly-away'
  else if (fail && !isSlapped && !isWrong) cls += ' card--fail-dim'

  return (
    <div
      ref={ref}
      className={cls}
      style={style}
      onPointerDown={active ? onTap : undefined}
    >
      <div className="card-part">
        <img src={heads[monster.head]} alt="" draggable="false" />
      </div>
      <div className="card-part">
        <img src={bodies[monster.body]} alt="" draggable="false" />
      </div>
      <div className="card-part">
        <img src={legs[monster.legs]} alt="" draggable="false" />
      </div>
    </div>
  )
})
