import { useRef, useEffect } from 'react'

export default function Typewriter({ text, active, className }) {
  const spanRef = useRef(null)
  const timerRef = useRef(null)

  useEffect(() => {
    const el = spanRef.current
    if (!el) return

    clearTimeout(timerRef.current)

    if (!active) {
      el.textContent = ''
      return
    }

    el.textContent = ''
    let i = 0

    function type() {
      if (i <= text.length) {
        el.textContent = text.slice(0, i)
        i++
        timerRef.current = setTimeout(type, 18)
      }
    }

    type()

    return () => clearTimeout(timerRef.current)
  }, [text, active])

  return <span ref={spanRef} className={className} />
}
