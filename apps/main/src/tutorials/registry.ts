// import { useIntentsStore } from "@/states/intents"

export type TutorialStep = {
  /** Namespaced *base* i18n key, e.g. "trade:hints.intents" — never literal
   * copy. `.description` is required, `.title` optional (missing = no title). */
  i18nKey: string
  side?: "top" | "right" | "bottom" | "left"
  align?: "start" | "center" | "end"
}

export type Tutorial = {
  /** Always an array, single-step included, so there is one code path. */
  steps: readonly [TutorialStep, ...TutorialStep[]]
  /** Eligibility over store state. A plain predicate rather than a hook, so
   * the provider can evaluate any tutorial's without rules-of-hooks trouble. */
  when?: () => boolean
  /** Defaults to true — clicking the anchor is taken as discovery. */
  retireOnAnchorClick?: boolean
}

export const tutorials = {
  intro: {
    steps: [
      { i18nKey: "common:hints.intro.settings", side: "bottom", align: "end" },
      { i18nKey: "common:hints.intro.deposit", side: "bottom", align: "end" },
      { i18nKey: "common:hints.intro.connect", side: "bottom", align: "end" },
      { i18nKey: "common:hints.intro.chart", side: "top", align: "start" },
      { i18nKey: "common:hints.intro.swap", side: "left", align: "start" },
      { i18nKey: "common:hints.intro.orders", side: "top", align: "start" },
    ],

    when: () => window.matchMedia("(min-width: 80rem)").matches,
    retireOnAnchorClick: false,
  },
  "trade-intents": {
    steps: [{ i18nKey: "trade:hints.intents", side: "bottom" }],
    // when: () => useIntentsStore.getState().hasSeenModal,
    when: () => false,
  },
} satisfies Record<string, Tutorial>

export type TutorialId = keyof typeof tutorials
