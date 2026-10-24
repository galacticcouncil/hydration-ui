import {
  Alert,
  Button,
  Stack,
  Summary,
  SummaryRow,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC, useEffect, useState } from "react"
import { Controller, FormProvider } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useDebounce } from "react-use"

import { AssetSelect } from "@/components/AssetSelect/AssetSelect"
import { usePerpsDepositHydrationForm } from "@/modules/perps/components/PerpsDepositHydration.form"
import {
  usePerpsDepositQuote,
  usePerpsDepositRoute,
  usePerpsDepositSubmit,
} from "@/modules/perps/components/PerpsDepositHydration.utils"
import { pickPrimaryXcSwapError } from "@/modules/trade/swap/sections/XcSwap/lib/pickPrimaryXcSwapAlert"
import { getXcSwapErrorMessage } from "@/modules/trade/swap/sections/XcSwap/lib/xcSwapErrorMessages"
import { scaleHuman } from "@/utils/formatting"

const QUOTE_DEBOUNCE_MS = 400

type PerpsDepositHydrationProps = {
  /** Called once the deposit is signed; its status continues in the toasts. */
  readonly onSubmitted: () => void
}

export const PerpsDepositHydration: FC<PerpsDepositHydrationProps> = ({
  onSubmitted,
}) => {
  const { t } = useTranslation(["trade", "common"])
  const route = usePerpsDepositRoute()
  const form = usePerpsDepositHydrationForm(route.balance)
  const { deposit, isPending } = usePerpsDepositSubmit(route, {
    onSubmitted: () => {
      form.reset()
      onSubmitted()
    },
  })

  // The resolver reads the latest balance, but an amount checked before the
  // balances loaded keeps its max-balance error until it is validated again.
  useEffect(() => {
    if (form.getValues("amount")) form.trigger("amount")
  }, [route.balance, form])

  const amount = form.watch("amount")
  const isAmountValid = form.formState.isValid
  const [quotedAmount, setQuotedAmount] = useState("")
  useDebounce(
    () => setQuotedAmount(isAmountValid ? amount : ""),
    QUOTE_DEBOUNCE_MS,
    [amount, isAmountValid],
  )

  const quote = usePerpsDepositQuote(route, quotedAmount)
  const trade = quotedAmount ? quote.data : undefined
  const tradeError = trade ? pickPrimaryXcSwapError(trade.errors) : null
  const { output, bridged } = route

  const canSubmit =
    !!trade &&
    !tradeError &&
    isAmountValid &&
    quotedAmount === amount &&
    !quote.isFetching &&
    !isPending

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(({ amount }) => deposit(amount))}>
        <Stack gap="m">
          <Controller
            control={form.control}
            name="amount"
            render={({ field, fieldState }) => (
              <AssetSelect
                label={t("perps.deposit.amount")}
                assets={[]}
                selectedAsset={route.usdc}
                value={field.value}
                onChange={field.onChange}
                amountError={fieldState.error?.message}
              />
            )}
          />

          {trade && output && !tradeError && (
            <Summary>
              <SummaryRow
                label={t("perps.deposit.receive")}
                content={t("common:currency", {
                  value: scaleHuman(trade.amountOut, output.decimals),
                  symbol: output.symbol,
                })}
                loading={quote.isFetching}
              />
              <SummaryRow
                label={t("market.summary.minReceived")}
                tooltip={t("market.summary.minReceived.tooltip")}
                content={t("common:currency", {
                  value: scaleHuman(trade.minAmountOut, output.decimals),
                  symbol: output.symbol,
                })}
              />
              <SummaryRow
                label={t("market.summary.estTradeFees")}
                tooltip={t("market.summary.estTradeFees.tooltip")}
                content={`${t("common:currency", {
                  value: trade.feeUsd,
                  maximumFractionDigits: null,
                })} ${t("common:parenthesized", {
                  value: t("common:percent", { value: trade.feePct }),
                })}`}
              />
              {bridged && trade.refund > 0n && (
                <SummaryRow
                  label={t("perps.deposit.refund")}
                  tooltip={t("perps.deposit.refund.tooltip", {
                    address: route.refundTo,
                  })}
                  // Native ETH on Ethereum, though the leg is valued in WETH.
                  content={t("common:currency", {
                    value: scaleHuman(trade.refund, bridged.decimals),
                    symbol: "ETH",
                  })}
                />
              )}
              <SummaryRow
                label={t("xc.swap.summary.estimatedTime")}
                content={t("common:interval.short", {
                  value: trade.timeEstimate * 1000,
                })}
              />
            </Summary>
          )}

          {(tradeError || quote.isError) && (
            <Alert
              variant="error"
              title={
                tradeError
                  ? getXcSwapErrorMessage(tradeError, t)
                  : t("xc.swap.error.quoteFailed")
              }
            />
          )}

          <Text fs="p6" color={getToken("text.medium")}>
            {t("perps.deposit.note")}
          </Text>

          <Button type="submit" size="large" disabled={!canSubmit}>
            {isPending ? t("perps.deposit.pending") : t("perps.deposit.cta")}
          </Button>
        </Stack>
      </form>
    </FormProvider>
  )
}
