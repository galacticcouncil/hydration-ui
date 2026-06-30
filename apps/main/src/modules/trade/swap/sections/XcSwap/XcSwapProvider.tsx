import { HealthFactorResult } from "@galacticcouncil/money-market/utils"
import { isH160Address } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { XcSwapClient } from "@galacticcouncil/xc-swap"
import { useSearch } from "@tanstack/react-router"
import { createContext, useContext } from "react"
import { FormProvider } from "react-hook-form"

import {
  XcAsset,
  XcChainAssetPair,
} from "@/modules/trade/swap/sections/XcSwap/data/mock"
import {
  useXcSwapAlerts,
  XcSwapAlert,
} from "@/modules/trade/swap/sections/XcSwap/hooks/useXcSwapAlerts"
import { useXcSwapAssetPairs } from "@/modules/trade/swap/sections/XcSwap/hooks/useXcSwapAssetPairs"
import { useXcSwapClient } from "@/modules/trade/swap/sections/XcSwap/hooks/useXcSwapClient"
import {
  useXcSwapForm,
  XcSwapFormValues,
} from "@/modules/trade/swap/sections/XcSwap/hooks/useXcSwapForm"
import { useXcSwapHealthFactor } from "@/modules/trade/swap/sections/XcSwap/hooks/useXcSwapHealthFactor"
import {
  useXcSwapQuote,
  XcSwapQuote,
} from "@/modules/trade/swap/sections/XcSwap/hooks/useXcSwapQuote"
import { useXcSwapSelection } from "@/modules/trade/swap/sections/XcSwap/hooks/useXcSwapSelection"
import { useXcSwapSubmit } from "@/modules/trade/swap/sections/XcSwap/hooks/useXcSwapSubmit"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useTradeSettings } from "@/states/tradeSettings"

export type { XcSwapQuote }

type XcSwapContextValue = {
  readonly xcSwap: XcSwapClient | null
  readonly sourceChainAssetPairs: XcChainAssetPair[]
  readonly originAssetMap: Map<string, XcAsset>
  readonly destChainAssetPairs: XcChainAssetPair[]
  readonly isCrossChain: boolean
  readonly refundTo: string | null
  readonly quote: XcSwapQuote
  readonly isQuoteLoading: boolean
  readonly isTwapLoading: boolean
  readonly healthFactor: HealthFactorResult | undefined
  readonly isHealthFactorLoading: boolean
  readonly isSelectionLoading: boolean
  readonly onSubmit: (values: XcSwapFormValues) => void
  readonly isLoading: boolean
  readonly alerts: XcSwapAlert[]
}

const XcSwapContext = createContext<XcSwapContextValue>({
  xcSwap: null,
  sourceChainAssetPairs: [],
  originAssetMap: new Map(),
  destChainAssetPairs: [],
  isCrossChain: true,
  refundTo: null,
  quote: null,
  isQuoteLoading: false,
  isTwapLoading: false,
  healthFactor: undefined,
  isHealthFactorLoading: false,
  isSelectionLoading: true,
  onSubmit: () => {},
  isLoading: false,
  alerts: [],
})

export const useXcSwap = () => useContext(XcSwapContext)

type XcSwapProviderProps = {
  children: React.ReactNode
  assetIn: string
  assetOut: string
}

export const XcSwapProvider: React.FC<XcSwapProviderProps> = ({
  children,
  assetIn,
  assetOut,
}) => {
  const { account } = useAccount()
  const rpc = useRpcProvider()
  const form = useXcSwapForm()
  const { destPlatform } = useSearch({ from: "/trade/_history" })
  const {
    swap: {
      single: { swapSlippage },
    },
  } = useTradeSettings()
  const refundTo = isH160Address(account?.rawAddress)
    ? account.rawAddress
    : null

  const { xcSwap, chains } = useXcSwapClient()
  const {
    sourceChainAssetPairs,
    originAssetMap,
    destChainAssetPairs,
    isOriginLoading,
    isDestLoading,
  } = useXcSwapAssetPairs(chains, xcSwap)

  const { isSelectionLoading, isCrossChain } = useXcSwapSelection({
    form,
    sourceChainAssetPairs,
    destChainAssetPairs,
    assetIn,
    assetOut,
    destPlatform,
    isOriginLoading,
    isDestLoading,
  })

  const { healthFactor, isHealthFactorLoading } = useXcSwapHealthFactor({
    rpc,
    form,
    account,
    isCrossChain,
  })

  const { quote, isQuoteLoading, isTwapLoading, quoteError } = useXcSwapQuote({
    form,
    rpc,
    xcSwap,
    originAssetMap,
    isCrossChain,
    refundTo,
    swapSlippage,
  })

  const alerts = useXcSwapAlerts({
    form,
    originAssetMap,
    isCrossChain,
    quote,
    quoteError,
  })

  const { onSubmit, isSubmitting } = useXcSwapSubmit({ quote })

  return (
    <XcSwapContext.Provider
      value={{
        xcSwap,
        sourceChainAssetPairs,
        originAssetMap,
        destChainAssetPairs,
        isCrossChain,
        refundTo,
        quote,
        isQuoteLoading,
        isTwapLoading,
        healthFactor,
        isHealthFactorLoading,
        isSelectionLoading,
        onSubmit,
        isLoading: isOriginLoading || isDestLoading || isSubmitting,
        alerts,
      }}
    >
      <FormProvider {...form}>{children}</FormProvider>
    </XcSwapContext.Provider>
  )
}
