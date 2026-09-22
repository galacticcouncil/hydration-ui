import { useCallback } from "react"

import { useBackgroundDataProvider } from "@/hooks/app-data-provider/BackgroundDataProvider"

export const useRefreshMoneyMarketData = () => {
  const { refetchPoolData, refetchIncentiveData, refetchGhoData } =
    useBackgroundDataProvider()

  return useCallback(() => {
    refetchPoolData?.()
    refetchIncentiveData?.()
    refetchGhoData?.()
  }, [refetchPoolData, refetchIncentiveData, refetchGhoData])
}
