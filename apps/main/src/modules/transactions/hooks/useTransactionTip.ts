import { bigShift } from "@galacticcouncil/utils"

import { useAssets } from "@/providers/assetsProvider"

export const useTransactionTip = (amount: string, assetId: string): bigint => {
  const { getAsset } = useAssets()

  const asset = getAsset(assetId)

  if (!amount || !asset) {
    return 0n
  }

  const tip = bigShift(amount.toString(), asset.decimals).toFixed(0)

  return BigInt(tip)
}
