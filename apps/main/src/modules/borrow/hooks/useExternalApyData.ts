import { ExternalApyData } from "@galacticcouncil/money-market/types"
import { PRIME_ASSET_ID } from "@galacticcouncil/money-market/ui-config"
import {
  GIGA_ASSETS,
  HOLLAR_ASSETS,
  USDT_POOL_ASSET_ID,
  VDOT_ASSET_ID,
} from "@galacticcouncil/utils"
import Big from "big.js"
import { useMemo } from "react"

import { useBorrowAssetsApy } from "@/api/borrow"

const EXTERNAL_APY_ASSET_IDS = [
  USDT_POOL_ASSET_ID,
  VDOT_ASSET_ID,
  PRIME_ASSET_ID,
  ...HOLLAR_ASSETS,
  ...GIGA_ASSETS,
]

export const useExternalApyData = (): ExternalApyData => {
  const { data: apy } = useBorrowAssetsApy(EXTERNAL_APY_ASSET_IDS)

  return useMemo(() => {
    if (!apy) return new Map()
    const entries = apy.map(
      ({ assetId, underlyingSupplyApy, underlyingBorrowApy, lpAPY }) => {
        const supplyApy = Big(underlyingSupplyApy)
          .plus(lpAPY ?? 0)
          .div(100)
        const borrowApy = Big(underlyingBorrowApy)
          .plus(lpAPY ?? 0)
          .div(100)
        return [
          assetId,
          {
            supplyApy: supplyApy.toString(),
            borrowApy: borrowApy.toString(),
          },
        ] as const
      },
    )

    return new Map(entries)
  }, [apy])
}
