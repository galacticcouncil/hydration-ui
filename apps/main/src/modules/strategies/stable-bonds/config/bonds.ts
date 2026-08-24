import {
  HOLLAR_BOND_24_11_26_ID,
  HOLLAR_BOND_25_08_26_ID,
  USDC_ASSET_ID,
  USDT_ASSET_ID,
} from "@galacticcouncil/utils"

export type StableBondConfig = {
  bondId: string
  fixedYield: number
  termDays: number
  otcOfferIds: string[]
  otcAcceptedAssetIds: string[]
  contentId: string | undefined
  rollover?: {
    toBondId: string
    otcOfferId: string
  }
}

export const STABLE_BONDS: Record<string, StableBondConfig> = {
  [HOLLAR_BOND_25_08_26_ID]: {
    bondId: HOLLAR_BOND_25_08_26_ID,
    fixedYield: 1.725,
    termDays: 90,
    otcOfferIds: ["1488", "1489"],
    otcAcceptedAssetIds: [USDT_ASSET_ID, USDC_ASSET_ID],
    contentId: "hollar-bonds-25-08-26",
    rollover: {
      toBondId: HOLLAR_BOND_24_11_26_ID,
      otcOfferId: "1548",
    },
  },
  [HOLLAR_BOND_24_11_26_ID]: {
    bondId: HOLLAR_BOND_24_11_26_ID,
    fixedYield: 2.0165,
    termDays: 94,
    otcOfferIds: ["1546", "1547"],
    otcAcceptedAssetIds: [USDT_ASSET_ID, USDC_ASSET_ID],
    contentId: "hollar-bonds-25-08-26",
  },
}
