import { useQueryClient } from "@tanstack/react-query"
import React, { useContext } from "react"
import { PoolReserve } from "sections/lending/store/poolSlice"
import {
  useCurrentMarketData,
  useGhoDataSubscription,
  useIncentiveDataSubscription,
  usePoolDataSubscription,
} from "sections/lending/store/root"

interface BackgroundDataProviderContextType {
  refetchGhoData: () => Promise<void>
  refetchIncentiveData?: () => Promise<void>
  refetchPoolData?: () => Promise<void> | Promise<void[]>
  poolData?: PoolReserve
}

const BackgroundDataProviderContext =
  React.createContext<BackgroundDataProviderContextType>(
    {} as BackgroundDataProviderContextType,
  )

/**
 * Naive provider that subscribes to different data sources.
 * This context provider will run useEffects that relate to instantiating subscriptions as a poll every 60s to consistently fetch data from on-chain and update the Zustand global store.
 * @returns
 */
export const BackgroundDataProvider: React.FC<{
  children?: React.ReactNode
}> = ({ children }) => {
  const queryClient = useQueryClient()
  const refetchPoolData = usePoolDataSubscription(queryClient)()
  const refetchIncentiveData = useIncentiveDataSubscription()
  const refetchGhoData = useGhoDataSubscription()
  const poolData = useCurrentMarketData()

  return (
    <BackgroundDataProviderContext.Provider
      value={{
        refetchIncentiveData,
        refetchPoolData,
        refetchGhoData,
        poolData,
      }}
    >
      {children}
    </BackgroundDataProviderContext.Provider>
  )
}

export const useBackgroundDataProvider = () =>
  useContext(BackgroundDataProviderContext)
