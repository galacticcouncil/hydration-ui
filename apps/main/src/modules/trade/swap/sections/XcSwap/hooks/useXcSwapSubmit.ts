import { MarketFormValues } from "@/modules/trade/swap/sections/Market/lib/useMarketForm"
import { useSubmitSwap } from "@/modules/trade/swap/sections/Market/lib/useSubmitSwap"
import { useSubmitTwap } from "@/modules/trade/swap/sections/Market/lib/useSubmitTwap"
import { useSubmitXcSwap } from "@/modules/trade/swap/sections/XcSwap/hooks/useSubmitXcSwap"
import { XcSwapFormValues } from "@/modules/trade/swap/sections/XcSwap/hooks/useXcSwapForm"
import { XcSwapQuote } from "@/modules/trade/swap/sections/XcSwap/hooks/useXcSwapQuote"
import { useAssets } from "@/providers/assetsProvider"

type UseXcSwapSubmitParams = {
  quote: XcSwapQuote
}

export const useXcSwapSubmit = ({ quote }: UseXcSwapSubmitParams) => {
  const { getAsset } = useAssets()
  const submit = useSubmitXcSwap()
  const submitOmnipool = useSubmitSwap()
  const submitTwap = useSubmitTwap()

  const toMarketFormValues = (values: XcSwapFormValues): MarketFormValues => ({
    sellAsset: values.sellAsset,
    sellAmount: values.sellAmount,
    buyAsset:
      values.buyAsset?.id !== undefined
        ? (getAsset(String(values.buyAsset.id)) ?? null)
        : null,
    buyAmount: values.buyAmount,
    type: values.type,
    isSingleTrade: values.isSingleTrade,
  })

  const onSubmit = (values: XcSwapFormValues) => {
    if (quote?.kind === "xc") {
      submit.mutate([values, quote.swap])
    } else if (quote?.kind === "oc" && values.isSingleTrade) {
      submitOmnipool.mutate([toMarketFormValues(values), quote.swap])
    } else if (quote?.kind === "oc" && quote.twap) {
      submitTwap.mutate([toMarketFormValues(values), quote.twap])
    }
  }

  const isSubmitting =
    submit.isPending || submitOmnipool.isPending || submitTwap.isPending

  return { onSubmit, isSubmitting }
}
