import { useCallback, useEffect, useRef, useState } from "react"
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
  const [isHovered, setIsHovered] = useState(false)
  const activityTimeoutRef = useRef<number | null>(null)
  const isHoveredRef = useRef(false)

  const pauseHide = useCallback(() => {
    if (activityTimeoutRef.current !== null) {
      clearTimeout(activityTimeoutRef.current)
      activityTimeoutRef.current = null
    }
  }, [])

  const scheduleHide = useCallback(() => {
    pauseHide()
    activityTimeoutRef.current = window.setTimeout(() => {
      if (!isHoveredRef.current) {
        setIsActive(false)
      }
    }, FOOTER_VISIBLE_AFTER_ACTIVITY_MS)
  }, [pauseHide])

  useEffect(() => {
    const computeIsAtBottom = () => {
      const doc = document.documentElement
      const scrollTop = window.scrollY ?? doc.scrollTop ?? 0
      const viewportHeight = window.innerHeight ?? 0
      const scrollHeight = doc.scrollHeight ?? 0
      return scrollTop + viewportHeight >= scrollHeight - 2
    }

    const markActive = funnel(
      () => {
        setIsActive(true)
        scheduleHide()
      },
      { minGapMs: FOOTER_VISIBLE_AFTER_ACTIVITY_MS, triggerAt: "start" },
    )

    const onScrollOrResize = funnel(
      () => {
        setIsAtBottom(computeIsAtBottom())
        markActive.call()
      },
      { minGapMs: FOOTER_VISIBLE_AFTER_ACTIVITY_MS, triggerAt: "start" },
    )

    setIsAtBottom(computeIsAtBottom())

    addEventListener("scroll", onScrollOrResize.call, { passive: true })
    addEventListener("resize", onScrollOrResize.call, { passive: true })
    addEventListener("pointermove", markActive.call, { passive: true })
    return () => {
      removeEventListener("scroll", onScrollOrResize.call)
      removeEventListener("resize", onScrollOrResize.call)
      removeEventListener("pointermove", markActive.call)
      markActive.cancel()
      onScrollOrResize.cancel()
      if (activityTimeoutRef.current !== null) {
        clearTimeout(activityTimeoutRef.current)
      }
    }
  }, [scheduleHide])

  const hidden = !isActive && !isAtBottom && !loading && !isHovered

  const onMouseEnter = useCallback(() => {
    isHoveredRef.current = true
    setIsHovered(true)
    pauseHide()
  }, [pauseHide])

  const onMouseLeave = useCallback(() => {
    isHoveredRef.current = false
    setIsHovered(false)
    scheduleHide()
  }, [scheduleHide])

  return (
    <SFooter
      justify="space-between"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {!loading && <GigaNews isHidden={hidden} />}

      <SFooterControls hidden={hidden} gap="base" ml="auto">
        <DataProviderSelect />
      </SFooterControls>
    </SFooter>
  )
}
