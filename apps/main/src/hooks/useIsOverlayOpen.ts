import { useEffect, useState } from "react"

/**
 * Detects whether any modal or drawer is currently open.
 *
 * Both `Modal` and the vaul `Drawer` in `@galacticcouncil/ui` are built on
 * `@radix-ui/react-dialog`, so their content nodes render
 * `role="dialog"` + `data-state="open"`. Radix popovers (including the tutorial
 * `Hint` itself) also use `role="dialog"`, but only they are wrapped in
 * `[data-radix-popper-content-wrapper]`, which is what separates the two.
 *
 * ponytail: DOM observation is the ceiling of this approach - it can only see
 * markup Radix happens to emit, and a non-Radix overlay would go unnoticed.
 * Upgrade path: a shared modal-count store in apps/main that Modal/Drawer
 * increment on open, read directly instead of watching the DOM.
 */
const OVERLAY_SELECTOR = '[role="dialog"][data-state="open"]'
const POPPER_SELECTOR = "[data-radix-popper-content-wrapper]"

const readIsOverlayOpen = () =>
  Array.from(document.querySelectorAll(OVERLAY_SELECTOR)).some(
    (element) => !element.closest(POPPER_SELECTOR),
  )

export const useIsOverlayOpen = (): boolean => {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const update = () => setIsOpen(readIsOverlayOpen())

    update()

    const observer = new MutationObserver(update)
    observer.observe(document.body, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["role", "data-state"],
    })

    return () => observer.disconnect()
  }, [])

  return isOpen
}
