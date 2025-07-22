import { AreaChart, Flex, ValueStats } from "@galacticcouncil/ui/components"
import { FC, useState } from "react"
import { useTranslation } from "react-i18next"
import { last } from "remeda"

import { useDisplayAssetPrice } from "@/components/AssetPrice"
import { ChartState } from "@/components/ChartState"
import { PeriodType, periodTypes } from "@/components/PeriodInput/PeriodInput"
import i18n from "@/i18n"
import {
  TradeChartInterval,
  TradeChartIntervalOptionType,
} from "@/modules/trade/swap/components/TradeChart/TradeChartInterval"
import {
  NetWorthData,
  useNetWorthData,
} from "@/modules/wallet/assets/Balances/NetWorth.data"
import { USDT_ASSET_ID } from "@/utils/consts"

const intervalOptions = (["all", ...periodTypes] as const).map<
  TradeChartIntervalOptionType<PeriodType | "all">
>((option) => ({
  key: option,
  label: i18n.t(`period.${option}`),
}))

export const NetWorth: FC = () => {
  const { t } = useTranslation(["wallet", "common"])

  const [interval, setInterval] = useState<PeriodType | "all">("all")
  const [crosshair, setCrosshair] = useState<NetWorthData | null>(null)

  const { balances, assetId, isLoading, isSuccess, isError } = useNetWorthData(
    interval === "all" ? null : interval,
  )

  const lastDataPoint = last(balances)
  const value = (crosshair ?? lastDataPoint)?.netWorth ?? 0

  const [netWorth] = useDisplayAssetPrice(assetId ?? USDT_ASSET_ID, value)

  const isEmpty = isSuccess && !balances.length
  const chartDisplayValue = !isEmpty && !isError ? netWorth : ""

  return (
    <Flex
      direction={["row", "column"]}
      align={["center", "flex-start"]}
      pb={[8, 0]}
    >
      <ValueStats
        alwaysWrap
        size="medium"
        label={t("balances.header.netWorth")}
        value={chartDisplayValue}
      />
      <Flex
        align="center"
        justify="center"
        sx={{ textAlign: "center" }}
        height="100%"
        width="100%"
      >
        <ChartState
          isSuccess={isSuccess}
          isError={isError}
          isLoading={isLoading}
          isEmpty={isEmpty}
        >
          <AreaChart
            data={balances}
            xAxisHidden
            yAxisHidden
            verticalGridHidden
            curveType="linear"
            onCrosshairMove={setCrosshair}
            config={{
              xAxisKey: "time",
              xAxisType: "time",
              yAxisFormatter: (value) => t("common:currency", { value }),
              tooltipType: "timeBottom",
              series: [
                {
                  label: t("balances.header.netWorth"),
                  key: "netWorth",
                },
              ],
            }}
          />
        </ChartState>
      </Flex>
      <TradeChartInterval
        options={intervalOptions}
        selectedOption={interval}
        onSelect={(option) => setInterval(option.key)}
      />
    </Flex>
  )
}
