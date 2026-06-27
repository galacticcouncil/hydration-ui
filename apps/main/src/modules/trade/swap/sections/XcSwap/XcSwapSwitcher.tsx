import { CrossChainSwitcher } from "@/modules/trade/swap/sections/XcSwap/components/CrossChainSwitcher"
import { OnChainSwitcher } from "@/modules/trade/swap/sections/XcSwap/components/OnChainSwitcher"
import { useXcSwap } from "@/modules/trade/swap/sections/XcSwap/XcSwapProvider"

export const XcSwapSwitcher = () => {
  const { quote, isCrossChain } = useXcSwap()

  if (!isCrossChain) {
    const swap = quote?.kind === "oc" ? quote.swap : undefined
    return <OnChainSwitcher swap={swap} />
  }

  const swap = quote?.kind === "xc" ? quote.swap : undefined
  return <CrossChainSwitcher swap={swap} />
}
