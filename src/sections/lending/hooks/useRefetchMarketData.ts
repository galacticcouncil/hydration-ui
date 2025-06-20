import { useQueryClient } from "@tanstack/react-query"
import { useBackgroundDataProvider } from "sections/lending/hooks/app-data-provider/BackgroundDataProvider"
import { queryKeysFactory } from "sections/lending/ui-config/queries"

export const useRefetchMarketData = () => {
  const queryClient = useQueryClient()
  const { refetchPoolData, refetchIncentiveData, refetchGhoData } =
    useBackgroundDataProvider()

  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeysFactory.pool })
    refetchPoolData?.()
    refetchIncentiveData?.()
    refetchGhoData?.()
  }
}
