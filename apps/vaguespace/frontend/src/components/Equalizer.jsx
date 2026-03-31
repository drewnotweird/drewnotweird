const BARS = {
  orbit:    5,
  scanline: 4,
  scatter:  7,
  tilt:     5,
  waveform: 10,
  mirror:   6,
}

export default function Equalizer({ eqStyle, isActive, accentColor }) {
  const count = BARS[eqStyle] || 5
  return (
    <div className={`eq eq--${eqStyle} ${isActive ? 'eq--active' : ''}`}
      style={{ '--accent': accentColor }}>
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} className="eq-bar" style={{ '--i': i, '--total': count }} />
      ))}
    </div>
  )
}
