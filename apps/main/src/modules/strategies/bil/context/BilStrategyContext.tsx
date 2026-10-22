import {
  BIL_ASSET_ID,
  BIL_ERC20_ID,
  HOLLAR_ASSET_ID,
} from "@galacticcouncil/utils"
import { createContext, ReactNode, useContext, useMemo } from "react"

import { TAsset, useAssets } from "@/providers/assetsProvider"

type TBilStrategyContext = {
  hollar: TAsset
  bil: TAsset
  bilReserve: TAsset
}

const BilStrategyContext = createContext<TBilStrategyContext | null>(null)

export const useBilStrategy = () => {
  const ctx = useContext(BilStrategyContext)
  if (!ctx) {
    throw new Error("useBilStrategy must be used within a BilStrategyProvider")
  }
  return ctx
}

export const BilStrategyProvider = ({ children }: { children: ReactNode }) => {
  const { getAssetWithFallback } = useAssets()

  const value = useMemo<TBilStrategyContext>(
    () => ({
      hollar: getAssetWithFallback(HOLLAR_ASSET_ID),
      bil: getAssetWithFallback(BIL_ERC20_ID),
      bilReserve: getAssetWithFallback(BIL_ASSET_ID),
    }),
    [getAssetWithFallback],
  )

  return (
    <BilStrategyContext.Provider value={value}>
      {children}
    </BilStrategyContext.Provider>
  )
}
