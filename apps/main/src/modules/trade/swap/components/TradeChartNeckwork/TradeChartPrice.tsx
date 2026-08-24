import { PriceChangePeriod } from "@galacticcouncil/indexer/neckwork"
import {
  AnimatedValue,
  Chip,
  Text,
  Tooltip,
} from "@galacticcouncil/ui/components"
import React from "react"
import { useTranslation } from "react-i18next"

import { SChartPriceRow } from "@/modules/trade/swap/components/TradeChartNeckwork/TradeChartNeckwork.styled"

type TradeChartPriceProps = {
  readonly value: number
  readonly symbol: string
  readonly animationKey: string
  readonly isLiveValue: boolean
  readonly priceChange: number | null
  readonly changePeriod: PriceChangePeriod
  readonly onChangePeriodToggle: () => void
}

const formatPriceChange = (priceChange: number, periodLabel: string) => {
  const sign = priceChange < 0 ? "-" : "+"
  return `${sign}${Math.abs(priceChange).toFixed(2)}% / ${periodLabel}`
}

export const TradeChartPrice: React.FC<TradeChartPriceProps> = ({
  value,
  symbol,
  animationKey,
  isLiveValue,
  priceChange,
  changePeriod,
  onChangePeriodToggle,
}) => {
  const { t } = useTranslation()

  const periodLabel =
    changePeriod === "24h"
      ? t("chart.priceChange.24h")
      : t("chart.priceChange.7d")

  return (
    <SChartPriceRow gap="s">
      <Text
        fs={["p3", "p1"]}
        fw={600}
        whiteSpace="nowrap"
        fontVariantNumeric="tabular-nums"
      >
        <AnimatedValue
          key={animationKey}
          value={value}
          valueFlash={isLiveValue}
          format={(value) => t("number", { value })}
        />{" "}
        {symbol}
      </Text>
      {priceChange !== null && (
        <Tooltip
          text={t("chart.priceChange.tooltip", { period: periodLabel })}
          size="small"
          side="top"
          asChild
        >
          <Chip
            as="button"
            rounded
            size="small"
            variant={priceChange < 0 ? "red" : "green"}
            sx={{
              cursor: "pointer",
              whiteSpace: "nowrap",
              fontVariantNumeric: "tabular-nums",
            }}
            onClick={onChangePeriodToggle}
          >
            {formatPriceChange(priceChange, periodLabel)}
          </Chip>
        </Tooltip>
      )}
    </SChartPriceRow>
  )
}
