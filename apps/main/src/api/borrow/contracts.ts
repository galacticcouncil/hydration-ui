import { Web3Provider } from "@ethersproject/providers"
import {
  AaveV3GIGAHDXPool,
  AaveV3HydrationMainnet,
} from "@galacticcouncil/money-market/ui-config"
import {
  GhoService,
  Pool,
  UiIncentiveDataProvider,
  UiPoolDataProvider,
} from "@galacticcouncil/money-market/utils"
import { queryOptions, useQuery } from "@tanstack/react-query"
import { useMemo } from "react"

import { TProviderData } from "@/api/rpcClient"
import { ENV } from "@/config/env"
import { useRpcProvider } from "@/providers/rpcProvider"

export const useBorrowPoolDataContract = () => {
  const { isReady, evm } = useRpcProvider()

  return useMemo(() => {
    if (!isReady) return null
    return new UiPoolDataProvider({
      uiPoolDataProviderAddress: AaveV3HydrationMainnet.UI_POOL_DATA_PROVIDER,
      provider: new Web3Provider(evm.transport),
      chainId: ENV.VITE_EVM_CHAIN_ID,
    })
  }, [evm, isReady])
}

export const useBorrowIncentivesContract = () => {
  const { isReady, evm } = useRpcProvider()

  return useMemo(() => {
    if (!isReady) return null
    return new UiIncentiveDataProvider({
      uiIncentiveDataProviderAddress:
        AaveV3HydrationMainnet.UI_INCENTIVE_DATA_PROVIDER,
      provider: new Web3Provider(evm.transport),
      chainId: ENV.VITE_EVM_CHAIN_ID,
    })
  }, [evm, isReady])
}

export const useGhoServiceContract = () => {
  const { isReady, evm } = useRpcProvider()
  return useMemo(() => {
    if (!isReady) return null
    return new GhoService({
      provider: new Web3Provider(evm.transport),
      uiGhoDataProviderAddress: AaveV3HydrationMainnet.GHO_UI_DATA_PROVIDER,
    })
  }, [evm, isReady])
}

export const useBorrowPoolContract = () => {
  const { evm } = useRpcProvider()

  return useMemo(() => {
    return new Pool(new Web3Provider(evm.transport), {
      POOL: AaveV3HydrationMainnet.POOL,
    })
  }, [evm])
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
  const { evm, isReady } = useRpcProvider()

  return useQuery(gigaBorrowPoolContractQuery(evm, isReady))
}
