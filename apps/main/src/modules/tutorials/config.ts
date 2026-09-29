import { ChipVariant } from "@galacticcouncil/ui/components"

export type TutorialStep = {
  i18nKey: string
  side?: "top" | "right" | "bottom" | "left"
  align?: "start" | "center" | "end"
  badgeVariant?: ChipVariant
}

export type Tutorial = {
  steps: readonly [TutorialStep, ...TutorialStep[]]
  when?: () => boolean
  retireOnAnchorClick?: boolean
}

export const tutorials = {} satisfies Record<string, Tutorial>

export type TutorialId = keyof typeof tutorials
