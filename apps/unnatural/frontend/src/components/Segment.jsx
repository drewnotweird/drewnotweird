import { useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react'

// 8 images repeated 7 times so we can spin ±2 laps in either direction
// from any position, with room to spare. After each spin we reset to the
// middle repetition (index 3) invisibly, keeping things centred forever.
const N = 8      // images per segment
const REPS = 7   // repetitions in the strip
const MID = 3    // which repetition is "home"
const TOTAL = N * REPS // 56

function toTranslate(pos) {
  // translateX percent is relative to the element itself (the strip).
  // Strip width = TOTAL * window width, so 1 image = 100%/TOTAL of strip.
  return `translateX(${(-pos * 100 / TOTAL).toFixed(6)}%)`
}

const Segment = forwardRef(function Segment({ images, label, initialIdx = 0 }, ref) {
  const stripRef = useRef(null)
  const posRef = useRef(MID * N + initialIdx)
  const busyRef = useRef(false)

  useEffect(() => {
    stripRef.current.style.transition = 'none'
    stripRef.current.style.transform = toTranslate(posRef.current)
  }, [])

  const spin = useCallback((targetIdx, fast = false) => {
    // fast (credit click) always interrupts; normal taps respect busyRef
    if (!fast && busyRef.current) return
    busyRef.current = true

    const strip = stripRef.current

    // Snap to current visual position so we don't jump on interrupt
    if (fast) {
      const computed = window.getComputedStyle(strip).transform
      strip.style.transition = 'none'
      strip.style.transform = computed
      // Force reflow so the transition cancels cleanly
      void strip.offsetWidth
    }

    const currentIdx = posRef.current - MID * N
    const dir = Math.random() < 0.5 ? 1 : -1
    const extraLaps = fast ? 0 : Math.floor(Math.random() * 2) + 1
    const duration = fast
      ? 600 + Math.random() * 300    // 600–900 ms
      : 3000 + Math.random() * 2000  // 3000–5000 ms

    // Steps needed in the chosen direction to reach targetIdx
    const stepsToTarget = dir === 1
      ? (targetIdx - currentIdx + N) % N
      : (currentIdx - targetIdx + N) % N

    const steps = extraLaps * N + stepsToTarget
    const newPos = posRef.current + dir * steps

    strip.style.transition = `transform ${duration}ms ease-in-out`
    strip.style.transform = toTranslate(newPos)

    // After settling, snap back to the middle repetition (no visible jump)
    const resetPos = MID * N + targetIdx
    strip.addEventListener('transitionend', () => {
      posRef.current = resetPos
      strip.style.transition = 'none'
      strip.style.transform = toTranslate(resetPos)
      busyRef.current = false
    }, { once: true })
  }, [])

  useImperativeHandle(ref, () => ({ spin }), [spin])

  // Build the full strip: REPS copies of the 8 images
  const cells = Array.from({ length: REPS }, () => images).flat()

  return (
    <div className="segment-window" aria-label={label}>
      <div ref={stripRef} className="segment-strip">
        {cells.map((src, i) => (
          <div key={i} className="segment-cell">
            <img
              src={src}
              alt=""
              draggable="false"
              onError={e => { e.currentTarget.style.opacity = '0' }}
            />
          </div>
        ))}
      </div>
    </div>
  )
})

export default Segment
