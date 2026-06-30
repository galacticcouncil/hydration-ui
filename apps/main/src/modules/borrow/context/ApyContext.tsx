import { EXTERNAL_APY_ASSET_IDS } from "@galacticcouncil/utils"
import { createContext, useContext, useMemo } from "react"

import { BorrowAssetApyData, useBorrowAssetsApy } from "@/api/borrow"

export const ApyContext = createContext<{
  apyData: BorrowAssetApyData[]
  apyMap: Map<string, BorrowAssetApyData>
  isLoading: boolean
}>({
  apyData: [],
  apyMap: new Map(),
  isLoading: false,
})

export const useApyContext = () => {
  return useContext(ApyContext)
}

type ApyProviderProps = {
  children: React.ReactNode
}

export const ApyProvider: React.FC<ApyProviderProps> = ({ children }) => {
  const { data: apyData, isLoading } = useBorrowAssetsApy(
    EXTERNAL_APY_ASSET_IDS,
  )

  const apyMap = useMemo<Map<string, BorrowAssetApyData>>(() => {
    if (!apyData) return new Map()
    return new Map(apyData.map((apy) => [apy.assetId, apy]))
  }, [apyData])

  return (
    <ApyContext.Provider value={{ apyData, apyMap, isLoading }}>
      {children}
    </ApyContext.Provider>
  )
}
