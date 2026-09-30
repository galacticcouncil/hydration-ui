import { Box } from "@galacticcouncil/ui/components"

import { TradeModeOptions } from "@/modules/trade/swap/sections/XcSwap/components/TradeModeOptions"
import { useOnChainTradeAssets } from "@/modules/trade/swap/sections/XcSwap/hooks/useOnChainTradeAssets"
import { useXcSwap } from "@/modules/trade/swap/sections/XcSwap/XcSwapProvider"

export const XcSwapOptions = () => {
  const { quote, isQuoteLoading, isTwapLoading, isCrossChain } = useXcSwap()
  const { sellAsset, buyAsset } = useOnChainTradeAssets()

  const onChainQuote = quote?.kind === "oc" ? quote : null
  const isShown = !isCrossChain && (isQuoteLoading || !!onChainQuote)

  if (!isShown) {
    return null
  }

  return (
    <Box py="l">
      <TradeModeOptions
        sellAsset={sellAsset}
        buyAsset={buyAsset}
        swap={onChainQuote?.swap}
        twap={onChainQuote?.twap}
        isSwapLoading={isQuoteLoading}
        isTwapLoading={isTwapLoading}
      />
    </Box>
  )
}
