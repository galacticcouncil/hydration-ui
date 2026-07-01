import { HOLLAR_ASSET_ID, HYDRATION_CHAIN_KEY } from "@galacticcouncil/utils"

import { NATIVE_ASSET_ID } from "@/utils/consts"

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
