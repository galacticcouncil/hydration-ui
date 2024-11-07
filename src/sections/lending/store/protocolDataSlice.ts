import { providers } from "ethers"
import {
  availableMarkets,
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
  jsonRpcProvider: (chainId?: number) => providers.Provider
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
  const initialMarket = availableMarkets[0]
  const initialMarketData = marketsData[initialMarket]
  return {
    currentMarket: initialMarket,
    currentMarketData: marketsData[initialMarket],
    currentChainId: initialMarketData.chainId,
    currentNetworkConfig: getNetworkConfig(initialMarketData.chainId),
    jsonRpcProvider: (chainId) => getProvider(chainId ?? get().currentChainId),
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
