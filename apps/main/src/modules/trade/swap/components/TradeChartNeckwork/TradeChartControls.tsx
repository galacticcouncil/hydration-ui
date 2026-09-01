import { CANDLE_BUCKETS, CandleBucket } from "@galacticcouncil/indexer/neckwork"
import { ArrowLeftRight } from "@galacticcouncil/ui/assets/icons"
import { Box, Flex, Icon, Tooltip } from "@galacticcouncil/ui/components"
import { ToggleGroup, ToggleGroupItem } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { CandlestickChart, LineChart } from "lucide-react"
import React from "react"
import { useTranslation } from "react-i18next"

import {
  ChartTimeRange,
  ChartTimeRangeOptionType,
} from "@/components/ChartTimeRange/ChartTimeRange"
import { ChartTimeRangeDropdown } from "@/components/ChartTimeRange/ChartTimeRangeDropdown"
import i18n from "@/i18n"
import {
  SChartControls,
  SChartIntervals,
  SChartIntervalsCompact,
  SInvertButton,
  SInvertPair,
} from "@/modules/trade/swap/components/TradeChartNeckwork/TradeChartNeckwork.styled"
import { TRADE_CHART_TYPES } from "@/modules/trade/swap/components/TradeChartNeckwork/TradeChartNeckwork.utils"
import { useTradeChartSettings } from "@/states/tradeSettings"

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
  readonly showPairControls?: boolean
}

export const TradeChartControls: React.FC<TradeChartControlsProps> = ({
  pair,
  isInverted,
  onInvert,
  showPairControls = true,
}) => {
  const { t } = useTranslation()
  const { interval, chartType, setInterval, setChartType } =
    useTradeChartSettings()

  const invertLabel = t("chart.invert", { pair })

  return (
    <SChartControls gap="s">
      {showPairControls && (
        <Flex align="center" gap="s">
          <SInvertButton
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
            <SInvertPair>{pair}</SInvertPair>
          </SInvertButton>
          <ToggleGroup
            type="single"
            size="small"
            value={chartType}
            onValueChange={(value) => value && setChartType(value)}
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
      )}

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
