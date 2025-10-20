import { Web3Provider } from "@ethersproject/providers"
import { AaveV3HydrationMainnet } from "@galacticcouncil/money-market/ui-config"
import {
  UiIncentiveDataProvider,
  UiPoolDataProvider,
} from "@galacticcouncil/money-market/utils"
import { useMemo } from "react"

import { useRpcProvider } from "@/providers/rpcProvider"

export const useBorrowPoolDataContract = () => {
  const { isLoaded, evm } = useRpcProvider()

  return useMemo(() => {
    if (!isLoaded) return null
    return new UiPoolDataProvider({
      uiPoolDataProviderAddress: AaveV3HydrationMainnet.UI_POOL_DATA_PROVIDER,
      provider: new Web3Provider(evm.transport),
      chainId: parseFloat(import.meta.env.VITE_EVM_CHAIN_ID),
    })
  }, [evm, isLoaded])
}

export const useBorrowIncentivesContract = () => {
  const { isLoaded, evm } = useRpcProvider()

  return useMemo(() => {
    if (!isLoaded) return null
    return new UiIncentiveDataProvider({
      uiIncentiveDataProviderAddress:
        AaveV3HydrationMainnet.UI_INCENTIVE_DATA_PROVIDER,
      provider: new Web3Provider(evm.transport),
      chainId: parseFloat(import.meta.env.VITE_EVM_CHAIN_ID),
    })
  }, [evm, isLoaded])
}
