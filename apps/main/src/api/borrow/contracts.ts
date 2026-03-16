import { Web3Provider } from "@ethersproject/providers"
import { AaveV3HydrationMainnet } from "@galacticcouncil/money-market/ui-config"
import {
  GhoService,
  Pool,
  PoolBundle,
  UiIncentiveDataProvider,
  UiPoolDataProvider,
} from "@galacticcouncil/money-market/utils"
import { queryOptions, useQuery } from "@tanstack/react-query"
import { useMemo } from "react"

import { TProviderData } from "@/api/provider"
import { ENV } from "@/config/env"
import { useRpcProvider } from "@/providers/rpcProvider"

export const borrowPoolDataContractQuery = (
  evm: TProviderData["evm"],
  isLoaded: boolean,
) =>
  queryOptions({
    queryKey: ["borrowPoolDataContract"],
    enabled: isLoaded,
    queryFn: () => {
      if (!isLoaded) return null

      return new UiPoolDataProvider({
        uiPoolDataProviderAddress: AaveV3HydrationMainnet.UI_POOL_DATA_PROVIDER,
        provider: new Web3Provider(evm.transport),
        chainId: ENV.VITE_EVM_CHAIN_ID,
      })
    },
  })

export const borrowIncentivesContractQuery = (
  evm: TProviderData["evm"],
  isLoaded: boolean,
) =>
  queryOptions({
    queryKey: ["borrowIncentivesContract"],
    enabled: isLoaded,
    queryFn: () => {
      if (!isLoaded) return null

      return new UiIncentiveDataProvider({
        uiIncentiveDataProviderAddress:
          AaveV3HydrationMainnet.UI_INCENTIVE_DATA_PROVIDER,
        provider: new Web3Provider(evm.transport),
        chainId: ENV.VITE_EVM_CHAIN_ID,
      })
    },
  })

export const ghoServiceContractQuery = (
  evm: TProviderData["evm"],
  isLoaded: boolean,
) =>
  queryOptions({
    queryKey: ["ghoServiceContract"],
    enabled: isLoaded,
    queryFn: () => {
      if (!isLoaded) return null

      return new GhoService({
        provider: new Web3Provider(evm.transport),
        uiGhoDataProviderAddress: AaveV3HydrationMainnet.GHO_UI_DATA_PROVIDER,
      })
    },
  })

export const borrowPoolContractQuery = (
  evm: TProviderData["evm"],
  isLoaded: boolean,
) =>
  queryOptions({
    queryKey: ["borrowPoolContract"],
    enabled: isLoaded,
    queryFn: () =>
      new Pool(new Web3Provider(evm.transport), {
        POOL: AaveV3HydrationMainnet.POOL,
      }),
  })

export const useBorrowPoolDataContract = () => {
  const rpc = useRpcProvider()

  const { data } = useQuery(borrowPoolDataContractQuery(rpc.evm, rpc.isLoaded))

  return data
}

export const useBorrowIncentivesContract = () => {
  const rpc = useRpcProvider()

  const { data } = useQuery(
    borrowIncentivesContractQuery(rpc.evm, rpc.isLoaded),
  )

  return data
}

export const useGhoServiceContract = () => {
  const rpc = useRpcProvider()

  const { data } = useQuery(ghoServiceContractQuery(rpc.evm, rpc.isLoaded))

  return data
}

export const useBorrowPoolContract = () => {
  const rpc = useRpcProvider()

  const { data } = useQuery(borrowPoolContractQuery(rpc.evm, rpc.isLoaded))

  return data
}

export const useBorrowPoolBundleContract = () => {
  const { evm } = useRpcProvider()

  return useMemo(() => {
    return new PoolBundle(new Web3Provider(evm.transport), {
      POOL: AaveV3HydrationMainnet.POOL,
    })
  }, [evm])
}
