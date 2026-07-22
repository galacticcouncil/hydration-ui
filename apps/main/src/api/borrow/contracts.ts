import { Web3Provider } from "@ethersproject/providers"
import { useProtocolDataContext } from "@galacticcouncil/money-market/hooks"
import { AaveV3GIGAHDXPool } from "@galacticcouncil/money-market/ui-config"
import {
  GhoService,
  Pool,
  UiIncentiveDataProvider,
  UiPoolDataProvider,
} from "@galacticcouncil/money-market/utils"
import { queryOptions, useQuery } from "@tanstack/react-query"
import { useMemo } from "react"

import { TProviderData } from "@/api/provider"
import { ENV } from "@/config/env"
import { useRpcProvider } from "@/providers/rpcProvider"

export const useBorrowPoolDataContract = () => {
  const { isLoaded, evm } = useRpcProvider()
  const { currentMarketData } = useProtocolDataContext()

  return useMemo(() => {
    if (!isLoaded) return null
    return new UiPoolDataProvider({
      uiPoolDataProviderAddress:
        currentMarketData.addresses.UI_POOL_DATA_PROVIDER,
      provider: new Web3Provider(evm.transport),
      chainId: ENV.VITE_EVM_CHAIN_ID,
    })
  }, [currentMarketData, evm, isLoaded])
}

export const useBorrowIncentivesContract = () => {
  const { isLoaded, evm } = useRpcProvider()
  const { currentMarketData } = useProtocolDataContext()

  return useMemo(() => {
    if (!isLoaded) return null
    return new UiIncentiveDataProvider({
      uiIncentiveDataProviderAddress:
        currentMarketData.addresses.UI_INCENTIVE_DATA_PROVIDER ?? "",
      provider: new Web3Provider(evm.transport),
      chainId: ENV.VITE_EVM_CHAIN_ID,
    })
  }, [currentMarketData, evm, isLoaded])
}

export const useGhoServiceContract = () => {
  const { isLoaded, evm } = useRpcProvider()
  const { currentMarketData } = useProtocolDataContext()

  return useMemo(() => {
    if (!isLoaded) return null
    return new GhoService({
      provider: new Web3Provider(evm.transport),
      uiGhoDataProviderAddress:
        currentMarketData.addresses.GHO_UI_DATA_PROVIDER ?? "",
    })
  }, [currentMarketData, evm, isLoaded])
}

export const useBorrowPoolContract = () => {
  const { evm } = useRpcProvider()
  const { currentMarketData } = useProtocolDataContext()

  return useMemo(() => {
    return new Pool(new Web3Provider(evm.transport), {
      POOL: currentMarketData.addresses.LENDING_POOL,
    })
  }, [currentMarketData, evm])
}

export const gigaBorrowPoolContractQuery = (
  evm: TProviderData["evm"],
  enabled: boolean,
) => {
  return queryOptions({
    queryKey: ["gigaBorrowPoolContract"],
    enabled,
    queryFn: () => {
      return new Pool(new Web3Provider(evm.transport), {
        POOL: AaveV3GIGAHDXPool.POOL,
      })
    },
  })
}
export const useGigaBorrowPoolContract = () => {
  const { evm, isLoaded } = useRpcProvider()

  return useQuery(gigaBorrowPoolContractQuery(evm, isLoaded))
}
