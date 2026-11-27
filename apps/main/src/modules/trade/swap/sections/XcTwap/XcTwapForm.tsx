import { Alert, Button, Flex, Text } from "@galacticcouncil/ui/components"
import {
  useAccount,
  useWeb3ConnectModal,
  WalletMode,
} from "@galacticcouncil/web3-connect"
import { useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { FC, useEffect, useState } from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { healthFactorQuery } from "@/api/aave"
import { bestSellQuery } from "@/api/trade"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"
import { HealthFactorRiskWarning } from "@/modules/money-market/health-factor/HealthFactorRiskWarning"
import { TradeFormShell } from "@/modules/trade/swap/components/TradeFormShell/TradeFormShell"
import { TradeFormSubmit } from "@/modules/trade/swap/components/TradeFormSubmit"
import { DcaLimitedBudgetFields } from "@/modules/trade/swap/sections/DCA/DcaLimitedBudgetFields"
import { useNearRecipientValidation } from "@/modules/trade/swap/sections/XcSwap/hooks/useNearRecipientValidation"
import { useSubmitXcTwap } from "@/modules/trade/swap/sections/XcTwap/hooks/useSubmitXcTwap"
import { XcTwapFormValues } from "@/modules/trade/swap/sections/XcTwap/XcTwap.form"
import { XcTwapFields } from "@/modules/trade/swap/sections/XcTwap/XcTwapFields"
import { useXcTwap } from "@/modules/trade/swap/sections/XcTwap/XcTwapProvider"
import { XcTwapSummary } from "@/modules/trade/swap/sections/XcTwap/XcTwapSummary"
import { XcTwapTradeMeta } from "@/modules/trade/swap/sections/XcTwap/XcTwapTradeMeta"
import { useRpcProvider } from "@/providers/rpcProvider"
import { NATIVE_EVM_ASSET_ID } from "@/utils/consts"
import { toDecimal } from "@/utils/formatting"
import { maxBalanceError } from "@/utils/validators"

export const XcTwapForm: FC = () => {
  const { t } = useTranslation(["common", "trade"])
  const rpc = useRpcProvider()
  const { account } = useAccount()
  const { toggle } = useWeb3ConnectModal()
  const {
    isWalletCompatible,
    estimate,
    estimateParams,
    isEstimateLoading,
    estimateAlert,
  } = useXcTwap()
  const { watch, formState, handleSubmit } = useFormContext<XcTwapFormValues>()
  const { submit, isSubmitting } = useSubmitXcTwap(estimateParams)

  const [sellAsset, sellAmount, destChain, buyAsset, destAddress] = watch([
    "sellAsset",
    "sellAmount",
    "destChain",
    "buyAsset",
    "destAddress",
  ])
  const nearAccountStatus = useNearRecipientValidation(destChain, destAddress)
  const isNearRecipientReady =
    nearAccountStatus === "notApplicable" || nearAccountStatus === "exists"

  const [debouncedAmount, isAmountSynced] = useDebouncedValue(sellAmount)
  // Nothing arrives on Hydration, so only the sold side moves the health factor
  const { data: healthFactor, isLoading: isHealthFactorLoading } = useQuery(
    healthFactorQuery(rpc, {
      fromAsset: sellAsset,
      fromAmount: debouncedAmount,
      toAsset: null,
      toAmount: "0",
      address: account?.address ?? "",
    }),
  )

  // Price impact of one order's sell into WETH
  const { data: orderSwap } = useQuery(
    bestSellQuery(rpc, {
      assetIn: sellAsset?.id ?? "",
      assetOut: NATIVE_EVM_ASSET_ID,
      amountIn:
        estimate && sellAsset
          ? toDecimal(estimate.amountInPerTrade, sellAsset.decimals)
          : "",
    }),
  )

  const [healthFactorRiskAccepted, setHealthFactorRiskAccepted] =
    useState(false)

  useEffect(() => {
    const subscription = watch((_, { type }) => {
      if (type === "change") setHealthFactorRiskAccepted(false)
    })

    return () => subscription.unsubscribe()
  }, [watch])

  const sellAmountError = formState.errors.sellAmount?.message

  const isFormValid =
    formState.isValid &&
    isNearRecipientReady &&
    !!estimate &&
    !estimate.errors.length &&
    !estimateAlert

  const isHealthFactorConsentRequired =
    !!healthFactor?.isUserConsentRequired &&
    healthFactor.hasChanged &&
    healthFactor.future < healthFactor.current

  const isHealthFactorCheckSatisfied =
    !isHealthFactorConsentRequired || healthFactorRiskAccepted

  const shouldRenderHealthFactorWarning =
    isFormValid &&
    isHealthFactorConsentRequired &&
    Big(healthFactor.future).gt(1)

  // First blocking reason wins; the EVM gate replaces the button below
  const disabledLabel = (() => {
    if (!destAddress.trim()) return t("trade:xc.swap.cta.selectRecipient")
    if (nearAccountStatus === "missing")
      return t("trade:xc.swap.error.nearAccountNotFound")
    if (nearAccountStatus === "unavailable")
      return t("trade:xc.swap.cta.nearAccountCheckFailed")
    if (sellAmountError && sellAmountError !== maxBalanceError) {
      // Told apart by message, as maxBalanceError is in TradeFormSubmit
      return sellAmountError === t("trade:xc.twap.error.belowEd")
        ? t("trade:xc.twap.cta.orderTooSmall")
        : t("trade:xc.twap.cta.minBudget")
    }
    // A blocking alert reads as "Trade unavailable"
    if (!isFormValid) return undefined
    if (!isHealthFactorCheckSatisfied)
      return t("trade:xc.swap.cta.acceptHealthFactor")
    return undefined
  })()

  const alertMessage =
    estimateAlert === "unpriced"
      ? t("trade:xc.twap.error.unpriced", {
          symbol: buyAsset?.symbol,
          chain: destChain?.name,
        })
      : estimateAlert === "estimateFailed"
        ? t("trade:xc.twap.error.estimateFailed")
        : null

  return (
    <form onSubmit={handleSubmit(submit)}>
      <TradeFormShell
        fields={<XcTwapFields />}
        submit={
          isWalletCompatible ? (
            <TradeFormSubmit
              isEnabled={isFormValid && isHealthFactorCheckSatisfied}
              isLoading={
                isSubmitting ||
                isEstimateLoading ||
                // No result reads as "no consent needed", so wait for it
                isHealthFactorLoading ||
                !isAmountSynced ||
                formState.isValidating
              }
              disabledLabel={disabledLabel}
            >
              {t("schedule")}
            </TradeFormSubmit>
          ) : (
            <Button
              size="large"
              variant="secondary"
              width="100%"
              onClick={() => toggle(WalletMode.EVM)}
            >
              <Text fs="p3">{t("connectWallet.evm")}</Text>
            </Button>
          )
        }
        summary={
          (isEstimateLoading || (estimate && !estimate.errors.length)) && (
            <XcTwapTradeMeta
              priceImpactPct={
                isEstimateLoading ? undefined : orderSwap?.priceImpactPct
              }
              healthFactor={
                sellAmountError === maxBalanceError ? undefined : healthFactor
              }
            />
          )
        }
      >
        {/* Shares the field names DCA uses; no open budget or limit price */}
        <DcaLimitedBudgetFields />
        <XcTwapSummary />
        <Flex
          direction="column"
          gap="s"
          py="l"
          sx={{ "&:empty": { display: "none" } }}
        >
          {alertMessage && <Alert variant="error" description={alertMessage} />}
          {shouldRenderHealthFactorWarning && (
            <HealthFactorRiskWarning
              canContinue={isFormValid}
              message={t("healthFactor.warning")}
              accepted={healthFactorRiskAccepted}
              isUserConsentRequired={healthFactor.isUserConsentRequired}
              onAcceptedChange={setHealthFactorRiskAccepted}
            />
          )}
        </Flex>
      </TradeFormShell>
    </form>
  )
}
