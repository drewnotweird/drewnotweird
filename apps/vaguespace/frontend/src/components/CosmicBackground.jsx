import { useEffect, useRef } from 'react'

// ── Effect: spiral vortex (track 0 — Down the Drain) ──────────────────────
function effectDrain(ctx, W, H, t, accent, state, amp) {
  ctx.fillStyle = 'rgba(0,0,0,0.18)'
  ctx.fillRect(0, 0, W, H)
  const cx = W / 2, cy = H / 2
  const speed = 0.0004 + amp * 0.0012
  const count = 120
  for (let i = 0; i < count; i++) {
    const phase = (i / count) * Math.PI * 2
    const age = ((t * speed + i * 0.018) % 1)
    const r = (1 - age) * Math.min(W, H) * 0.48
    const spin = phase + age * Math.PI * 8
    const x = cx + Math.cos(spin) * r
    const y = cy + Math.sin(spin) * r * 0.6
    const size = (1 - age) * (3.5 + amp * 4)
    const alpha = (1 - age) * (0.6 + amp * 0.4)
    ctx.beginPath()
    ctx.arc(x, y, size, 0, Math.PI * 2)
    ctx.fillStyle = accent.replace(')', `,${alpha})`).replace('rgb', 'rgba')
    ctx.fill()
  }
}

// ── Effect: lava lamp (track 1 — A Week of Pain) ──────────────────────────
function effectLava(ctx, W, H, t, accent, state, amp) {
  if (!state.blobs) {
    state.blobs = Array.from({ length: 7 }, (_, i) => ({
      x: W * 0.2 + Math.random() * W * 0.6,
      y: H * 0.5 + (Math.random() - 0.5) * H * 0.8,
      r: W * 0.1 + Math.random() * W * 0.12,
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.3,
      phase: Math.random() * Math.PI * 2,
    }))
  }
  // Dark background with slight persistence
  ctx.fillStyle = 'rgba(15,3,3,0.35)'
  ctx.fillRect(0, 0, W, H)

  for (const b of state.blobs) {
    // Buoyancy: blobs float up when below centre, sink when above
    const buoy = (H * 0.5 - b.y) * 0.00015
    b.vy += buoy * (1 + amp * 3)
    b.vy += Math.sin(t * 0.0003 + b.phase) * (0.015 + amp * 0.06)
    b.vx += (Math.random() - 0.5) * (0.04 + amp * 0.12)
    b.vx *= 0.97
    b.vy *= 0.975
    b.vy = Math.max(-0.8, Math.min(0.8, b.vy))
    b.x += b.vx
    b.y += b.vy
    // Bounce off walls
    if (b.x < b.r) { b.x = b.r; b.vx *= -0.6 }
    if (b.x > W - b.r) { b.x = W - b.r; b.vx *= -0.6 }
    if (b.y < -b.r * 0.5) { b.y = -b.r * 0.5; b.vy *= -0.5 }
    if (b.y > H + b.r * 0.5) { b.y = H + b.r * 0.5; b.vy *= -0.5 }
    // Pulsing radius
    const rr = b.r * (0.9 + Math.sin(t * 0.001 + b.phase) * 0.12 + amp * 0.35)
    // Radial gradient per blob
    const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, rr)
    grad.addColorStop(0,   accent.replace(')', ',0.92)').replace('rgb','rgba'))
    grad.addColorStop(0.5, accent.replace(')', ',0.55)').replace('rgb','rgba'))
    grad.addColorStop(1,   accent.replace(')', ',0)').replace('rgb','rgba'))
    ctx.beginPath()
    ctx.arc(b.x, b.y, rr, 0, Math.PI * 2)
    ctx.fillStyle = grad
    ctx.fill()
  }
  // Warm glow from bottom
  const bottomGrad = ctx.createLinearGradient(0, H, 0, H * 0.4)
  bottomGrad.addColorStop(0, accent.replace(')', ',0.18)').replace('rgb','rgba'))
  bottomGrad.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = bottomGrad
  ctx.fillRect(0, 0, W, H)
}

