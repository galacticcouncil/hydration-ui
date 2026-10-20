import { ChipVariant } from "@galacticcouncil/ui/components"

import { useIntentsStore } from "@/states/intents"

export type TutorialStep = {
  i18nKey: string
  badgeKey?: string
  side?: "top" | "right" | "bottom" | "left"
  align?: "start" | "center" | "end"
  badgeVariant?: ChipVariant
}

export type Tutorial = {
  steps: readonly [TutorialStep, ...TutorialStep[]]
  when?: () => boolean
  retireOnAnchorClick?: boolean
}

export const tutorials = {
  "settings-avatar": {
    steps: [
      {
        i18nKey: "hints.avatar",
        badgeKey: "new",
        side: "bottom",
      },
    ],
  },
  "trade-intents": {
    steps: [
      {
        i18nKey: "trade:hints.intents",
        side: "bottom",
      },
    ],
    when: () => useIntentsStore.getState().hasSeenModal,
  },
} satisfies Record<string, Tutorial>

export type TutorialId = keyof typeof tutorials
