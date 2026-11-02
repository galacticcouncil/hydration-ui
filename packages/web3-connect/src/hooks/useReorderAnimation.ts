import { useLayoutEffect, useRef } from "react"

/**
 * Slides a container's children from their previous position to the new one
 * whenever `order` changes (FLIP). Children stay in normal flow, so tiles of
 * any height work and nothing has to be positioned absolutely.
 */
export const useReorderAnimation = <T extends HTMLElement>(order: string) => {
  const ref = useRef<T>(null)
  const offsets = useRef(new Map<Element, number>())

  useLayoutEffect(() => {
    const container = ref.current
    if (!container) return

    const animate = window.matchMedia(
      "(prefers-reduced-motion: no-preference)",
    ).matches
    const previous = offsets.current
    const next = new Map<Element, number>()

    for (const child of container.children) {
      if (!(child instanceof HTMLElement)) continue

      // offsetTop ignores transforms and scroll, so a running animation or a
      // scrolled list doesn't skew the next measurement
      next.set(child, child.offsetTop)
      const delta = (previous.get(child) ?? child.offsetTop) - child.offsetTop

      if (animate && delta !== 0) {
        child.animate([{ translate: `0 ${delta}px` }, { translate: "0 0" }], {
          duration: 300,
          easing: "cubic-bezier(0.23, 1, 0.32, 1)",
        })
      }
    }

    offsets.current = next
  }, [order])

  return ref
}
