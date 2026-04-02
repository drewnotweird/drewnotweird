import { useEffect, useRef } from 'react'

const SLICE_WIDTH = (2 * Math.PI) / 2048

export default function Visualizer({ getTimeDomainData, track }) {
  const canvasRef = useRef(null)
  const rafRef = useRef(null)
  const frameRef = useRef(0)
  const trackRef = useRef(track)

  useEffect(() => { trackRef.current = track }, [track])

  const getDataRef = useRef(getTimeDomainData)
  useEffect(() => { getDataRef.current = getTimeDomainData }, [getTimeDomainData])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    // offscreen canvas for the trail effect
    const tmp = document.createElement('canvas')
    tmp.width = canvas.width
    tmp.height = canvas.height
    const tmpCtx = tmp.getContext('2d')

    const w = canvas.width
    const h = canvas.height

    function draw() {
      rafRef.current = requestAnimationFrame(draw)
      frameRef.current++
      const i = frameRef.current

      const { stepFactor, colorStepFactor, opacity, radius, amplitudeScale, bgColor } = trackRef.current

      const buf = getDataRef.current?.() ?? new Uint8Array(2048).fill(128)

      // save last frame to offscreen, cropped inward by stepFactor (zoom trail)
      tmpCtx.drawImage(
        canvas,
        w / stepFactor,
        h / stepFactor,
        w * (stepFactor - 2) / stepFactor,
        h * (stepFactor - 2) / stepFactor,
        0, 0, w, h
      )

      // clear
      ctx.fillStyle = bgColor
      ctx.fillRect(0, 0, w, h)

      // colour — same sine cycling as the original
      const csf = 199 - colorStepFactor
      const r = Math.sin(i / csf / 5) * 127.5 + 127.5
      const g = Math.sin(i / csf / 3) * 127.5 + 127.5
      const b = Math.sin(i / csf) * 127.5 + 127.5
      ctx.fillStyle = `rgb(${r|0},${g|0},${b|0})`

      // draw previous frame with opacity
      ctx.globalAlpha = opacity
      ctx.drawImage(tmp, 0, 0)
      ctx.globalAlpha = 1

      // draw waveform ring
      let theta = 0
      for (let n = 0; n < 2048; n++) {
        theta += SLICE_WIDTH
        const amp = buf[n] / 256
        const ro = amp * h * amplitudeScale + h * 0.09
        const x = w / 2 + Math.cos(theta) * ro
        const y = h / 2 + Math.sin(theta) * ro
        ctx.beginPath()
        ctx.arc(x, y, radius, 0, 2 * Math.PI)
        ctx.fill()
      }
    }

    draw()
    return () => cancelAnimationFrame(rafRef.current)
  }, []) // intentionally empty — all dynamic values read via refs

  return (
    <canvas
      ref={canvasRef}
      width={window.innerWidth * window.devicePixelRatio}
      height={window.innerHeight * window.devicePixelRatio}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
    />
  )
}
