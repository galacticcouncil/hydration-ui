import { useEffect, useRef, useState } from "react"

type VisibilityMap = Record<string, boolean>

/**
 * This hook is used to determine which elements inside a container are visible using IntersectionObserver
 * Add `data-intersect` attribute with string value as a key, to track elements inside an observed container
 */
export function useVisibleElements<
  TRoot extends HTMLElement,
  TItem extends HTMLElement,
>() {
  const [visible, setVisible] = useState<VisibilityMap>({})
  const ref = useRef<TRoot>(null)

  useEffect(() => {
    const rootElement = ref.current
    const observer = new IntersectionObserver(
      (entries) => {
        const updatedEntries: VisibilityMap = {}
        entries.forEach((entry) => {
          const target = entry.target as TItem
          const intersectKey = target.dataset.intersect
          if (intersectKey) {
            updatedEntries[intersectKey] = entry.isIntersecting
          }
        })

        setVisible((prev) => ({
          ...prev,
          ...updatedEntries,
        }))
      },
      { threshold: 1, root: rootElement },
    )

    if (rootElement) {
      Array.from(rootElement.children).forEach((item) => {
        if (item instanceof HTMLElement && item.dataset.intersect) {
          observer.observe(item)
        }
      })

      return () => {
        observer.disconnect()
      }
    }
  }, [ref])

  return {
    visible,
    observe: ref,
  }
}
