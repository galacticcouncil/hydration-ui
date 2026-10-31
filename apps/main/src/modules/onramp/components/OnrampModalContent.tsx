import { Global } from "@emotion/react"
import { Box, ModalContent } from "@galacticcouncil/ui/components"
import { useBreakpoints, useTheme } from "@galacticcouncil/ui/theme"
import {
  ComponentProps,
  FC,
  Suspense,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { useMedia } from "react-use"

import { OnrampFlowSwitcherContext } from "./OnrampFlowSwitcher"
import {
  ONRAMP_STEP_TRANSITION,
  onrampModalWrapperStyles,
  SOnrampBottomContent,
  SOnrampFlowSwitcherSlot,
  SOnrampModalContent,
  SOnrampModalFooterSlot,
  SOnrampModalIntrinsicContent,
  SOnrampModalViewport,
} from "./OnrampModalContent.styled"
import { OnrampModalFooterContext } from "./OnrampModalFooter"
import { OnrampModalTopContentContext } from "./OnrampModalTopContent"
import { OnrampStepSkeleton } from "./OnrampStepSkeleton"

type OnrampModalContentProps = ComponentProps<typeof ModalContent> & {
  isOpen: boolean
  stepKey: string
  loadingTitle: string
  hasFlowSwitcher?: boolean
}

export const OnrampModalContent: FC<OnrampModalContentProps> = ({
  isOpen,
  stepKey,
  loadingTitle,
  hasFlowSwitcher = false,
  contentWidth,
  topContent,
  children,
  ...props
}) => {
  const { gte } = useBreakpoints()
  const { themeProps } = useTheme()
  const easing = themeProps.easings[ONRAMP_STEP_TRANSITION.easing]
  const contentOffset = themeProps.space.s
  const reducedMotion = useMedia("(prefers-reduced-motion: reduce)", false)
  const [content, setContent] = useState<HTMLElement | null>(null)
  const [bottomContent, setBottomContent] = useState<HTMLDivElement | null>(
    null,
  )
  const [footerSlot, setFooterSlot] = useState<HTMLDivElement | null>(null)
  const [switcherSlot, setSwitcherSlot] = useState<HTMLDivElement | null>(null)
  const [topSlot, setTopSlot] = useState<HTMLDivElement | null>(null)
  const [hasTopContent, setHasTopContent] = useState(false)
  const topContentContext = useMemo(
    () => ({ container: topSlot, setVisible: setHasTopContent }),
    [topSlot],
  )
  const [height, setHeight] = useState<number>()
  const previousStep = useRef<string | null>(null)
  const isResizing = useRef(false)

  useLayoutEffect(() => {
    if (!bottomContent) return
    const dialog = bottomContent.closest<HTMLElement>('[role="dialog"]')
    const measureBottomContent = () =>
      dialog?.style.setProperty(
        "--onramp-bottom-content-height",
        `${bottomContent.offsetHeight}px`,
      )
    measureBottomContent()
    const observer = new ResizeObserver(measureBottomContent)
    observer.observe(bottomContent)
    return () => {
      observer.disconnect()
      dialog?.style.removeProperty("--onramp-bottom-content-height")
    }
  }, [bottomContent])

  const measure = useCallback(
    (atTargetWidth = false) => {
      if (!isOpen || !content) return
      const inlineWidth = content.style.width
      if (atTargetWidth && gte("sm")) {
        // Measure the destination layout once, before paint. The visible content
        // then follows the dialog width while its height animates to this value.
        content.style.width = "var(--onramp-content-target-width)"
      }
      // offsetHeight is not affected by the native dialog's opening scale.
      const nextHeight = content.offsetHeight
      content.style.width = inlineWidth
      if (nextHeight > 0) setHeight(nextHeight)
    },
    [content, gte, isOpen],
  )

  useLayoutEffect(() => {
    if (!content) {
      setHeight(undefined)
      return
    }
    if (!isOpen) return
    measure()
    const observer = new ResizeObserver(() => {
      // Intermediate text reflows must not restart the height transition every
      // frame while the dialog is moving towards its new width.
      if (!isResizing.current) measure()
    })
    observer.observe(content)
    return () => observer.disconnect()
  }, [content, isOpen, measure])

  const reveal = useCallback(() => {
    if (!isOpen || !content || reducedMotion || !content.animate) return
    return content.animate(
      [
        { opacity: 0, translate: `0 ${contentOffset}` },
        { opacity: 1, translate: "0 0" },
      ],
      { duration: ONRAMP_STEP_TRANSITION.duration, easing },
    )
  }, [content, contentOffset, easing, isOpen, reducedMotion])

  useLayoutEffect(() => {
    if (!isOpen || !content) {
      previousStep.current = null
      return
    }
    const key = `${stepKey}:${contentWidth ?? ""}`
    const previous = previousStep.current
    previousStep.current = key
    const shouldAnimate = !!previous && previous !== key && !reducedMotion
    isResizing.current = shouldAnimate
    measure(true)
    if (!shouldAnimate) return

    // Size and reveal share upstream's easing and one timeline; form/providers
    // stay mounted throughout the transition.
    const animation = reveal()
    const timeout = window.setTimeout(() => {
      isResizing.current = false
      measure()
    }, ONRAMP_STEP_TRANSITION.duration)
    return () => {
      window.clearTimeout(timeout)
      isResizing.current = false
      animation?.cancel()
    }
  }, [content, contentWidth, isOpen, measure, reducedMotion, reveal, stepKey])

  useLayoutEffect(() => {
    if (!isOpen || !content || gte("sm")) return
    let animation: Animation | undefined
    const observer = new MutationObserver((mutations) => {
      // Bank steps animate their body locally, keeping the modal chrome still.
      if (
        mutations.every(
          ({ target }) =>
            target instanceof Element &&
            target.closest("[data-onramp-local-motion]"),
        )
      )
        return
      animation?.cancel()
      animation = reveal()
    })
    // Picker substeps keep the same form and modal while changing local views.
    observer.observe(content, {
      subtree: true,
      attributes: true,
      attributeFilter: ["data-onramp-step"],
    })
    return () => {
      observer.disconnect()
      animation?.cancel()
    }
  }, [content, gte, isOpen, reveal])

  return (
    <OnrampModalTopContentContext.Provider value={topContentContext}>
      <OnrampFlowSwitcherContext.Provider value={switcherSlot}>
        <OnrampModalFooterContext.Provider value={footerSlot}>
          <Global styles={onrampModalWrapperStyles} />
          <SOnrampModalContent
            {...props}
            data-onramp-modal
            contentWidth={contentWidth}
            topContent={
              topContent ??
              (hasTopContent ? (
                <Box ref={setTopSlot} width="100%" data-onramp-top-content />
              ) : undefined)
            }
            bottomContent={
              hasFlowSwitcher ? (
                <SOnrampBottomContent ref={setBottomContent}>
                  <SOnrampModalFooterSlot ref={setFooterSlot} />
                  <SOnrampFlowSwitcherSlot
                    ref={setSwitcherSlot}
                    data-onramp-flow-switcher
                  />
                </SOnrampBottomContent>
              ) : undefined
            }
          >
            <SOnrampModalViewport
              style={{ height: gte("sm") && height ? height : undefined }}
            >
              <SOnrampModalIntrinsicContent ref={setContent} direction="column">
                <Suspense
                  fallback={<OnrampStepSkeleton title={loadingTitle} />}
                >
                  {children}
                </Suspense>
              </SOnrampModalIntrinsicContent>
            </SOnrampModalViewport>
          </SOnrampModalContent>
        </OnrampModalFooterContext.Provider>
      </OnrampFlowSwitcherContext.Provider>
    </OnrampModalTopContentContext.Provider>
  )
}
