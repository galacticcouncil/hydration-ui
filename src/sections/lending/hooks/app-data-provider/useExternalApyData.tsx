import { useBorrowAssetsApy } from "api/borrow"
import BN from "bignumber.js"
import { useMemo } from "react"
import { EXTERNAL_APY_ENABLED_ASSET_IDS } from "sections/lending/ui-config/misc"

export type ExternalApyData = Map<
  string,
  {
    borrowApy: string
    supplyApy: string
  }
>

export const useExternalApyData = (): ExternalApyData => {
  const { data: apy } = useBorrowAssetsApy(EXTERNAL_APY_ENABLED_ASSET_IDS)

  return useMemo(() => {
    if (!apy) return new Map()
    const entries = apy.map(
      ({ assetId, underlyingSupplyApy, underlyingBorrowApy, lpAPY }) => {
        const supplyApy = BN(underlyingSupplyApy).plus(lpAPY).div(100)
        const borrowApy = BN(underlyingBorrowApy).plus(lpAPY).div(100)
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
