import { HOLLAR_ASSET_ID, HYDRATION_CHAIN_KEY } from "@galacticcouncil/utils"
import { WRAP_NEAR_ASSET, ZEC_ASSET } from "@galacticcouncil/xc-swap"

import { NATIVE_ASSET_ID } from "@/utils/consts"

const CMC_COIN_LOGO_URL = "https://s2.coinmarketcap.com/static/img/coins/64x64"

export const XC_SWAP_CHAIN_CMC_IDS = {
  zec: 1437,
  near: 6535,
  bitcoin: 1,
} as const

export const XC_SWAP_ASSET_CMC_IDS = {
  [ZEC_ASSET]: 1437,
  [WRAP_NEAR_ASSET]: 6535,
} as const

export const XC_SWAP_ASSET_META: Record<
  string,
  { name: string; symbol: string }
> = {
  [WRAP_NEAR_ASSET]: { name: "NEAR", symbol: "NEAR" },
  [ZEC_ASSET]: { name: "Zcash", symbol: "ZEC" },
}

export const XC_SWAP_RECIPIENT_PLACEHOLDERS: Record<string, string> = {
  zec: "t1PKtYdJJHhc3Pxowmznkg7vdTwnhEsCvR4",
  near: "alice.near",
}

export const getXcSwapChainLogoUrl = (chainKey: string): string => {
  const id =
    XC_SWAP_CHAIN_CMC_IDS[chainKey as keyof typeof XC_SWAP_CHAIN_CMC_IDS]
  return id ? `${CMC_COIN_LOGO_URL}/${id}.png` : ""
}

export const getXcSwapAssetLogoUrl = (assetKey: string): string => {
  const id =
    XC_SWAP_ASSET_CMC_IDS[assetKey as keyof typeof XC_SWAP_ASSET_CMC_IDS]
  return id ? `${CMC_COIN_LOGO_URL}/${id}.png` : ""
}

export const XC_SWAP_CONFIG = {
  emitter: "0x059ed5658c988976e73adb6597418970414f3dd0",
  receiver: "0xf1a5fe4252d9a1c39b0fb9de1f19049ee57ed188",
  defaults: {
    source: {
      chainKey: HYDRATION_CHAIN_KEY,
      assetId: HOLLAR_ASSET_ID,
    },
    destination: {
      chainKey: HYDRATION_CHAIN_KEY,
      assetId: NATIVE_ASSET_ID,
    },
  },
} as const
