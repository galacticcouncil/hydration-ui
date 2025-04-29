import { useState } from "react"
import { useHarmonicIntervalFn } from "react-use"

export const useCountdown = (initialSeconds: number): number => {
  const [seconds, setSeconds] = useState(initialSeconds)

  useHarmonicIntervalFn(
    () => {
      setSeconds((seconds) => (seconds > 0 ? seconds - 1 : 0))
    },
    seconds > 0 ? 1000 : null,
  )

  return seconds
}
