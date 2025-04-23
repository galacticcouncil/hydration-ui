import { useState, useEffect } from "react"

export type UseWindowFocusHookOptions = {
  onBlur?: () => void
  onFocus?: () => void
}

const hasFocus = () => typeof document !== "undefined" && document.hasFocus()

export const useWindowFocus = ({
  onFocus,
  onBlur,
}: UseWindowFocusHookOptions = {}) => {
  const [focused, setFocused] = useState(hasFocus())

  useEffect(() => {
    setFocused(hasFocus())

    function onFocusHandler() {
      onFocus?.()
      setFocused(true)
    }

    function onBlurHandler() {
      onBlur?.()
      setFocused(false)
    }

    window.addEventListener("focus", onFocusHandler)
    window.addEventListener("blur", onBlurHandler)

    return () => {
      window.removeEventListener("focus", onFocusHandler)
      window.removeEventListener("blur", onBlurHandler)
    }
  }, [onBlur, onFocus])

  return focused
}
