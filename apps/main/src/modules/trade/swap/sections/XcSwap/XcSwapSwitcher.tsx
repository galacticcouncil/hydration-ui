import { useFormContext } from "react-hook-form"

import { CrossChainSwitcher } from "@/modules/trade/swap/sections/XcSwap/components/CrossChainSwitcher"
import { OnChainSwitcher } from "@/modules/trade/swap/sections/XcSwap/components/OnChainSwitcher"
import { XcSwapFormValues } from "@/modules/trade/swap/sections/XcSwap/hooks/useXcSwapForm"
import { useXcSwap } from "@/modules/trade/swap/sections/XcSwap/XcSwapProvider"

export const XcSwapSwitcher = () => {
  const { quote, isCrossChain, isQuoteLoading } = useXcSwap()
  const { watch } = useFormContext<XcSwapFormValues>()
  const [sellAsset, buyAsset] = watch(["sellAsset", "buyAsset"])

  if (!isCrossChain) {
    const swap = quote?.kind === "oc" ? quote.swap : undefined
    return <OnChainSwitcher swap={swap} />
  }

  const swap = quote?.kind === "xc" ? quote.swap : undefined
  return (
    <CrossChainSwitcher
      sellAsset={sellAsset}
      buyAsset={buyAsset}
      price={swap?.spotPrice}
      isLoading={isQuoteLoading}
    />
  )
}
