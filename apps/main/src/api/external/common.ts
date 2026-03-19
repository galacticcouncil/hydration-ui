import { Asset } from "@galacticcouncil/xc-core"

import { getAssetHubFeeAssetLocaction } from "@/api/external/assethub"

export function getParachainFeeAssetLocation(chainKey: string, asset: Asset) {
  switch (chainKey) {
    case "assethub":
      return getAssetHubFeeAssetLocaction(asset)
    default:
      return null
  }
}
