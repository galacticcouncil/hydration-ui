import { getTimeFrameMillis } from "@galacticcouncil/main/src/components/TimeFrame/TimeFrame.utils"
import { TradeDcaOrder } from "@galacticcouncil/sdk-next/build/types/sor"
import {
  Box,
  Flex,
  Summary,
  SummaryRowLabel,
  SummaryRowValue,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken, px } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useFormContext } from "react-hook-form"
import { Trans, useTranslation } from "react-i18next"

import { SwapSummaryRow } from "@/modules/trade/swap/components/SwapSummaryRow"
import { DcaSummarySkeleton } from "@/modules/trade/swap/sections/DCA/DcaSummarySkeleton"
import { DcaFormValues } from "@/modules/trade/swap/sections/DCA/useDcaForm"
import { SwapSectionSeparator } from "@/modules/trade/swap/SwapPage.styled"
import { useAssets } from "@/providers/assetsProvider"
import { useTradeSettings } from "@/states/tradeSettings"
import { scaleHuman } from "@/utils/formatting"

type Props = {
  readonly order: TradeDcaOrder | undefined
  readonly isLoading: boolean
}

export const DcaSummary: FC<Props> = ({ order, isLoading }) => {
  const { t } = useTranslation(["common", "trade"])
  const { watch } = useFormContext<DcaFormValues>()
  const { getAsset } = useAssets()

  const {
    dca: { slippage },
  } = useTradeSettings()

  const buyAsset = order ? getAsset(order.assetOut) : undefined
  const sellAsset = order ? getAsset(order.assetIn) : undefined

  const now = Date.now()

  const durationTimeFrame = watch("duration")
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

  return (
    <>
      <SwapSectionSeparator />
      <div>
        <Flex direction="column" gap={8} py={8}>
          <SummaryRowLabel>{t("summary")}</SummaryRowLabel>
          <Text fw={500} fs="p2" lh={px(21)} color={getToken("text.high")}>
            <Trans
              t={t}
              i18nKey="trade:dca.summary.description"
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
          <SwapSummaryRow
            label={t("trade:dca.summary.slippage")}
            content={
              <SummaryRowValue color={getToken("colors.azureBlue.300")}>
                {t("percent", { value: slippage })}
              </SummaryRowValue>
            }
          />
        </Summary>
      </div>
    </>
  )
}
