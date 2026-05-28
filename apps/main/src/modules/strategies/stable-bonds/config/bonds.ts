import {
  HOLLAR_BOND_25_08_26_ID,
  USDC_ASSET_ID,
  USDT_ASSET_ID,
} from "@galacticcouncil/utils"

export type StableBondConfig = {
  bondId: string
  fixedYield: number
  otcAcceptedAssetIds: string[]
  contentId: string | undefined
}

export const STABLE_BONDS: Record<string, StableBondConfig> = {
  [HOLLAR_BOND_25_08_26_ID]: {
    bondId: HOLLAR_BOND_25_08_26_ID,
    fixedYield: 1.725,
    otcAcceptedAssetIds: [USDT_ASSET_ID, USDC_ASSET_ID],
    contentId: "hollar-bond-25-08-06",
  },
}
