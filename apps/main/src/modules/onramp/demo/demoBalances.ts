import { chainsMap } from "@galacticcouncil/xc-cfg"
import { AssetAmount } from "@galacticcouncil/xc-core"

import { BalanceRecord } from "@/api/balances/types"
import { useAssetRegistryStore } from "@/states/assetRegistry"

const amounts: Record<string, bigint> = {
  HDX: 25000n,
  HOLLAR: 1500n,
  DOT: 120n,
  USDC: 1250n,
  USDT: 850n,
  EURC: 600n,
  ETH: 2n,
  BNC: 350n,
  ASTR: 2000n,
  AAVE: 5n,
}

export const getDemoHydrationBalances = (): BalanceRecord =>
  Object.fromEntries(
    useAssetRegistryStore.getState().assets.flatMap((asset) => {
      const units = amounts[asset.symbol.toUpperCase()]
      if (!units) return []
      const value = units * 10n ** BigInt(asset.decimals)
      return [
        [
          asset.id,
          {
            assetId: asset.id,
            free: value,
            total: value,
            transferable: value,
            reserved: 0n,
            frozen: 0n,
          },
        ],
      ]
    }),
  )

export const getDemoCrossChainBalances = (chainKey: string) =>
  [...(chainsMap.get(chainKey)?.assetsData.values() ?? [])].flatMap(
    ({ asset, decimals }) => {
      const units = amounts[asset.key.toUpperCase()]
      return units && decimals !== undefined
        ? [
            AssetAmount.fromAsset(asset, {
              amount: units * 10n ** BigInt(decimals),
              decimals,
            }),
          ]
        : []
    },
  )
