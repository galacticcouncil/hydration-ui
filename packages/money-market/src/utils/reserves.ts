import { getAddressFromAssetId, HOLLAR_ASSET_ID } from "@galacticcouncil/utils"

import { AaveV3HydrationMainnet } from "@/ui-config"

export const getReserveAddressByAssetId = (assetId: string) => {
  switch (assetId) {
    case HOLLAR_ASSET_ID:
      return AaveV3HydrationMainnet.GHO_TOKEN_ADDRESS.toLowerCase()
    default:
      return getAddressFromAssetId(assetId)
  }
}
