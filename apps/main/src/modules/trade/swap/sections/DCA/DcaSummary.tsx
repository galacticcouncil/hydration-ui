import { getTimeFrameMillis } from "@galacticcouncil/main/src/components/TimeFrame/TimeFrame.utils"
import { TradeDcaOrder } from "@galacticcouncil/sdk-next/sor"
import {
  Box,
  Flex,
  Summary,
  SummaryRowLabel,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import Big from "big.js"
import { FC } from "react"
import { useFormContext } from "react-hook-form"
import { Trans, useTranslation } from "react-i18next"

import { SwapSummaryRow } from "@/modules/trade/swap/components/SwapSummaryRow"
import { DcaSummarySkeleton } from "@/modules/trade/swap/sections/DCA/DcaSummarySkeleton"
import {
  DcaFormValues,
  DcaOrdersMode,
} from "@/modules/trade/swap/sections/DCA/useDcaForm"
import { SwapSectionSeparator } from "@/modules/trade/swap/SwapPage.styled"
import { useAssets } from "@/providers/assetsProvider"
import { scaleHuman } from "@/utils/formatting"

type Props = {
  readonly order: TradeDcaOrder | undefined | null
  readonly isLoading: boolean
}

export const DcaSummary: FC<Props> = ({ order, isLoading }) => {
  const { t } = useTranslation(["common", "trade"])
  const { watch } = useFormContext<DcaFormValues>()
  const { getAsset } = useAssets()

  const buyAsset = order ? getAsset(order.assetOut) : undefined
  const sellAsset = order ? getAsset(order.assetIn) : undefined

  const now = Date.now()

  const [durationTimeFrame, type, limitEnabled, limitPrice, limitInverted] =
    watch([
      "duration",
      "orders.type",
      "limitEnabled",
      "limitPrice",
      "limitInverted",
    ])
  const isOpenBudget = type === DcaOrdersMode.OpenBudget
  const duration = getTimeFrameMillis(durationTimeFrame)
  const frequency =
    order && order.tradeCount > 0 ? duration / order.tradeCount : 0

  const endDate = new Date(now + duration)
  const endDateValid = !isNaN(endDate.valueOf())

  if (isLoading) {
    return (
      <>
        <SwapSectionSeparator />
        <DcaSummarySkeleton />
      </>
    )
  }

  if (!order || !sellAsset || !buyAsset) {
    return null
  }

  const tradeAmountIn = scaleHuman(order.tradeAmountIn, sellAsset.decimals)

  // The summary limit clause mirrors the price section's denomination: not
  // inverted -> "1 BUY at or below {limitPrice} SELL"; inverted -> "1 SELL at
  // or above {1/limitPrice} BUY". limitPrice stays canonical (SELL per BUY).
  const limitPriceForClause = (() => {
    if (!limitInverted) return limitPrice
    try {
      const p = new Big(limitPrice)
      return p.gt(0) ? new Big(1).div(p).toString() : limitPrice
    } catch {
      return limitPrice
    }
  })()

  return (
    <>
      <SwapSectionSeparator />
      <div>
        <Flex direction="column" gap="base" py="base">
          <SummaryRowLabel>{t("summary")}</SummaryRowLabel>
          <Text fw={500} fs="p4" lh="l" color={getToken("text.high")}>
            <Trans
              t={t}
              i18nKey={
                isOpenBudget
                  ? "trade:dca.summary.openBudget.description"
                  : "trade:dca.summary.limitedBudget.description"
              }
              values={{
                sellAmount: t("currency", {
                  value: tradeAmountIn,
                  symbol: sellAsset.symbol,
                }),
                buySymbol: buyAsset.symbol,
                frequency: t("interval", { value: frequency }),
                duration: t("interval", { value: duration }),
              }}
            >
              <Box as="span" color={getToken("text.tint.secondary")} />
            </Trans>
          </Text>
          {limitEnabled && limitPrice && (
            <Text fw={500} fs="p4" lh="l" color={getToken("text.high")}>
              <Trans
                t={t}
                i18nKey={
                  limitInverted
                    ? "trade:dca.summary.limitClauseAbove"
                    : "trade:dca.summary.limitClause"
                }
                values={{
                  buySymbol: buyAsset.symbol,
                  price: limitPriceForClause,
                  sellSymbol: sellAsset.symbol,
                }}
              >
                <Box as="span" color={getToken("text.tint.secondary")} />
              </Trans>
            </Text>
          )}
        </Flex>
        <SwapSectionSeparator sx={{ mt: 9 }} />
        <Summary separator={<SwapSectionSeparator />}>
          {endDateValid && (
            <SwapSummaryRow
              label={t("trade:dca.summary.scheduleEnd")}
              content={t("date.datetime.short", {
                value: endDate,
              })}
            />
          )}
        </Summary>
      </div>
    </>
  )
}
