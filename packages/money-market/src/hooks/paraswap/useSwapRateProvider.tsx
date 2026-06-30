import React, { useContext } from "react"

import {
  notImplementedSwapRateProvider,
  SwapRateProvider as SwapRateProviderApi,
} from "@/hooks/paraswap/common"

type SwapRateContextValue = {
  rateProvider: SwapRateProviderApi
  swapSlippage: number
  onSwapModalOpenChange: (open: boolean) => void
}

const SwapRateContext = React.createContext<SwapRateContextValue>({
  rateProvider: notImplementedSwapRateProvider,
  swapSlippage: 1,
  onSwapModalOpenChange: () => {},
})

export const SwapRateProvider: React.FC<{
  swapRateProvider?: SwapRateProviderApi
  swapSlippage: number
  onSwapModalOpenChange: (open: boolean) => void
  children?: React.ReactNode
}> = ({ swapRateProvider, swapSlippage, onSwapModalOpenChange, children }) => {
  return (
    <SwapRateContext.Provider
      value={{
        rateProvider: swapRateProvider ?? notImplementedSwapRateProvider,
        swapSlippage,
        onSwapModalOpenChange,
      }}
    >
      {children}
    </SwapRateContext.Provider>
  )
}

export const useSwapRateProvider = () =>
  useContext(SwapRateContext).rateProvider

export const useSwapSlippageSettings = () => {
  const { swapSlippage, onSwapModalOpenChange } = useContext(SwapRateContext)
  return { swapSlippage, onSwapModalOpenChange }
}
