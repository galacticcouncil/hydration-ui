import { useTheme } from "@galacticcouncil/ui/theme"
import { FC, ReactNode, useLayoutEffect, useRef } from "react"
import { useMedia } from "react-use"

import { SOnrampFlowContent } from "./OnrampFlowContent.styled"
import { ONRAMP_STEP_TRANSITION } from "./OnrampModalContent.styled"

type OnrampLocalStepProps = {
  stepKey: string
  children: ReactNode
}

/** Animate picker navigation without remounting its form or providers. */
export const OnrampLocalStep: FC<OnrampLocalStepProps> = ({
  stepKey,
  children,
}) => {
  const { themeProps } = useTheme()
  const reducedMotion = useMedia("(prefers-reduced-motion: reduce)", false)
  const root = useRef<HTMLDivElement>(null)
  const previousStep = useRef(stepKey)
  const offset = themeProps.space.base
  const easing = themeProps.easings[ONRAMP_STEP_TRANSITION.easing]

  useLayoutEffect(() => {
    const previous = previousStep.current
    previousStep.current = stepKey
    if (previous === stepKey || reducedMotion) return
    const body =
      root.current?.querySelector("[data-onramp-step-body]") ?? root.current
    if (!(body instanceof HTMLElement) || !body.animate) return
    const animation = body.animate(
      [
        { opacity: 0, transform: `translateY(${offset})` },
        { opacity: 1, transform: "translateY(0)" },
      ],
      { duration: ONRAMP_STEP_TRANSITION.duration, easing },
    )
    animation.id = "onramp-local-step-reveal"
    return () => animation.cancel()
  }, [stepKey, reducedMotion, offset, easing])

  return (
    <SOnrampFlowContent
      ref={root}
      direction="column"
      flex={1}
      sx={{ minHeight: 0 }}
      width="100%"
      data-onramp-local-motion
      data-onramp-step={stepKey}
    >
      {children}
    </SOnrampFlowContent>
  )
}
