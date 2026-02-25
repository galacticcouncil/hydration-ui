import { useEffect } from "react"

export const useRemoveInitialLoader = () => {
  useEffect(() => {
    const loader = window.document.querySelector(".loader-container")
    if (loader) {
      // Removes initial static loader in index.html.
      loader.remove()
    }
  }, [])
}
