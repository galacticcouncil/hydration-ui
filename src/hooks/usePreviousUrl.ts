import { useLocation } from "@tanstack/react-location"
import { useEffect, useRef, useState } from "react"

export function usePreviousUrl() {
  const location = useLocation()
  const previousUrlRef = useRef<string | null>(null)
  const [previousUrl, setPreviousUrl] = useState<string | null>(null)

  useEffect(() => {
    setPreviousUrl(previousUrlRef.current)
    previousUrlRef.current = location.current.pathname
  }, [location, location.current.pathname])

  return previousUrl
}
