import { useEffect, useRef, useState } from "react"

import { DataProviderSelect } from "@/components/DataProviderSelect/DataProviderSelect"
import { GigaNews } from "@/components/GigaNews/GigaNews"
import {
  SFooter,
  SFooterControls,
} from "@/modules/layout/components/Footer.styled"

const FOOTER_VISIBLE_AFTER_ACTIVITY_MS = 1000

export const Footer = ({ loading }: { loading?: boolean }) => {
  const [isActive, setIsActive] = useState(false)
  const [isAtBottom, setIsAtBottom] = useState(false)
  const activityTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    const computeIsAtBottom = () => {
      const doc = document.documentElement
      const scrollTop = window.scrollY ?? doc.scrollTop ?? 0
      const viewportHeight = window.innerHeight ?? 0
      const scrollHeight = doc.scrollHeight ?? 0
      return scrollTop + viewportHeight >= scrollHeight - 2
    }

    const markActive = () => {
      setIsActive(true)
      if (activityTimeoutRef.current !== null) {
        clearTimeout(activityTimeoutRef.current)
      }
      activityTimeoutRef.current = window.setTimeout(() => {
        setIsActive(false)
      }, FOOTER_VISIBLE_AFTER_ACTIVITY_MS)
    }

    const onScrollOrResize = () => {
      setIsAtBottom(computeIsAtBottom())
      markActive()
    }

    setIsAtBottom(computeIsAtBottom())

    window.addEventListener("scroll", onScrollOrResize, { passive: true })
    window.addEventListener("resize", onScrollOrResize, { passive: true })
    window.addEventListener("pointermove", markActive, { passive: true })
    return () => {
      window.removeEventListener("scroll", onScrollOrResize)
      window.removeEventListener("resize", onScrollOrResize)
      window.removeEventListener("pointermove", markActive)
      if (activityTimeoutRef.current !== null) {
        window.clearTimeout(activityTimeoutRef.current)
      }
    }
  }, [])

  const hidden = !isActive && !isAtBottom && !loading

  return (
    <SFooter justify="space-between">
      {!loading ? <GigaNews isHidden={hidden} /> : <div />}

      <SFooterControls $hidden={hidden} gap="base">
        <DataProviderSelect />
      </SFooterControls>
    </SFooter>
  )
}
