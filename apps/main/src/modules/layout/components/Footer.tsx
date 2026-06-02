import { useEffect, useRef, useState } from "react"
import { funnel } from "remeda"

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

    const { call: markActive } = funnel(
      () => {
        setIsActive(true)
        if (activityTimeoutRef.current !== null) {
          clearTimeout(activityTimeoutRef.current)
        }
        activityTimeoutRef.current = window.setTimeout(() => {
          setIsActive(false)
        }, FOOTER_VISIBLE_AFTER_ACTIVITY_MS)
      },
      { minGapMs: FOOTER_VISIBLE_AFTER_ACTIVITY_MS, triggerAt: "start" },
    )

    const { call: onScrollOrResize } = funnel(
      () => {
        setIsAtBottom(computeIsAtBottom())
        markActive()
      },
      { minGapMs: FOOTER_VISIBLE_AFTER_ACTIVITY_MS, triggerAt: "start" },
    )

    setIsAtBottom(computeIsAtBottom())

    addEventListener("scroll", onScrollOrResize, { passive: true })
    addEventListener("resize", onScrollOrResize, { passive: true })
    addEventListener("pointermove", markActive, { passive: true })
    return () => {
      removeEventListener("scroll", onScrollOrResize)
      removeEventListener("resize", onScrollOrResize)
      removeEventListener("pointermove", markActive)
      if (activityTimeoutRef.current !== null) {
        clearTimeout(activityTimeoutRef.current)
      }
    }
  }, [])

  const hidden = !isActive && !isAtBottom && !loading

  return (
    <SFooter justify="space-between">
      {!loading && <GigaNews isHidden={hidden} />}

      <SFooterControls hidden={hidden} gap="base" ml="auto">
        <DataProviderSelect />
      </SFooterControls>
    </SFooter>
  )
}
