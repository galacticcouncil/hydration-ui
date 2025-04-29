import { useEffect, useState } from "react"

export const useTimer = (initialSeconds: number) => {
  const [seconds, setSeconds] = useState(initialSeconds)

  useEffect(() => {
    if (initialSeconds <= 0) {
      return
    }

    const interval = setInterval(() => {
      setSeconds((seconds) => (seconds > 0 ? seconds - 1 : 0))
    }, 1000)

    const timeout = setTimeout(() => {
      clearInterval(interval)
      setSeconds(0)
    }, initialSeconds * 1000)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [initialSeconds])

  return seconds
}
