import { LoadingButton } from "@galacticcouncil/ui/components"
import { useFormContext } from "react-hook-form"

import { XcSwapFormValues } from "@/modules/trade/swap/sections/XcSwap/hooks/useXcSwapForm"
import { XcSwapAlerts } from "@/modules/trade/swap/sections/XcSwap/XcSwapAlerts"
import { XcSwapFields } from "@/modules/trade/swap/sections/XcSwap/XcSwapFields"
import { useXcSwap } from "@/modules/trade/swap/sections/XcSwap/XcSwapProvider"
import { XcSwapSummary } from "@/modules/trade/swap/sections/XcSwap/XcSwapSummary"
import { SwapSectionSeparator } from "@/modules/trade/swap/SwapPage.styled"

export const XcSwap: React.FC = () => {
  const {
    destChainAssetPairs,
    onSubmit,
    alerts,
    quote,
    isQuoteLoading,
    isLoading,
  } = useXcSwap()
  const form = useFormContext<XcSwapFormValues>()

  const destAsset = form.watch("destAsset")
  // Block submit without a firm quote (loading or absent) or a blocking alert.
  const canSubmit =
    form.formState.isValid && !alerts.length && !!quote && !isQuoteLoading

  const submitLabel = (() => {
    if (canSubmit) return "Swap"
    if (alerts.length) return "Swap unavailable"
    if (destAsset) return `Enter ${destAsset.symbol} address`
    return "Enter destination address"
  })()

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <XcSwapFields destChainAssetPairs={destChainAssetPairs} />
      <SwapSectionSeparator />
      <XcSwapAlerts />
      <LoadingButton
        type="submit"
        size="large"
        width="100%"
        isLoading={isLoading}
        disabled={!canSubmit || isLoading}
        variant={canSubmit ? "primary" : "tertiary"}
        sx={{ my: "xl", opacity: 1 }}
      >
        {submitLabel}
      </LoadingButton>
      <SwapSectionSeparator />

      <XcSwapSummary />
    </form>
  )
}
