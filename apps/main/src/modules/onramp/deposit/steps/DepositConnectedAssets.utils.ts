import type { AnyChain, Asset } from "@galacticcouncil/xc-core"

import type { DepositBalanceRow } from "@/modules/onramp/deposit/DepositDiscovery.utils"
import type { ChainAssetPair } from "@/modules/xcm/transfer/components/ChainAssetSelect"

export type DepositSupportedAsset = {
  key: string
  chain: AnyChain
  asset: Asset
}

const pairKey = (chainKey: string, assetKey: string) =>
  JSON.stringify([chainKey, assetKey])

export const getOtherDepositAssets = (
  pairs: readonly Pick<ChainAssetPair, "chain" | "assets">[],
  rows: readonly DepositBalanceRow[],
): DepositSupportedAsset[] => {
  const seen = new Set(
    rows.map((row) => pairKey(row.source.chain.key, row.balance.key)),
  )
  const assets: DepositSupportedAsset[] = []
  for (const { chain, assets: supported } of pairs)
    for (const asset of supported) {
      const key = pairKey(chain.key, asset.key)
      if (seen.has(key)) continue
      seen.add(key)
      assets.push({ key, chain, asset })
    }
  return assets
}
