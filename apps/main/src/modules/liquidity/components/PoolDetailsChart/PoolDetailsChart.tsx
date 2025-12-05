import {
  Box,
  ChartValues,
  Flex,
  TradingViewChart,
} from "@galacticcouncil/ui/components"
import { BaselineChartData } from "@galacticcouncil/ui/components/TradingViewChart/utils"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { last, prop } from "remeda"

import { ChartState } from "@/components/ChartState"
import {
  ChartTimeRange,
  ChartTimeRangeOptionType,
} from "@/components/ChartTimeRange/ChartTimeRange"
import { periodTypes } from "@/components/PeriodInput/PeriodInput.utils"
import i18n from "@/i18n"
import { TradeChartPeriodType } from "@/modules/trade/swap/components/TradeChart/TradeChart"
import { useTradeChartData } from "@/modules/trade/swap/components/TradeChart/TradeChart.data"
import { useDisplayAssetStore } from "@/states/displayAsset"

const chartPeriodTypes = periodTypes.filter(
  (periodType) => periodType !== "minute",
)

export const intervalOptions = (["all", ...chartPeriodTypes] as const).map<
  ChartTimeRangeOptionType<TradeChartPeriodType | "all">
>((option) => ({
  key: option,
  label: i18n.t(`chart.period.${option}`),
}))

export const PoolChart = ({
  assetId,
  height,
  interval,
  setInterval,
}: {
  assetId: string
  height: number
  interval: TradeChartPeriodType | "all"
  setInterval: (interval: TradeChartPeriodType | "all") => void
}) => {
  const { t } = useTranslation()
  const stableCoinId = useDisplayAssetStore(prop("stableCoinId"))
  const [crosshair, setCrosshair] = useState<BaselineChartData | null>(null)

  const { prices, isLoading, isSuccess, isError } = useTradeChartData({
    assetInId: stableCoinId ?? "",
    assetOutId: assetId,
    period: interval === "all" ? null : interval,
  })

  const isEmpty = isSuccess && !prices.length

  const lastDataPoint = last(prices)
  const value = crosshair?.value ?? lastDataPoint?.close ?? 0
  const volume = crosshair?.volume ?? lastDataPoint?.volume ?? 0

  const chartDisplayValue =
    !isEmpty && !isError ? (
      <Box>
        <Box>
          {t("price")}: {t("currency", { value: value })}
        </Box>
        <Box visibility={volume > 0 ? "visible" : "hidden"}>
          {t("vol")}: {t("currency", { value: volume })}
        </Box>
      </Box>
    ) : undefined

  return (
    <Flex direction="column" justify="space-between" height="100%">
      <Flex align="center" justify="space-between">
        <ChartValues
          displayValue={chartDisplayValue}
          isLoading={isLoading}
          sx={{ height: 36 }}
        />
        <ChartTimeRange
          options={intervalOptions}
          selectedOption={interval}
          onSelect={(option) => setInterval(option.key)}
          sx={{ display: ["none", "flex"] }}
        />
      </Flex>
      <ChartState
        sx={{ height }}
        isError={isError}
        isLoading={isLoading}
        isEmpty={isEmpty}
      >
        <TradingViewChart
          height={height}
          data={prices}
          hidePriceIndicator
          onCrosshairMove={setCrosshair}
        />
      </ChartState>
    </Flex>
  )
}
