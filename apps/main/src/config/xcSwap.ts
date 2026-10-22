import { HOLLAR_ASSET_ID, HYDRATION_CHAIN_KEY } from "@galacticcouncil/utils"

import { NATIVE_ASSET_ID } from "@/utils/consts"

export const XC_SWAP_CONFIG = {
  emitter: "0x98f1ebc9dcc8ab7ba54d83c98500e9e313f793f2",
  receiver: "0x2173f6ece25768e7efc5199f70f8783d88ba63c8",
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
