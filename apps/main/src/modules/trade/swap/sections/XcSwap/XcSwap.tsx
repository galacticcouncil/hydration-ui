import { HealthFactorRiskWarning } from "@galacticcouncil/money-market/components"
import { Box, LoadingButton } from "@galacticcouncil/ui/components"
import Big from "big.js"
import { useEffect, useState } from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { AuthorizedAction } from "@/components/AuthorizedAction/AuthorizedAction"
import { XcSwapFormValues } from "@/modules/trade/swap/sections/XcSwap/hooks/useXcSwapForm"
import { XcSwapAlerts } from "@/modules/trade/swap/sections/XcSwap/XcSwapAlerts"
import { XcSwapFields } from "@/modules/trade/swap/sections/XcSwap/XcSwapFields"
import { XcSwapOptions } from "@/modules/trade/swap/sections/XcSwap/XcSwapOptions"
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
    healthFactor,
  } = useXcSwap()
  const form = useFormContext<XcSwapFormValues>()
  const { t } = useTranslation()

  const [sellAmount, destAddress, isSingleTrade] = form.watch([
    "sellAmount",
    "destAddress",
    "isSingleTrade",
  ])

  const [healthFactorRiskAccepted, setHealthFactorRiskAccepted] =
    useState(false)

  const { watch } = form
  useEffect(() => {
    const subscription = watch((_, { type }) => {
      if (type !== "change") {
        return
      }

      setHealthFactorRiskAccepted(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [watch])

  // OnChain-only: gate submit on accepting the health-factor risk (mirror Market)
  const isHealthFactorConsentRequired =
    !isCrossChain &&
    !!healthFactor &&
    healthFactor.isUserConsentRequired &&
    healthFactor.future < healthFactor.current

  const isFormValid =
    form.formState.isValid && !alerts.length && !!quote && !isQuoteLoading

  const isHealthFactorCheckSatisfied = isHealthFactorConsentRequired
    ? healthFactorRiskAccepted
    : true

  const canSubmit = isFormValid && isHealthFactorCheckSatisfied

  const shouldRenderHealthFactorWarning =
    isHealthFactorConsentRequired && Big(healthFactor.future).gt(1)

  const submitLabel = (() => {
    if (!sellAmount) return "Enter an amount"
    if (isCrossChain && !destAddress.trim()) return "Enter recipient address"
    if (alerts.length) return "Swap unavailable"
    if (!isHealthFactorCheckSatisfied) return "Accept health factor change"
    return isSingleTrade ? "Swap" : "Place trades"
  })()

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <XcSwapFields destChainAssetPairs={destChainAssetPairs} />
      <XcSwapOptions />
      <SwapSectionSeparator />
      <XcSwapAlerts />
      {healthFactor && shouldRenderHealthFactorWarning && (
        <Box mt="base">
          <HealthFactorRiskWarning
            canContinue={isFormValid}
            message={t("healthFactor.warning")}
            accepted={healthFactorRiskAccepted}
            isUserConsentRequired={healthFactor.isUserConsentRequired}
            onAcceptedChange={setHealthFactorRiskAccepted}
          />
        </Box>
      )}
      <Box py="m">
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
      <XcSwapSummary />
    </form>
  )
}
