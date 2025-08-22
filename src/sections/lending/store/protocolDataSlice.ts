import { Provider } from "@ethersproject/providers"
import {
  availableMarkets,
  getInitialMarket,
  getNetworkConfig,
  getProvider,
  marketsData,
} from "sections/lending/utils/marketsAndNetworksConfig"
import { StateCreator } from "zustand"

import {
  CustomMarket,
  MarketDataType,
} from "sections/lending/ui-config/marketsConfig"
import { NetworkConfig } from "sections/lending/ui-config/networksConfig"
import { RootStore } from "./root"
import { setQueryParameter } from "./utils/queryParams"

type TypePermitParams = {
  reserveAddress: string
  isWrappedBaseAsset: boolean
}

export interface ProtocolDataSlice {
  currentMarket: CustomMarket
  currentMarketData: MarketDataType
  currentChainId: number
  currentNetworkConfig: NetworkConfig
  provider: Provider | null
  setProvider: (provider: Provider | null) => void
  jsonRpcProvider: (chainId?: number) => Provider
  setCurrentMarket: (
    market: CustomMarket,
    omitQueryParameterUpdate?: boolean,
  ) => void
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
  const initialMarket = getInitialMarket()
  const initialMarketData = marketsData[initialMarket]
  return {
    currentMarket: initialMarket,
    currentMarketData: marketsData[initialMarket],
    currentChainId: initialMarketData.chainId,
    currentNetworkConfig: getNetworkConfig(initialMarketData.chainId),
    provider: null,
    jsonRpcProvider: (chainId) => getProvider(chainId ?? get().currentChainId),
    setProvider: (provider) => set({ provider }),
    setCurrentMarket: (market, omitQueryParameterUpdate) => {
      if (!availableMarkets.includes(market as CustomMarket)) return
      const nextMarketData = marketsData[market]
      localStorage.setItem("selectedMarket", market)
      if (!omitQueryParameterUpdate) {
        setQueryParameter("marketName", market)
      }
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
