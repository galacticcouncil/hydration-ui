import { useLayoutEffect, useRef } from "react"

import { SMorphLabel } from "@/components/MorphLabel/MorphLabel.styled"

type MorphLabelProps = {
  readonly text: string
}

export const MorphLabel = ({ text }: MorphLabelProps) => {
  const wrapRef = useRef<HTMLSpanElement>(null)
  const syncedTextRef = useRef(text)
  const didInitRef = useRef(false)

  useLayoutEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return

    const morphEase = "0.35s cubic-bezier(0.19, 1, 0.22, 1)"

    if (!didInitRef.current) {
      didInitRef.current = true
      wrap.innerHTML = ""
      syncedTextRef.current = text
      const first = document.createElement("span")
      first.textContent = text
      wrap.appendChild(first)
      wrap.style.width = `${first.scrollWidth}px`
      wrap.style.transition = `width ${morphEase}`
      return
    }

    if (text === syncedTextRef.current) return
    syncedTextRef.current = text

    const all = Array.from(wrap.querySelectorAll(":scope > span"))
    const current = all[all.length - 1] as HTMLElement | undefined
    all.slice(0, -1).forEach((n) => n.remove())

    const next = document.createElement("span")
    next.textContent = text
    next.classList.add("enter-from-below")
    wrap.appendChild(next)

    const nextWidth = next.scrollWidth
    const currentWidth = wrap.offsetWidth
    wrap.style.width = `${currentWidth}px`
    wrap.style.transition = `width ${morphEase}`

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        next.classList.remove("enter-from-below")
        wrap.style.width = `${nextWidth}px`
        if (current) current.classList.add("exit-up")
      })
    })

    if (current) {
      const removeCurrent = () => current.remove()
      current.addEventListener("transitionend", removeCurrent, { once: true })
      setTimeout(removeCurrent, 400)
    }
  }, [text])

  return <SMorphLabel ref={wrapRef} aria-live="polite" />
}
