import { useEffect, useState } from "react"
import { debounce } from "./debounce"

export const useDebouncedState = <T>(initialState: T, ms = 300) => {
  const [value, setValue] = useState(initialState)
  const [debounced, setDebounced] = useState(initialState)
  const [set, cancel] = debounce(setDebounced, ms)

  useEffect(() => {
    return () => {
      cancel?.()
    }
  })

  useEffect(() => {
    set?.(value)
  }, [value])

  return [value, debounced, setValue] as const
}
