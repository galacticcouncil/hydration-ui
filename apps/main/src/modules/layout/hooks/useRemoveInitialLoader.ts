import { useLayoutEffect } from "react"

export const useRemoveInitialLoader = () => {
  useLayoutEffect(() => {
    const loader = window.document.querySelector(".loader-container")
    if (loader) {
      // Removes initial static loader in index.html.
      loader.remove()
    }
  }, [])
}
