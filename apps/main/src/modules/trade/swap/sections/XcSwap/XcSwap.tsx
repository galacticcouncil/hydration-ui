import { HealthFactorRiskWarning } from "@galacticcouncil/money-market/components"
import { Box, LoadingButton } from "@galacticcouncil/ui/components"
import {
  useAccount,
  useWeb3ConnectModal,
  WalletMode,
} from "@galacticcouncil/web3-connect"
import { EVM_PROVIDERS } from "@galacticcouncil/web3-connect/src/config/providers"
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
  const { account, isConnected } = useAccount()
  const { toggle: toggleWalletModal } = useWeb3ConnectModal()
  const { t } = useTranslation(["common", "trade"])

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
  const isNonEvmCrossChainWallet =
    isCrossChain &&
    isConnected &&
    !!account?.provider &&
    !EVM_PROVIDERS.includes(account.provider)

  const canSubmit = isFormValid && isHealthFactorCheckSatisfied

  const shouldRenderHealthFactorWarning =
    isHealthFactorConsentRequired && Big(healthFactor.future).gt(1)

  const submitLabel = (() => {
    if (isNonEvmCrossChainWallet) return t("trade:xc.swap.cta.connectEvmWallet")
    if (!sellAmount) return t("trade:xc.swap.cta.enterAmount")
    if (isCrossChain && !destAddress.trim())
      return t("trade:xc.swap.cta.enterRecipient")
    if (alerts.length || !form.formState.isValid)
      return t("trade:xc.swap.cta.unavailable")
    if (!isHealthFactorCheckSatisfied)
      return t("trade:xc.swap.cta.acceptHealthFactor")
    return isSingleTrade ? t("swap") : t("trade:market.twap.cta")
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
        {isNonEvmCrossChainWallet ? (
          <LoadingButton
            type="button"
            size="large"
            width="100%"
            isLoading={false}
            variant="secondary"
            onClick={() =>
              toggleWalletModal(WalletMode.EVM, {
                title: t("trade:xc.swap.connectEvm.title"),
                description: t("trade:xc.swap.connectEvm.description"),
              })
            }
          >
            {submitLabel}
          </LoadingButton>
        ) : (
          <AuthorizedAction
            size="large"
            width="100%"
            mode={isCrossChain ? WalletMode.EVM : undefined}
          >
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
        )}
      </Box>
      <XcSwapSummary />
    </form>
  )
}
