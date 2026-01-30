import Big from "big.js"
import { useEffect, useRef, useState } from "react"

export const AnimatedValue = ({
  value,
  format,
}: {
  value: number
  format: (value: number) => string
}) => {
  const [displayValue, setDisplayValue] = useState(value)
  const startTime = useRef<number | null>(null)
  const startValue = useRef(value)
  const endValue = useRef(value)
  const duration = 300

  useEffect(() => {
    endValue.current = value
    startTime.current = null

    let animationFrameId: number

    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp
      const progress = timestamp - startTime.current
      const percentage = Math.min(progress / duration, 1)

      // Ease out cubic
      const ease = 1 - Math.pow(1 - percentage, 3)

      const current = Big(startValue.current)
        .plus(endValue.current)
        .minus(startValue.current)
        .times(ease)
        .toNumber()

      setDisplayValue(current)

      if (percentage < 1) {
        animationFrameId = requestAnimationFrame(animate)
      }
    }

    animationFrameId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrameId)
  }, [value])

  return <>{format(displayValue)}</>
}
