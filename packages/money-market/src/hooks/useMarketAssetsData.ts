import { useMemo } from "react"

import { useAppDataContext } from "@/hooks/app-data-provider/useAppDataProvider"
import { isHiddenReserve } from "@/ui-config/addresses"

export const useMarketAssetsData = () => {
  const { reserves, loading } = useAppDataContext()

  const data = useMemo(() => {
    return reserves.filter((r) => {
      return (
        r.isActive &&
        !r.isFrozen &&
        !r.isPaused &&
        !isHiddenReserve(r.underlyingAsset)
      )
    })
  }, [reserves])

  return {
    data,
    isLoading: loading,
  }
}
