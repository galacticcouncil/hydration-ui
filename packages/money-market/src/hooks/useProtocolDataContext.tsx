import { useCallback } from "react"

import { useRootStore } from "@/store/root"

// TODO: remove this
// currently this reexport is a workaround so i don't have to alter and potentially create conflicts in 200 files
export const useProtocolDataContext = () => {
  const context = useRootStore(
    useCallback(
      ({
        currentChainId,
        currentMarket,
        currentMarketData,
        currentNetworkConfig,
        jsonRpcProvider,
        setCurrentMarket,
      }) => ({
        currentChainId,
        currentMarket,
        currentMarketData,
        currentNetworkConfig,
        jsonRpcProvider,
        setCurrentMarket,
      }),
      [],
    ),
  )

  return context
}
