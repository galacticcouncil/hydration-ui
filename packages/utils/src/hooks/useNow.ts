import { useState } from "react"
import { useHarmonicIntervalFn } from "react-use"

export const useNow = (interval: number | null = 1000) => {
  const [now, setNow] = useState(() => new Date())

  useHarmonicIntervalFn(() => {
    setNow(new Date())
  }, interval)

  return now
}
