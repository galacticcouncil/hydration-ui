import { PointerEvent, ReactNode, useEffect, useRef } from "react"

import { SDepositQuickChainScroll } from "./DepositQuickAssetDropdown.styled"

type DragState = {
  pointerId: number
  startX: number
  scrollLeft: number
  captureTarget: Element
  moved: boolean
}

/** Native touch/trackpad scrolling, plus mouse dragging without selecting a chain. */
export const DepositChainFilterScroll = ({
  children,
}: {
  children: ReactNode
}) => {
  const viewport = useRef<HTMLDivElement>(null)
  const drag = useRef<DragState | null>(null)
  const suppressClick = useRef(false)

  useEffect(() => {
    const element = viewport.current
    if (!element) return
    const wheel = (event: WheelEvent) => {
      // Horizontal trackpad gestures and pinch zoom retain their native behavior.
      if (event.ctrlKey || event.shiftKey || event.deltaX || !event.deltaY)
        return
      const unit =
        event.deltaMode === 1
          ? 16
          : event.deltaMode === 2
            ? element.clientWidth
            : 1
      const before = element.scrollLeft
      element.scrollLeft += event.deltaY * unit
      if (element.scrollLeft !== before) event.preventDefault()
    }
    element.addEventListener("wheel", wheel, { passive: false })
    return () => element.removeEventListener("wheel", wheel)
  }, [])

  const finishDrag = (event: PointerEvent<HTMLElement>) => {
    const current = drag.current
    if (!current || current.pointerId !== event.pointerId) return
    suppressClick.current = current.moved
    drag.current = null
    delete event.currentTarget.dataset.dragging
    if (current.captureTarget.hasPointerCapture(event.pointerId)) {
      current.captureTarget.releasePointerCapture(event.pointerId)
    }
  }

  return (
    <SDepositQuickChainScroll
      ref={viewport}
      data-onramp-chain-scroll
      onDragStart={(event) => event.preventDefault()}
      onPointerDown={(event) => {
        if (event.pointerType !== "mouse" || event.button !== 0) return
        suppressClick.current = false
        const element = event.currentTarget
        if (element.scrollWidth <= element.clientWidth) return
        // Capture the original button so a normal click still selects it.
        const captureTarget =
          (event.target as Element).closest("button") ?? element
        drag.current = {
          pointerId: event.pointerId,
          startX: event.clientX,
          scrollLeft: element.scrollLeft,
          captureTarget,
          moved: false,
        }
        captureTarget.setPointerCapture(event.pointerId)
      }}
      onPointerMove={(event) => {
        const current = drag.current
        if (!current || current.pointerId !== event.pointerId) return
        if (!(event.buttons & 1)) return finishDrag(event)
        const distance = event.clientX - current.startX
        if (!current.moved && Math.abs(distance) < 5) return
        current.moved = true
        event.currentTarget.dataset.dragging = ""
        event.preventDefault()
        event.currentTarget.scrollLeft = current.scrollLeft - distance
      }}
      onPointerUp={finishDrag}
      onPointerCancel={finishDrag}
      onLostPointerCapture={finishDrag}
      onClickCapture={(event) => {
        if (!suppressClick.current || event.detail === 0) return
        suppressClick.current = false
        event.preventDefault()
        event.stopPropagation()
      }}
    >
      {children}
    </SDepositQuickChainScroll>
  )
}
