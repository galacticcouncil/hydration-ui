import { Box, LoadingButton } from "@galacticcouncil/ui/components"
import { useFormContext } from "react-hook-form"

import { AuthorizedAction } from "@/components/AuthorizedAction/AuthorizedAction"
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
    isCrossChain,
  } = useXcSwap()
  const form = useFormContext<XcSwapFormValues>()

  const [srcAmount, destAddress] = form.watch(["srcAmount", "destAddress"])
  const canSubmit =
    form.formState.isValid && !alerts.length && !!quote && !isQuoteLoading

  const submitLabel = (() => {
    if (!srcAmount) return "Enter an amount"
    if (alerts.length) return "Swap unavailable"
    if (isCrossChain && !destAddress.trim()) return "Enter recipient address"
    if (canSubmit) return "Swap"
    return "Swap unavailable"
  })()

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <XcSwapFields destChainAssetPairs={destChainAssetPairs} />
      <SwapSectionSeparator />
      <XcSwapAlerts />
      <Box py="xl">
        <AuthorizedAction size="large" width="100%">
          <LoadingButton
            type="submit"
            size="large"
            width="100%"
            isLoading={isLoading}
            disabled={!canSubmit || isLoading}
            variant={canSubmit ? "primary" : "muted"}
            loadingVariant="muted"
            sx={{
              "&:disabled": { cursor: "auto", opacity: 1 },
            }}
          >
            {submitLabel}
          </LoadingButton>
        </AuthorizedAction>
      </Box>
      <SwapSectionSeparator />
      <XcSwapSummary />
    </form>
  )
}
