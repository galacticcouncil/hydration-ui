import { HOLLAR_BOND_25_08_26 } from "@galacticcouncil/utils"

export type StableBondConfig = {
  bondId: string
  apr: number
  maturityPeriodDays: number
  otcOfferIds: number[]
  contentId: string | undefined
}

export const STABLE_BONDS: Record<string, StableBondConfig> = {
  [HOLLAR_BOND_25_08_26]: {
    bondId: HOLLAR_BOND_25_08_26,
    apr: 6.9,
    maturityPeriodDays: 90,
    otcOfferIds: [1453, 1454],
    contentId: "hollar-bond-25-08-06",
  },
}
