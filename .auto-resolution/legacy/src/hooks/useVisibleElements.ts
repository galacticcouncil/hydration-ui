import { useEffect, useMemo, useRef, useState } from "react"

type VisibilityMap = Record<string, boolean>

/**
 * This hook is used to determine which elements inside a container are visible using IntersectionObserver
 * Add `data-intersect` attribute with string value as a key, to track elements inside an observed container
 */
export function useVisibleElements<T extends HTMLElement>() {
  const [visible, setVisible] = useState<VisibilityMap>({})
  const [forceRender, setForceRender] = useState(0)
  const ref = useRef<T>(null)

  useEffect(() => {
    const rootElement = ref.current
    const observer = new IntersectionObserver(
      (entries) => {
        const updatedEntries: VisibilityMap = {}
        entries.forEach((entry) => {
          const target = entry.target as T
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
  }, [ref, forceRender])

  useEffect(() => {
    const mutations = new MutationObserver((mutations) => {
      let shouldRerender = false
      mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
          shouldRerender = true
        }
      })
      if (shouldRerender) setForceRender((prev) => prev + 1)
    })
    if (ref.current) {
      mutations.observe(ref.current, {
        childList: true,
      })
    }
    return () => {
      mutations.disconnect()
    }
  }, [])

  const hiddenElementsKeys = useMemo(() => {
    return Object.entries(visible).reduce<string[]>(
      (memo, [item, isVisible]) => {
        if (!isVisible) memo.push(item)

        return memo
      },
      [],
    )
  }, [visible])

  return {
    visible,
    hiddenElementsKeys,
    observe: ref,
  }
}