// ── Effect: particle fountain (track 2 — Eugene Kelly) ────────────────────
function effectFountain(ctx, W, H, t, accent, state, amp) {
  if (!state.particles) state.particles = []
  ctx.fillStyle = 'rgba(0,0,0,0.15)'
  ctx.fillRect(0, 0, W, H)
  const burst = Math.floor(amp * 6)
  for (let b = 0; b < burst; b++) {
    state.particles.push({
      x: W / 2 + (Math.random() - 0.5) * W * 0.3,
      y: H * 0.7,
      vx: (Math.random() - 0.5) * (4 + amp * 6),
      vy: -(Math.random() * 8 + 4 + amp * 6),
      life: 1, decay: 0.006 + Math.random() * 0.01,
      size: Math.random() * 4 + 1,
    })
  }
  while (state.particles.length < 80) {
    state.particles.push({
      x: W / 2 + (Math.random() - 0.5) * W * 0.3,
      y: H * 0.7,
      vx: (Math.random() - 0.5) * 4,
      vy: -(Math.random() * 6 + 3),
      life: 1, decay: 0.008 + Math.random() * 0.012,
      size: Math.random() * 3 + 1,
    })
  }
  for (let i = state.particles.length - 1; i >= 0; i--) {
    const p = state.particles[i]
    p.x += p.vx; p.y += p.vy; p.vy += 0.12
    p.life -= p.decay
    if (p.life <= 0) { state.particles.splice(i, 1); continue }
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2)
    ctx.fillStyle = accent.replace(')', `,${p.life * 0.85})`).replace('rgb', 'rgba')
    ctx.fill()
  }
}

// ── Effect: starfield fall (track 3 — Waiting To Fall) ───────────────────
function effectStarfield(ctx, W, H, t, accent, state, amp) {
  if (!state.stars) state.stars = []
  ctx.fillStyle = 'rgba(0,0,0,0.25)'
  ctx.fillRect(0, 0, W, H)
  while (state.stars.length < 100) {
    state.stars.push({ x: Math.random() * W, y: Math.random() * H, speed: 0.3 + Math.random() * 1.2, size: Math.random() * 2.5 + 0.3 })
  }
  for (const s of state.stars) {
    s.y += s.speed * (1 + amp * 4)
    if (s.y > H) { s.y = 0; s.x = Math.random() * W }
    ctx.beginPath()
    ctx.arc(s.x, s.y, s.size * (1 + amp * 2), 0, Math.PI * 2)
    const alpha = 0.3 + (s.speed / 1.5) * 0.6 + amp * 0.4
    ctx.fillStyle = accent.replace(')', `,${Math.min(1, alpha)})`).replace('rgb', 'rgba')
    ctx.fill()
  }
}

// ── Effect: aurora waves (track 4 — Please Don't Ask) ────────────────────
function effectAurora(ctx, W, H, t, accent, state, amp) {
  ctx.fillStyle = 'rgba(0,0,0,0.12)'
  ctx.fillRect(0, 0, W, H)
  const bands = 6
  for (let b = 0; b < bands; b++) {
    const phase = (b / bands) * Math.PI * 2
    const baseY = H * 0.2 + (b / bands) * H * 0.7
    ctx.beginPath()
    const points = 40
    for (let i = 0; i <= points; i++) {
      const px = (i / points) * W
      const py = baseY +
        Math.sin(px * 0.008 + t * 0.0006 + phase) * 30 +
        Math.sin(px * 0.012 - t * 0.0004 + phase * 1.3) * 18
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)
    }
    const alpha = 0.06 + Math.sin(t * 0.001 + phase) * 0.04 + amp * 0.2
    ctx.strokeStyle = accent.replace(')', `,${alpha})`).replace('rgb', 'rgba')
    ctx.lineWidth = 18 + Math.sin(t * 0.0008 + phase) * 10 + amp * 30
    ctx.stroke()
  }
}

