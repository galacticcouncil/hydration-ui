import Big from "big.js"
import { useEffect, useRef, useState } from "react"

import {
  FlashDirection,
  SFlashValue,
} from "@/components/AnimatedValue/AnimatedValue.styled"

const useValueFlash = (value: number, enabled: boolean) => {
  const previous = useRef<number | null>(null)
  const [flash, setFlash] = useState<{
    direction: FlashDirection
    tick: number
  }>({ direction: null, tick: 0 })

  useEffect(() => {
    if (!enabled) {
      previous.current = null
      setFlash((current) =>
        current.direction === null
          ? current
          : { direction: null, tick: current.tick },
      )
      return
    }

    const prev = previous.current
    previous.current = value

    if (prev === null || prev === value) return

    setFlash(({ tick }) => ({
      direction: value > prev ? "up" : "down",
      tick: tick + 1,
    }))
  }, [enabled, value])

  return flash
}

export const AnimatedValue = ({
  value,
  format,
  duration = 500,
  valueFlash = false,
}: {
  value: number
  format: (value: number) => string
  duration?: number
  valueFlash?: boolean
}) => {
  const [displayValue, setDisplayValue] = useState(value)
  const { direction, tick } = useValueFlash(value, valueFlash)
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

  if (!valueFlash) return <>{format(displayValue)}</>

  return (
    <SFlashValue key={tick} direction={direction} duration={duration * 2}>
      {format(displayValue)}
    </SFlashValue>
  )
}
