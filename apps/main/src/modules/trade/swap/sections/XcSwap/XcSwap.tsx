import { Button } from "@galacticcouncil/ui/components"
import { useFormContext } from "react-hook-form"

import { XcSwapFormValues } from "@/modules/trade/swap/sections/XcSwap/lib/useXcSwapForm"
import { XcSwapAlerts } from "@/modules/trade/swap/sections/XcSwap/XcSwapAlerts"
import { XcSwapFields } from "@/modules/trade/swap/sections/XcSwap/XcSwapFields"
import { useXcSwap } from "@/modules/trade/swap/sections/XcSwap/XcSwapProvider"
import { XcSwapSummary } from "@/modules/trade/swap/sections/XcSwap/XcSwapSummary"
import { SwapSectionSeparator } from "@/modules/trade/swap/SwapPage.styled"

export const XcSwap: React.FC = () => {
  const {
    sourceChainAssetPairs,
    destChainAssetPairs,
    userData,
    onSubmit,
    alerts,
  } = useXcSwap()
  const form = useFormContext<XcSwapFormValues>()

  const destAsset = form.watch("destAsset")
  const canSubmit = form.formState.isValid && !alerts.length

  const submitLabel = (() => {
    if (canSubmit) return "Swap"
    if (alerts.length) return "Swap unavailable"
    if (destAsset) return `Enter ${destAsset.symbol} address`
    return "Enter destination address"
  })()

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <XcSwapFields
        sourceChainAssetPairs={sourceChainAssetPairs}
        destChainAssetPairs={destChainAssetPairs}
        userData={userData}
      />
      <SwapSectionSeparator />
      <XcSwapAlerts />
      <Button
        type="submit"
        size="large"
        width="100%"
        disabled={!canSubmit}
        variant={canSubmit ? "primary" : "tertiary"}
        sx={{ my: "xl", opacity: 1 }}
      >
        {submitLabel}
      </Button>
      <SwapSectionSeparator />

      <XcSwapSummary />
    </form>
  )
}
