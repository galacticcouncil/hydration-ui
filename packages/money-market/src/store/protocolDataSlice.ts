import { Provider } from "@ethersproject/providers"
import { StateCreator } from "zustand"

import { CustomMarket, MarketDataType } from "@/ui-config/marketsConfig"
import { NetworkConfig } from "@/ui-config/networksConfig"
import { getNetworkConfig, marketsData } from "@/utils/marketsAndNetworksConfig"

import { RootStore } from "./root"

type TypePermitParams = {
  reserveAddress: string
  isWrappedBaseAsset: boolean
}

export interface ProtocolDataSlice {
  provider: Provider | null
  currentMarket: CustomMarket
  currentMarketData: MarketDataType
  currentChainId: number
  currentNetworkConfig: NetworkConfig
  setProvider: (provider: Provider) => void
  jsonRpcProvider: () => Provider
  setCurrentMarket: (market: CustomMarket) => void
  tryPermit: ({
    reserveAddress,
    isWrappedBaseAsset,
  }: TypePermitParams) => boolean
}

export const createProtocolDataSlice: StateCreator<
  RootStore,
  [["zustand/subscribeWithSelector", never], ["zustand/devtools", never]],
  [],
  ProtocolDataSlice
> = (set, get) => {
  const initialMarket = CustomMarket.hydration_v3
  const initialMarketData = marketsData[initialMarket]

  return {
    currentMarket: initialMarket,
    currentMarketData: marketsData[initialMarket],
    currentChainId: initialMarketData.chainId,
    currentNetworkConfig: getNetworkConfig(initialMarketData.chainId),
    provider: null,
    setProvider: (provider) => set({ provider }),
    jsonRpcProvider: () => get().provider as Provider,
    setCurrentMarket: (market) => {
      const nextMarketData = marketsData[market]
      set({
        currentMarket: market,
        currentMarketData: nextMarketData,
        currentChainId: nextMarketData.chainId,
        currentNetworkConfig: getNetworkConfig(nextMarketData.chainId),
      })
    },
    tryPermit: (_: TypePermitParams) => {
      const testnetPermitEnabled = false
      const productionPermitEnabled = false
      return testnetPermitEnabled || productionPermitEnabled
    },
  }
}
