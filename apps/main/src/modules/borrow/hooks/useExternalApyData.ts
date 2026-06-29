import { ExternalApyData } from "@galacticcouncil/money-market/types"
import { BIL_ASSET_ID, EXTERNAL_APY_ASSET_IDS } from "@galacticcouncil/utils"
import Big from "big.js"
import { useMemo } from "react"

import { useBorrowAssetsApy } from "@/api/borrow"
import { useVaultStats } from "@/modules/strategies/bil/hooks/useVaultReads"

type ExternalDataEntry =
  ExternalApyData extends Map<infer K, infer V> ? [K, V] : never

export const useExternalApyData = (): ExternalApyData => {
  const { data: apy } = useBorrowAssetsApy(EXTERNAL_APY_ASSET_IDS)
  const { data: vaultStats } = useVaultStats()

  return useMemo(() => {
    const entries: ExternalDataEntry[] = apy
      ? apy.map(({ assetId, totalSupplyApy, totalBorrowApy }) => {
          if (totalSupplyApy === null || totalBorrowApy === null) {
            return [assetId, { supplyApy: null, borrowApy: null }]
          }

          return [
            assetId,
            {
              supplyApy: Big(totalSupplyApy).div(100).toString(),
              borrowApy: Big(totalBorrowApy).div(100).toString(),
            },
          ]
        })
      : []

    const map = new Map(entries)

    // DCL yield comes from the BIL vault's on-chain APY, not Aave reserve rates.
    const existing = map.get(BIL_ASSET_ID)
    map.set(BIL_ASSET_ID, {
      supplyApy: Big(vaultStats.apr).div(100).toString(),
      borrowApy: existing?.borrowApy ?? null,
    })

    return map
  }, [apy, vaultStats.apr])
}
