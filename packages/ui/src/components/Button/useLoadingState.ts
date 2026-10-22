import { useEffect, useRef, useState } from "react"

export const LOADING_ENTER_DELAY_MS = 250
export const LOADING_ENTER_MS = 300
export const LOADING_EXIT_MS = 150

/**
 * Debounces a loading flag into a committed busy state: short loads never
 * render at all, and once rendered the state is held for exactly as long as
 * the enter transition needs to finish, so it can never reverse mid-flight.
 */
export const useLoadingState = (
  isLoading: boolean,
  delay = LOADING_ENTER_DELAY_MS,
  minDuration = LOADING_ENTER_MS,
) => {
  const [isBusy, setIsBusy] = useState(false)
  const shownAt = useRef(0)

  useEffect(() => {
    if (isLoading) {
      if (isBusy) return
      const id = setTimeout(() => {
        shownAt.current = Date.now()
        setIsBusy(true)
      }, delay)
      return () => clearTimeout(id)
    }

    if (!isBusy) return
    const remaining = shownAt.current + minDuration - Date.now()
    if (remaining <= 0) {
      setIsBusy(false)
      return
    }
    const id = setTimeout(() => setIsBusy(false), remaining)
    return () => clearTimeout(id)
  }, [isLoading, isBusy, delay, minDuration])

  return isBusy
}
