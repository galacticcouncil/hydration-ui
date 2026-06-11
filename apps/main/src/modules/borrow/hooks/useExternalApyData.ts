import { ExternalApyData } from "@galacticcouncil/money-market/types"
import { DCL_ASSET_ID, EXTERNAL_APY_ASSET_IDS } from "@galacticcouncil/utils"
import Big from "big.js"
import { useMemo } from "react"

import { useBorrowAssetsApy } from "@/api/borrow"
import { useVaultStats } from "@/modules/strategies/hdcl/hooks/useVaultReads"

export const useExternalApyData = (): ExternalApyData => {
  const { data: apy } = useBorrowAssetsApy(EXTERNAL_APY_ASSET_IDS)
  const { data: vaultStats } = useVaultStats()

  return useMemo(() => {
    const entries = apy
      ? apy.map(({ assetId, totalSupplyApy, totalBorrowApy }) => {
          const supplyApy = Big(totalSupplyApy).div(100)
          const borrowApy = Big(totalBorrowApy).div(100)

          return [
            assetId,
            {
              supplyApy: supplyApy.toString(),
              borrowApy: borrowApy.toString(),
            },
          ] as const
        })
      : []

    const map = new Map(entries)

    // DCL yield comes from the HDCL vault's on-chain APY, not Aave reserve rates.
    const existing = map.get(DCL_ASSET_ID)
    map.set(DCL_ASSET_ID, {
      supplyApy: Big(vaultStats.apr).div(100).toString(),
      borrowApy: existing?.borrowApy ?? "0",
    })

    return map
  }, [apy, vaultStats.apr])
}