// ── Effect: kaleidoscope (track 5 — Equilibrium) ─────────────────────────
function effectKaleidoscope(ctx, W, H, t, accent, state, amp) {
  ctx.fillStyle = 'rgba(0,0,0,0.08)'
  ctx.fillRect(0, 0, W, H)
  const cx = W / 2, cy = H / 2
  const slices = 8
  const maxR = Math.min(W, H) * 0.46
  const speed = 0.0003 + amp * 0.002
  for (let s = 0; s < slices; s++) {
    const angle = (s / slices) * Math.PI * 2 + t * speed
    for (let l = 0; l < 3; l++) {
      const r = maxR * 0.3 * (l + 1) * (1 + amp * 0.3)
      const x = cx + Math.cos(angle + l * 0.4 + t * 0.0005) * r
      const y = cy + Math.sin(angle + l * 0.4 + t * 0.0005) * r
      const hue = (t * 0.05 + s * 45 + l * 30) % 360
      const dotSize = 3 + l * 2 + amp * 5
      ctx.beginPath()
      ctx.arc(x, y, dotSize, 0, Math.PI * 2)
      ctx.fillStyle = `hsla(${hue}, 70%, 65%, ${0.5 + amp * 0.5})`
      ctx.fill()
      const mx = cx - (x - cx), my = cy - (y - cy)
      ctx.beginPath()
      ctx.arc(mx, my, dotSize, 0, Math.PI * 2)
      ctx.fillStyle = `hsla(${(hue + 180) % 360}, 70%, 65%, ${0.5 + amp * 0.5})`
      ctx.fill()
    }
  }
  ctx.beginPath()
  ctx.arc(cx, cy, maxR * 0.08 + Math.sin(t * 0.002) * 4 + amp * 15, 0, Math.PI * 2)
  ctx.strokeStyle = `hsla(${(t * 0.06) % 360}, 80%, 80%, ${0.4 + amp * 0.6})`
  ctx.lineWidth = 1.5 + amp * 3
  ctx.stroke()
}

// ── Color parsing helper ───────────────────────────────────────────────────
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgb(${r},${g},${b})`
}

const EFFECTS = [effectDrain, effectLava, effectFountain, effectStarfield, effectAurora, effectKaleidoscope]

export default function CosmicBackground({ trackId, accentColor, isActive, getAudioData }) {
  const canvasRef = useRef(null)
  const rafRef = useRef(null)
  const isActiveRef = useRef(isActive)
  const getAudioDataRef = useRef(getAudioData)
  const stateRef = useRef({})
  const lastTsRef = useRef(null)
  const runningTimeRef = useRef(0)

  useEffect(() => { isActiveRef.current = isActive }, [isActive])
  useEffect(() => { getAudioDataRef.current = getAudioData }, [getAudioData])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const fn = EFFECTS[trackId]
    const accent = hexToRgb(accentColor)

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      stateRef.current = {}
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const loop = (ts) => {
      rafRef.current = requestAnimationFrame(loop)
      if (isActiveRef.current) {
        const delta = lastTsRef.current ? ts - lastTsRef.current : 0
        runningTimeRef.current += delta
        const audioData = getAudioDataRef.current?.() ?? null
        // Derive a simple 0-1 amplitude from bass frequencies
        let amp = 0
        if (audioData) {
          let sum = 0
          for (let i = 0; i < 16; i++) sum += audioData[i]
          amp = Math.min(1, (sum / 16) / 180)
        }
        fn(ctx, canvas.width, canvas.height, runningTimeRef.current, accent, stateRef.current, amp)
      }
      lastTsRef.current = ts
    }
    rafRef.current = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(rafRef.current)
      ro.disconnect()
    }
  }, [trackId, accentColor])

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
    />
  )
}
