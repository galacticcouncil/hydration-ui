import { useEffect } from "react"

/**
 * Used as fallback in Suspense.
 *
 * Removes initial static loader in index.html.
 */
export const AppLoader = () => {
  useEffect(() => {
    return () => {
      const loader = window.document.querySelector(".loader-container")
      if (loader) {
        loader.remove()
      }
    }
  }, [])

  return null
}
