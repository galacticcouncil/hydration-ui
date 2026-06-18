import { createContext, useContext } from "react"
import { FormProvider } from "react-hook-form"

import {
  destChainAssetPairs,
  sourceChainAssetPairs,
  userData,
  XcChainAssetPair,
  XcUserData,
} from "@/modules/trade/swap/sections/XcSwap/data/mock"
import {
  useXcSwapAlerts,
  XcSwapAlert,
} from "@/modules/trade/swap/sections/XcSwap/lib/useXcSwapAlerts"
import {
  useXcSwapForm,
  XcSwapFormValues,
} from "@/modules/trade/swap/sections/XcSwap/lib/useXcSwapForm"

type XcSwapContextValue = {
  readonly sourceChainAssetPairs: XcChainAssetPair[]
  readonly destChainAssetPairs: XcChainAssetPair[]
  readonly userData: XcUserData
  readonly onSubmit: (values: XcSwapFormValues) => void
  readonly isLoading: boolean
  readonly alerts: XcSwapAlert[]
}

const XcSwapContext = createContext<XcSwapContextValue>({
  sourceChainAssetPairs: [],
  destChainAssetPairs: [],
  userData,
  onSubmit: () => {},
  isLoading: false,
  alerts: [],
})

export const useXcSwap = () => useContext(XcSwapContext)

type XcSwapProviderProps = {
  children: React.ReactNode
}

export const XcSwapProvider: React.FC<XcSwapProviderProps> = ({ children }) => {
  const form = useXcSwapForm()
  const alerts = useXcSwapAlerts()

  const onSubmit = (values: XcSwapFormValues) => {
    console.log(values)
  }

  return (
    <XcSwapContext.Provider
      value={{
        sourceChainAssetPairs,
        destChainAssetPairs,
        userData,
        onSubmit,
        isLoading: false,
        alerts,
      }}
    >
      <FormProvider {...form}>{children}</FormProvider>
    </XcSwapContext.Provider>
  )
}
