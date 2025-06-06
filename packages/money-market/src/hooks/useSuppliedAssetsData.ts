import Big from "big.js"
import { useMemo } from "react"

import { useAppDataContext } from "@/hooks/app-data-provider/useAppDataProvider"

export const useSuppliedAssetsData = () => {
  const { user, loading } = useAppDataContext()

  const data = useMemo(() => {
    if (!user?.userReservesData) return []
    return user.userReservesData
      .filter((userReserve) => Big(userReserve.underlyingBalanceUSD).gt(0.0001))
      .map((userReserve) => ({
        ...userReserve,
        supplyAPY: userReserve.reserve.supplyAPY,
      }))
  }, [user.userReservesData])

  return {
    data,
    isLoading: loading,
  }
}
