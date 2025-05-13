import { useMemo } from "react"

import { useAppDataContext } from "@/hooks/app-data-provider/useAppDataProvider"
import { useProtocolDataContext } from "@/hooks/useProtocolDataContext"
import { useRootStore } from "@/store/root"

export const useMarketAssetsData = () => {
  const displayGho = useRootStore((state) => state.displayGho)
  const { reserves, loading } = useAppDataContext()
  const { currentMarket } = useProtocolDataContext()

  const data = useMemo(() => {
    return reserves.filter((r) => {
      const isGho = displayGho({ symbol: r.symbol, currentMarket })
      return !isGho && r.isActive && !r.isFrozen && !r.isPaused
    })
  }, [currentMarket, displayGho, reserves])

  return {
    data,
    isLoading: loading,
  }
}
