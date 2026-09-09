import { MarketErrors } from "@/modules/trade/swap/sections/Market/MarketErrors"
import { useXcSwap } from "@/modules/trade/swap/sections/XcSwap/XcSwapProvider"

export const XcSwapErrors = () => {
  const { quote } = useXcSwap()

  const onChainQuote = quote?.kind === "oc" ? quote : null

  if (!onChainQuote) {
    return null
  }

  return <MarketErrors swap={onChainQuote.swap} />
}
