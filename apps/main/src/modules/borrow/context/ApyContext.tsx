import {
  GIGA_ASSETS,
  HOLLAR_ASSETS,
  PRIME_ASSET_ID,
  USDT_POOL_ASSET_ID,
  VDOT_ASSET_ID,
} from "@galacticcouncil/utils"
import { createContext, useContext, useMemo } from "react"

import { BorrowAssetApyData, useBorrowAssetsApy } from "@/api/borrow"

const EXTERNAL_APY_ASSET_IDS = [
  USDT_POOL_ASSET_ID,
  VDOT_ASSET_ID,
  PRIME_ASSET_ID,
  ...HOLLAR_ASSETS,
  ...GIGA_ASSETS,
]

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
