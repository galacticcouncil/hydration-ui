import { HealthFactorChange } from "@galacticcouncil/money-market/components"
import { TradeDcaOrder } from "@galacticcouncil/sdk-next/build/types/sor"
import {
  Box,
  Flex,
  Summary,
  SummaryRowLabel,
  SummaryRowValue,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import Big from "big.js"
import { formatDistanceToNow, formatDistanceToNowStrict } from "date-fns"
import { FC } from "react"
import { useFormContext } from "react-hook-form"
import { Trans, useTranslation } from "react-i18next"

import { HealthFactorResult } from "@/api/aave"
import { useDisplayAssetPrice } from "@/components/AssetPrice"
import { SwapSummaryRow } from "@/modules/trade/swap/components/SwapSummaryRow"
import { DcaSummarySkeleton } from "@/modules/trade/swap/sections/DCA/DcaSummarySkeleton"
import { DcaFormValues } from "@/modules/trade/swap/sections/DCA/useDcaForm"
import { SwapSectionSeparator } from "@/modules/trade/swap/SwapPage.styled"
import { useAssets } from "@/providers/assetsProvider"
import { useTradeSettings } from "@/states/tradeSettings"
import { scaleHuman } from "@/utils/formatting"

type Props = {
  readonly order: TradeDcaOrder | undefined
  readonly healthFactor: HealthFactorResult | undefined
  readonly isLoading: boolean
}

export const DcaSummary: FC<Props> = ({ order, healthFactor, isLoading }) => {
  const { t } = useTranslation(["common", "trade"])
  const { formState } = useFormContext<DcaFormValues>()
  const { getAsset } = useAssets()

  const {
    dca: { slippage },
  } = useTradeSettings()

  const buyAsset = getAsset(order?.assetOut ?? 0)
  const sellAsset = getAsset(order?.assetIn ?? 0)
  const tradeFee = scaleHuman(order?.tradeFee ?? 0n, buyAsset?.decimals ?? 0)
  const buyAmount = scaleHuman(order?.amountOut ?? 0n, buyAsset?.decimals ?? 0)
  const tradeFeePct = Big(buyAmount).gt(0)
    ? Big(tradeFee).div(buyAmount).times(100).toNumber()
    : 0

  const [tradeFeeDisplay] = useDisplayAssetPrice(buyAsset?.id ?? "0", tradeFee)

  if (isLoading) {
    return (
      <>
        <SwapSectionSeparator />
        <DcaSummarySkeleton />
      </>
    )
  }

  if (
    !order ||
    !sellAsset ||
    !buyAsset ||
    // TODO check
    (!formState.isValid && false)
  ) {
    return null
  }

  const now = Date.now()
  const duration = order.tradeCount * order.frequency

  const sellAmount = scaleHuman(order.amountIn, sellAsset.decimals)

  return (
    <>
      <SwapSectionSeparator />
      <div>
        <Flex direction="column" gap={8} py={8}>
          <SummaryRowLabel>{t("summary")}</SummaryRowLabel>
          <Text
            display="flex"
            gap={3}
            fw={500}
            fs="p4"
            lh={1}
            color={getToken("text.high")}
          >
            <Trans
              t={t}
              i18nKey="trade:dca.summary.description"
              values={{
                sellAmount: t("currency", {
                  value: sellAmount,
                  symbol: sellAsset.symbol,
                }),
                buySymbol: buyAsset.symbol,
                timeframe: formatDistanceToNow(now + order.frequency),
                period: formatDistanceToNowStrict(now + duration),
              }}
            >
              <Box color={getToken("colors.azureBlue.300")} />
            </Trans>
          </Text>
        </Flex>
        <SwapSectionSeparator sx={{ mt: 9 }} />
        <Summary separator={<SwapSectionSeparator />}>
          <SwapSummaryRow
            label={t("trade:dca.summary.scheduleEnd")}
            content={t("date.datetime.short", {
              value: new Date(now + duration),
            })}
          />
          <SwapSummaryRow
            label={t("trade:dca.summary.slippage")}
            content={
              <SummaryRowValue color={getToken("colors.azureBlue.300")}>
                {t("percent", { value: slippage })}
              </SummaryRowValue>
            }
          />
          <SwapSummaryRow
            label={t("trade:dca.summary.tradeFee")}
            content={`${tradeFeeDisplay} (${t("percent", { value: tradeFeePct })})`}
            tooltip={t("trade:dca.summary.tradeFee.tooltip")}
          />
          {healthFactor?.isSignificantChange && (
            <SwapSummaryRow
              label={t("healthFactor")}
              content={
                <HealthFactorChange
                  healthFactor={healthFactor.current}
                  futureHealthFactor={healthFactor.future}
                />
              }
            />
          )}
        </Summary>
      </div>
    </>
  )
}
