import type { Asset } from "@galacticcouncil/xc-core"

import type { WithdrawDestinationOption } from "./WithdrawAssetSelect.utils"

type AssetMetadata = { name: string; decimals: number }

export type WithdrawFundedAsset = {
  assetId: string
  asset: Asset
  amount: bigint
  decimals: number
  name: string
  routes: WithdrawDestinationOption[]
}

export const getWithdrawFundedAssets = (
  options: readonly WithdrawDestinationOption[],
  balances: Readonly<Record<string, { transferable: bigint }>>,
  getAsset: (id: string) => AssetMetadata | undefined,
): WithdrawFundedAsset[] => {
  const assets = new Map<string, WithdrawFundedAsset>()
  for (const option of options) {
    const metadata = getAsset(option.assetId)
    const amount = balances[option.assetId]?.transferable ?? 0n
    if (!metadata || amount <= 0n) continue
    const existing = assets.get(option.sourceAssetKey)
    if (existing) existing.routes.push(option)
    else
      assets.set(option.sourceAssetKey, {
        assetId: option.assetId,
        asset: option.sourceAsset,
        amount,
        decimals: metadata.decimals,
        name: metadata.name,
        routes: [option],
      })
  }
  return [...assets.values()]
}
