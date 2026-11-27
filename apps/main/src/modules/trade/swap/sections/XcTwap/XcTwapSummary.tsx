import {
  Flex,
  Skeleton,
  Summary,
  SummaryRowLabel,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useFormContext } from "react-hook-form"
import { Trans, useTranslation } from "react-i18next"

import { useDisplayAssetPrice } from "@/components/AssetPrice"
import { getTimeFrameMillis } from "@/components/TimeFrame/TimeFrame.utils"
import { SwapSummaryRow } from "@/modules/trade/swap/components/SwapSummaryRow"
import { XcTwapFormValues } from "@/modules/trade/swap/sections/XcTwap/XcTwap.form"
import { useXcTwap } from "@/modules/trade/swap/sections/XcTwap/XcTwapProvider"
import { SwapSectionSeparator } from "@/modules/trade/swap/SwapPage.styled"
import { toDecimal } from "@/utils/formatting"

/** What the Intent TWAP schedules; sits above the submit. */
export const XcTwapSummary: FC = () => {
  const { t } = useTranslation(["common", "trade"])
  const { watch } = useFormContext<XcTwapFormValues>()
  const { estimate, isEstimateLoading } = useXcTwap()

  const [sellAsset, destChain, buyAsset, durationTimeFrame] = watch([
    "sellAsset",
    "destChain",
    "buyAsset",
    "duration",
  ])

  const tranches = estimate?.tranches ?? 0
  const amountInPerTrade =
    estimate && sellAsset
      ? toDecimal(estimate.amountInPerTrade, sellAsset.decimals)
      : "0"
  const [amountInPerTradeDisplay, { isValid: isSellPriceValid }] =
    useDisplayAssetPrice(sellAsset?.id ?? "", amountInPerTrade)

  if (!sellAsset || !destChain || !buyAsset) return null
  if (!estimate && !isEstimateLoading) return null

  const isLoading = !estimate || isEstimateLoading
  const duration = getTimeFrameMillis(durationTimeFrame)
  const endDate = new Date(Date.now() + duration)

  return (
    <div>
      <Flex direction="column" gap="base" py="l">
        <SummaryRowLabel>{t("summary")}</SummaryRowLabel>
        <Text fw={500} fs="p4" lh={1.4} color={getToken("text.high")}>
          {isLoading ? (
            <Skeleton count={2} />
          ) : (
            <Trans
              t={t}
              i18nKey="trade:dca.summary.limitedBudget.description"
              context={isSellPriceValid ? "withPrice" : undefined}
              values={{
                sellAmount: t("currency", {
                  value: amountInPerTrade,
                  symbol: sellAsset.symbol,
                }),
                sellAmountDisplay: amountInPerTradeDisplay,
                buySymbol: buyAsset.symbol,
                frequency: t("interval", { value: duration / tranches }),
                duration: t("interval", { value: duration }),
              }}
            >
              <Text
                fw={600}
                as="span"
                color={getToken("text.tint.secondary")}
              />
            </Trans>
          )}
        </Text>
      </Flex>
      <SwapSectionSeparator sx={{ mt: "s" }} />
      <Summary separator={<SwapSectionSeparator />}>
        {!isNaN(endDate.valueOf()) && (
          <SwapSummaryRow
            label={t("trade:dca.summary.scheduleEnd")}
            content={t("date.datetime.short", { value: endDate })}
          />
        )}
      </Summary>
    </div>
  )
}
