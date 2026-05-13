import { getAssetIdFromAddress } from "@galacticcouncil/utils"
import Big from "big.js"
import { useMemo } from "react"

import { useAppDataContext } from "@/hooks/app-data-provider/useAppDataProvider"

export const useSuppliedAssetsData = () => {
  const { user, loading, externalApyData } = useAppDataContext()

  const data = useMemo(() => {
    if (!user?.userReservesData) return []
    return user.userReservesData
      .filter((userReserve) => Big(userReserve.underlyingBalance).gt(0))
      .map((userReserve) => {
        const externalApy = externalApyData.get(
          getAssetIdFromAddress(userReserve.reserve.underlyingAsset),
        )

        return {
          ...userReserve,
          supplyAPY: externalApy?.supplyApy ?? userReserve.reserve.supplyAPY,
        }
      })
  }, [user.userReservesData, externalApyData])

  return {
    data,
    isLoading: loading,
  }
}
