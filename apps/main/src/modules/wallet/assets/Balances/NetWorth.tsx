import { timeFrameTypes } from "@galacticcouncil/main/src/components/TimeFrame/TimeFrame.utils"
import {
  AreaChart,
  Flex,
  Grid,
  ValueStats,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { USDT_ASSET_ID } from "@galacticcouncil/utils"
import Big from "big.js"
import { FC, useState } from "react"
import { useTranslation } from "react-i18next"
import { last } from "remeda"

import { useDisplayAssetPrice } from "@/components/AssetPrice"
import { ChartState } from "@/components/ChartState"
import {
  ChartTimeRange,
  ChartTimeRangeOptionType,
} from "@/components/ChartTimeRange/ChartTimeRange"
import i18n from "@/i18n"
import {
  NetWorthData,
  useNetWorthData,
} from "@/modules/wallet/assets/Balances/NetWorth.data"

const netWorthTimeFrameTypes = timeFrameTypes.filter(
  (type) => type !== "minute",
)

export type NetWorthTimeFrameType = (typeof netWorthTimeFrameTypes)[number]

const intervalOptions = (["all", ...netWorthTimeFrameTypes] as const).map<
  ChartTimeRangeOptionType<NetWorthTimeFrameType | "all">
>((option) => ({
  key: option,
  label: i18n.t(`chart.timeFrame.${option}`),
}))

type Props = {
  readonly assetBalance: string
  readonly liquidityBalance: string
  readonly borrowed: string
  readonly isCurrentLoading: boolean
}

export const NetWorth: FC<Props> = ({
  assetBalance,
  liquidityBalance,
  borrowed,
  isCurrentLoading,
}) => {
  const { t } = useTranslation(["wallet", "common"])
  const { isLaptop } = useBreakpoints()
  const [interval, setInterval] = useState<NetWorthTimeFrameType | "all">("all")
  const [crosshair, setCrosshair] = useState<NetWorthData | null>(null)

  const currentNetWorth = Big(assetBalance || "0")
    .plus(liquidityBalance || "0")
    .minus(borrowed || "0")
    .toString()

  const { balances, assetId, isLoading, isSuccess, isError } = useNetWorthData(
    interval === "all" ? null : interval,
    currentNetWorth,
    isCurrentLoading,
  )

  const lastDataPoint = last(balances)
  const value = (crosshair ?? lastDataPoint)?.netWorth ?? 0

  const [netWorth] = useDisplayAssetPrice(assetId ?? USDT_ASSET_ID, value)

  const isEmpty = isSuccess && !balances.length
  const chartDisplayValue = !isEmpty && !isError ? netWorth : ""

  return (
    <Grid minWidth={320} rowTemplate="auto 1fr" align="center">
      <ValueStats
        wrap={isLaptop}
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
        <ChartState isError={isError} isLoading={isLoading} isEmpty={isEmpty}>
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
      <ChartTimeRange
        sx={{ gridColumn: "1/-1", justifySelf: "center" }}
        options={intervalOptions}
        selectedOption={interval}
        onSelect={(option) => setInterval(option.key)}
      />
    </Grid>
  )
}
