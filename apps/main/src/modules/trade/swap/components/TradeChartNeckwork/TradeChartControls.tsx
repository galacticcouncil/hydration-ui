import { CANDLE_BUCKETS, CandleBucket } from "@galacticcouncil/indexer/neckwork"
import { ArrowLeftRight } from "@galacticcouncil/ui/assets/icons"
import { Box, Flex, Icon, Tooltip } from "@galacticcouncil/ui/components"
import { ToggleGroup, ToggleGroupItem } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { CandlestickChart, LineChart } from "lucide-react"
import React from "react"
import { useTranslation } from "react-i18next"

import {
  ChartTimeRange,
  ChartTimeRangeOptionType,
} from "@/components/ChartTimeRange/ChartTimeRange"
import { ChartTimeRangeDropdown } from "@/components/ChartTimeRange/ChartTimeRangeDropdown"
import i18n from "@/i18n"
import { SChartInvertButton } from "@/modules/trade/swap/components/TradeChart/TradeChart.styled"
import {
  SChartControls,
  SChartIntervals,
  SChartIntervalsCompact,
} from "@/modules/trade/swap/components/TradeChartNeckwork/TradeChartNeckwork.styled"
import { TRADE_CHART_TYPES } from "@/modules/trade/swap/components/TradeChartNeckwork/TradeChartNeckwork.utils"

const intervalOptions = CANDLE_BUCKETS.map<
  ChartTimeRangeOptionType<CandleBucket>
>((bucket) => ({
  key: bucket,
  label: i18n.t(`chart.interval.${bucket}`),
}))

const chartTypeIcons = {
  candles: CandlestickChart,
  line: LineChart,
}

type TradeChartControlsProps = {
  readonly pair: string
  readonly isInverted: boolean
  readonly onInvert: () => void
}

export const TradeChartControls: React.FC<TradeChartControlsProps> = ({
  pair,
  isInverted,
  onInvert,
}) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const search = useSearch({ from: "/trade/_history" })
  const { interval, chartType } = search

  const invertLabel = t("chart.invert", { pair })

  const setInterval = (key: CandleBucket) =>
    navigate({
      to: ".",
      search: { ...search, interval: key },
      resetScroll: false,
    })

  return (
    <SChartControls gap="s">
      <Flex align="center" gap="s">
        <Tooltip text={invertLabel} size="small" side="top" asChild>
          <Box as="span" sx={{ display: "flex" }}>
            <SChartInvertButton
              size="small"
              variant="tertiary"
              outline
              aria-label={invertLabel}
              onClick={onInvert}
            >
              <Icon
                component={ArrowLeftRight}
                size="s"
                sx={{
                  transform: isInverted ? "scaleX(-1)" : "scaleX(1)",
                  transition: getToken("transitions.transform"),
                }}
              />
            </SChartInvertButton>
          </Box>
        </Tooltip>
        <ToggleGroup
          type="single"
          size="small"
          value={chartType}
          onValueChange={(value) =>
            value &&
            navigate({
              to: ".",
              search: { ...search, chartType: value },
              resetScroll: false,
            })
          }
        >
          {TRADE_CHART_TYPES.map((type) => (
            <Tooltip
              key={type}
              text={t(`chart.chartType.${type}`)}
              size="small"
              asChild
              side="top"
            >
              <Box as="span" sx={{ display: "flex" }}>
                <ToggleGroupItem
                  value={type}
                  aria-label={t(`chart.chartType.${type}`)}
                >
                  <Icon component={chartTypeIcons[type]} size="s" />
                </ToggleGroupItem>
              </Box>
            </Tooltip>
          ))}
        </ToggleGroup>
      </Flex>

      <SChartIntervals>
        <ChartTimeRange
          options={intervalOptions}
          selectedOption={interval}
          onSelect={(option) => setInterval(option.key)}
        />
      </SChartIntervals>
      <SChartIntervalsCompact>
        <ChartTimeRangeDropdown
          size="small"
          options={intervalOptions}
          selectedOption={interval}
          onSelect={setInterval}
        />
      </SChartIntervalsCompact>
    </SChartControls>
  )
}
