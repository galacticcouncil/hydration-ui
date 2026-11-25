import { Box } from "@galacticcouncil/ui/components"

import { TradeModeOptions } from "@/modules/trade/swap/sections/XcSwap/components/TradeModeOptions"
import { useOnChainTradeAssets } from "@/modules/trade/swap/sections/XcSwap/hooks/useOnChainTradeAssets"
import { useXcSwap } from "@/modules/trade/swap/sections/XcSwap/XcSwapProvider"
import { useIsIceEnabled } from "@/states/intents"

export const XcSwapOptions = () => {
  const { quote, isQuoteLoading, isTwapLoading, isCrossChain } = useXcSwap()
  const { sellAsset, buyAsset } = useOnChainTradeAssets()
  const isIceEnabled = useIsIceEnabled()

  // Like the Limit tab, the split (TWAP) option needs intents turned on
  const onChainQuote = quote?.kind === "oc" ? quote : null
  const isShown =
    isIceEnabled && !isCrossChain && (isQuoteLoading || !!onChainQuote)

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
