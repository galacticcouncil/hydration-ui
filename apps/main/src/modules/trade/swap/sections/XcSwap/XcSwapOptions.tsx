import { Box } from "@galacticcouncil/ui/components"
import { Controller, useFormContext } from "react-hook-form"

import { OrderMatchToggle } from "@/modules/trade/swap/components/OrderMatchToggle"
import { TradeModeOptions } from "@/modules/trade/swap/sections/XcSwap/components/TradeModeOptions"
import { useOnChainTradeAssets } from "@/modules/trade/swap/sections/XcSwap/hooks/useOnChainTradeAssets"
import { XcSwapFormValues } from "@/modules/trade/swap/sections/XcSwap/hooks/useXcSwapForm"
import { isATokenPair } from "@/modules/trade/swap/sections/XcSwap/lib/isATokenPair"
import { useXcSwap } from "@/modules/trade/swap/sections/XcSwap/XcSwapProvider"
import { useAssets } from "@/providers/assetsProvider"
import { useIsIceEnabled } from "@/states/intents"

export const XcSwapOptions = () => {
  const { quote, isQuoteLoading, isTwapLoading, isCrossChain } = useXcSwap()
  const { sellAsset, buyAsset } = useOnChainTradeAssets()
  const { getErc20AToken } = useAssets()
  const isIceEnabled = useIsIceEnabled()
  const { control, watch } = useFormContext<XcSwapFormValues>()
  const isSingleTrade = watch("isSingleTrade")

  const onChainQuote = quote?.kind === "oc" ? quote : null
  const isShown = !isCrossChain && (isQuoteLoading || !!onChainQuote)

  if (!isShown) {
    return null
  }

  // Order Match only applies where useSubmitSwap places an intent, and not to
  // a TWAP, whose DCA intent has no match window
  const isIntentSwap =
    isIceEnabled &&
    !!sellAsset &&
    !!buyAsset &&
    !isATokenPair(getErc20AToken, sellAsset.id, buyAsset.id)

  return (
    <Box py="l">
      {isIntentSwap && (
        <Controller
          control={control}
          name="isOrderMatch"
          render={({ field }) => (
            <OrderMatchToggle
              checked={field.value}
              disabled={!isSingleTrade}
              onCheckedChange={field.onChange}
            />
          )}
        />
      )}
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
