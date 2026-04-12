export default function TimeoutScreen({ level }) {
  const message = level <= 1
    ? 'Need to go faster next time'
    : `Your time ran out on level ${level}`

  return (
    <div className="timeout-screen">
      <div className="texture-overlay texture-lose" aria-hidden="true" />
      <div className="timeout-title">GAME OVER</div>
      <div className="timeout-message">{message}</div>
    </div>
  )
}
