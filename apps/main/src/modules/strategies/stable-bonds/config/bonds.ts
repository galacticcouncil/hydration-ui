import { HOLLAR_BOND_25_08_26 } from "@galacticcouncil/utils"

export type StableBondConfig = {
  bondId: string
  fixedYield: number
  otcOfferIds: number[]
  contentId: string | undefined
}

export const STABLE_BONDS: Record<string, StableBondConfig> = {
  [HOLLAR_BOND_25_08_26]: {
    bondId: HOLLAR_BOND_25_08_26,
    fixedYield: 1.725,
    otcOfferIds: [1453, 1454],
    contentId: "hollar-bond-25-08-06",
  },
}
