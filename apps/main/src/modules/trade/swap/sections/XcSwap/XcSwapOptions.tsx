import { Box } from "@galacticcouncil/ui/components"
import { useFormContext } from "react-hook-form"

import { MarketTradeOptions } from "@/modules/trade/swap/sections/Market/MarketTradeOptions"
import { MarketWarnings } from "@/modules/trade/swap/sections/Market/MarketWarnings"
import { XcSwapFormValues } from "@/modules/trade/swap/sections/XcSwap/hooks/useXcSwapForm"
import { isXcSwapTradeEnabled } from "@/modules/trade/swap/sections/XcSwap/lib/isXcSwapTradeEnabled"
import { XcSwapErrors } from "@/modules/trade/swap/sections/XcSwap/XcSwapErrors"
import { useXcSwap } from "@/modules/trade/swap/sections/XcSwap/XcSwapProvider"

export const XcSwapOptions = () => {
  const { quote, isQuoteLoading, isTwapLoading, isCrossChain } = useXcSwap()
  const form = useFormContext<XcSwapFormValues>()

  const isSingleTrade = form.watch("isSingleTrade")
  const onChainQuote = quote?.kind === "oc" ? quote : null
  const isFormValid =
    form.formState.isValid && isXcSwapTradeEnabled(quote, isSingleTrade)
  const isShown = !isCrossChain && (isQuoteLoading || !!onChainQuote)

  if (!isShown) {
    return null
  }

  return (
    <Box pt="base" pb="m">
      <MarketTradeOptions
        swap={onChainQuote?.swap}
        twap={onChainQuote?.twap}
        isSwapLoading={isQuoteLoading}
        isTwapLoading={isTwapLoading}
      />
      {onChainQuote && (
        <MarketWarnings
          isFormValid={isFormValid}
          isSingleTrade={isSingleTrade}
          swap={onChainQuote.swap}
          twap={onChainQuote.twap}
          healthFactor={undefined}
          healthFactorRiskAccepted={false}
          setHealthFactorRiskAccepted={() => {}}
        />
      )}
      <XcSwapErrors />
    </Box>
  )
}
