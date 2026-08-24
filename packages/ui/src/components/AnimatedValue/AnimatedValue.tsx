import Big from "big.js"
import { useLayoutEffect, useRef, useState } from "react"
import { useCustomCompareEffect } from "react-use"

import {
  FlashDirection,
  SFlashValue,
} from "@/components/AnimatedValue/AnimatedValue.styled"

const getContentWidth = (el: HTMLElement) => {
  const range = document.createRange()
  range.selectNodeContents(el)
  return range.getBoundingClientRect().width
}

const formattedValueHeld = (
  [key, value, format]: readonly [unknown, number, (value: number) => string],
  [prevKey, prevValue, prevFormat]: readonly [
    unknown,
    number,
    (value: number) => string,
  ],
) =>
  key === prevKey &&
  (value === prevValue || format(value) === prevFormat(prevValue))

const useValueFlash = (
  value: number,
  enabled: boolean,
  format: (value: number) => string,
) => {
  const previous = useRef<number | null>(null)
  const [flash, setFlash] = useState<{
    direction: FlashDirection
    tick: number
  }>({ direction: null, tick: 0 })

  useCustomCompareEffect(
    () => {
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
    },
    [enabled, value, format],
    formattedValueHeld,
  )

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
  const [minWidth, setMinWidth] = useState<number>()
  const startTime = useRef<number | null>(null)
  const currentValue = useRef(value)
  const endValue = useRef(value)
  const measureRef = useRef<HTMLSpanElement>(null)
  const animating = useRef(false)

  const { direction, tick } = useValueFlash(value, valueFlash, format)

  useCustomCompareEffect(
    () => {
      const startValue = currentValue.current
      const shouldAnimate = startValue !== value

      if (!shouldAnimate) {
        currentValue.current = value
        endValue.current = value
        animating.current = false
        return
      }

      endValue.current = value
      startTime.current = null
      animating.current = true
      setMinWidth(undefined)

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
        } else {
          animating.current = false
          const el = measureRef.current
          if (el) {
            setMinWidth(getContentWidth(el))
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate)
      return () => cancelAnimationFrame(animationFrameId)
    },
    [duration, value, format],
    formattedValueHeld,
  )

  const display = format(displayValue)

  useLayoutEffect(() => {
    const el = measureRef.current
    if (!el || !animating.current) return

    const contentWidth = getContentWidth(el)
    setMinWidth((prev) =>
      prev === undefined ? contentWidth : Math.max(prev, contentWidth),
    )
  }, [display])

  const content = (
    <span
      ref={measureRef}
      style={{
        display: "inline-block",
        minWidth: minWidth !== undefined ? `${minWidth}px` : undefined,
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {display}
    </span>
  )

  if (!valueFlash) return content

  return (
    <SFlashValue key={tick} direction={direction} duration={duration * 2}>
      {content}
    </SFlashValue>
  )
}
