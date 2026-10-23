import { TabsContent, TabsRoot } from "@galacticcouncil/ui/components"
import { useTheme } from "@galacticcouncil/ui/theme"
import { FC, ReactNode, useLayoutEffect, useRef } from "react"
import { useTranslation } from "react-i18next"
import { useMedia } from "react-use"

import { OnrampFlowSwitcher } from "@/modules/onramp/components/OnrampFlowSwitcher"
import { ONRAMP_STEP_TRANSITION } from "@/modules/onramp/components/OnrampModalContent.styled"

import { SBankFlowContent, SBankFlowRoot } from "./BankFlowSwitcher.styled"

export type BankFlowVariant = "current" | "v2"

type BankFlowSwitcherProps = {
  variant: BankFlowVariant
  onVariantChange: (variant: BankFlowVariant) => void
  stepKey?: string
  children: ReactNode
}

export const BankFlowSwitcher: FC<BankFlowSwitcherProps> = ({
  variant,
  onVariantChange,
  stepKey,
  children,
}) => {
  const { t } = useTranslation("onramp")
  const { themeProps } = useTheme()
  const reducedMotion = useMedia("(prefers-reduced-motion: reduce)", false)
  const root = useRef<HTMLDivElement>(null)
  const previousStep = useRef<string | null>(null)
  const transitionKey = `${variant}:${stepKey ?? ""}`
  const offset = themeProps.space.base
  const easing = themeProps.easings[ONRAMP_STEP_TRANSITION.easing]

  useLayoutEffect(() => {
    const previous = previousStep.current
    previousStep.current = transitionKey
    if (!previous || previous === transitionKey || reducedMotion) return

    const body = root.current?.querySelector("[data-bank-flow-body]")
    const content = body?.firstElementChild
    if (!(content instanceof HTMLElement) || !content.animate) return

    // Reveal only the new step content; keep the form, header and actions mounted.
    const animation = content.animate(
      [
        { opacity: 0, transform: `translateY(${offset})` },
        { opacity: 1, transform: "translateY(0)" },
      ],
      { duration: ONRAMP_STEP_TRANSITION.duration, easing },
    )
    animation.id = "bank-step-reveal"
    return () => animation.cancel()
  }, [transitionKey, offset, easing, reducedMotion])

  return (
    <TabsRoot
      value={variant}
      onValueChange={(value) => onVariantChange(value as BankFlowVariant)}
      activationMode="manual"
      asChild
    >
      <SBankFlowRoot
        ref={root}
        direction="column"
        width="100%"
        data-onramp-local-motion
        data-onramp-step={`bank:${variant}:${stepKey ?? ""}`}
      >
        <TabsContent value={variant} asChild>
          <SBankFlowContent direction="column" width="100%">
            {children}
          </SBankFlowContent>
        </TabsContent>
        <OnrampFlowSwitcher
          label={t("bankV2.tabs.label")}
          value={variant}
          options={(["current", "v2"] as const).map((value) => ({
            value,
            label: t(`bankV2.tabs.${value}`),
          }))}
        />
      </SBankFlowRoot>
    </TabsRoot>
  )
}
