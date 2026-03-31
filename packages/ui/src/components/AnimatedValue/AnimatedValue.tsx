import Big from "big.js"
import { useEffect, useRef, useState } from "react"

export const AnimatedValue = ({
  value,
  format,
  duration = 300,
}: {
  value: number
  format: (value: number) => string
  duration?: number
}) => {
  const [displayValue, setDisplayValue] = useState(value)
  const startTime = useRef<number | null>(null)
  const currentValue = useRef(value)
  const endValue = useRef(value)

  useEffect(() => {
    const startValue = currentValue.current
    endValue.current = value
    startTime.current = null

    let animationFrameId: number

    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp
      const progress = timestamp - startTime.current
      const percentage = Math.min(progress / duration, 1)

      // Ease out cubic
      const ease = 1 - Math.pow(1 - percentage, 3)

      const current = Big(startValue)
        .plus(Big(endValue.current).minus(startValue).times(ease))
        .toNumber()

      currentValue.current = current
      setDisplayValue(current)

      if (percentage < 1) {
        animationFrameId = requestAnimationFrame(animate)
      }
    }

    animationFrameId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrameId)
  }, [duration, value])

  return <>{format(displayValue)}</>
}
