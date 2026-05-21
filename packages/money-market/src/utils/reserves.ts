import {
  getAddressFromAssetId,
  getAssetIdFromAddress,
  HOLLAR_ASSET_ID,
  stringEquals,
} from "@galacticcouncil/utils"

import { AaveV3HydrationMainnet } from "@/ui-config"

export const getReserveAddressByAssetId = (assetId: string) => {
  switch (assetId) {
    case HOLLAR_ASSET_ID:
      return AaveV3HydrationMainnet.GHO_TOKEN_ADDRESS.toLowerCase()
    default:
      return getAddressFromAssetId(assetId)
  }
}

export const getReserveAssetIdByAddress = (address: string) => {
  switch (true) {
    case stringEquals(AaveV3HydrationMainnet.GHO_TOKEN_ADDRESS, address):
      return HOLLAR_ASSET_ID
    default:
      return getAssetIdFromAddress(address)
  }
}
