import { timeFrameTypes } from "@galacticcouncil/main/src/components/TimeFrame/TimeFrame.utils"
import {
  Box,
  ChartValues,
  Flex,
  TradingViewChart,
  TradingViewChartRef,
} from "@galacticcouncil/ui/components"
import { BaselineChartData } from "@galacticcouncil/ui/components/TradingViewChart/utils"
import { RefObject, useState } from "react"
import { useTranslation } from "react-i18next"
import { last, prop } from "remeda"

import { ChartState } from "@/components/ChartState"
import {
  ChartTimeRange,
  ChartTimeRangeOptionType,
} from "@/components/ChartTimeRange/ChartTimeRange"
import i18n from "@/i18n"
import { useTradeChartData } from "@/modules/trade/swap/components/TradeChart/TradeChart.data"
import { useDisplayAssetStore } from "@/states/displayAsset"

const chartTimeFrameTypes = timeFrameTypes.filter((type) => type !== "minute")

export type PoolChartTimeFrameType = (typeof chartTimeFrameTypes)[number]

export const intervalOptions = ([...chartTimeFrameTypes, "all"] as const).map<
  ChartTimeRangeOptionType<PoolChartTimeFrameType | "all">
>((option) => ({
  key: option,
  label: i18n.t(`chart.timeFrame.${option}`),
}))

export const PoolChart = ({
  chartRef,
  assetId,
  height,
  interval,
  setInterval,
  isEmptyData = false,
}: {
  chartRef: RefObject<TradingViewChartRef | null>
  assetId: string
  height: number
  interval: PoolChartTimeFrameType | "all"
  setInterval: (interval: PoolChartTimeFrameType | "all") => void
  isEmptyData?: boolean
}) => {
  const { t } = useTranslation()
  const stableCoinId = useDisplayAssetStore(prop("stableCoinId"))
  const [crosshair, setCrosshair] = useState<BaselineChartData | null>(null)

  const { prices, isLoading, isSuccess, isError } = useTradeChartData({
    assetInId: isEmptyData ? "" : (stableCoinId ?? ""),
    assetOutId: assetId,
    timeFrame: interval === "all" ? null : interval,
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
          onSelect={(option) => {
            setInterval(option.key)
          }}
          sx={{ display: ["none", "flex"] }}
        />
      </Flex>
      <ChartState
        sx={{ height }}
        isError={isEmptyData ? false : isError}
        isLoading={isEmptyData ? false : isLoading}
        isEmpty={isEmptyData ? true : isEmpty}
      >
        <TradingViewChart
          ref={chartRef}
          height={height}
          data={prices}
          hidePriceIndicator
          onCrosshairMove={setCrosshair}
        />
      </ChartState>
    </Flex>
  )
}
