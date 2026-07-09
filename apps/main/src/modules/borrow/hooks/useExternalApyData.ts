import { ExternalApyData } from "@galacticcouncil/money-market/types"
import { EXTERNAL_APY_ASSET_IDS } from "@galacticcouncil/utils"
import Big from "big.js"
import { useMemo } from "react"

import { useBorrowAssetsApy } from "@/api/borrow"

type ExternalApyEntry = [
  string,
  { supplyApy: string | null; borrowApy: string | null },
]

export const useExternalApyData = (): ExternalApyData => {
  const { data: apy } = useBorrowAssetsApy(EXTERNAL_APY_ASSET_IDS)

  return useMemo(() => {
    if (!apy) return new Map()

    const entries: ExternalApyEntry[] = apy.map(
      ({ assetId, totalSupplyApy, totalBorrowApy }) => {
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
      },
    )

    return new Map(entries)
  }, [apy])
}
