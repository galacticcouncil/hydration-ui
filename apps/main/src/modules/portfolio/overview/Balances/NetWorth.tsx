import { timeFrameTypes } from "@galacticcouncil/main/src/components/TimeFrame/TimeFrame.utils"
import {
  AnimatedValue,
  Chart,
  ChartTimeTooltipBody,
  chartTimeTooltipPlacement,
  Flex,
  Grid,
  SValueStatsValue,
  ValueStats,
} from "@galacticcouncil/ui/components"
import { useTheme } from "@galacticcouncil/ui/theme"
import { pxToRem } from "@galacticcouncil/ui/utils"
import { USDT_ASSET_ID } from "@galacticcouncil/utils"
import { areaY, defineChart, lineY } from "@tanstack/charts"
import { scaleLinear } from "@tanstack/charts/scales/linear"
import { tooltip } from "@tanstack/charts/tooltip"
import Big from "big.js"
import { FC, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { last } from "remeda"

import { useDisplayAssetPrice } from "@/components/AssetPrice"
import { ChartState } from "@/components/ChartState"
import {
  ChartTimeRange,
  ChartTimeRangeOptionType,
} from "@/components/ChartTimeRange/ChartTimeRange"
import i18n from "@/i18n"
import { useNetWorthData } from "@/modules/portfolio/overview/Balances/NetWorth.data"

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

type NetWorthRow = {
  time: number
  netWorth: number
}

const GRADIENT_ID = "net-worth-gradient"
const CHART_HEIGHT = 180
const STROKE_WIDTH = 2
const TIME_TOOLTIP_MARGIN = 40

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

  const { themeProps } = useTheme()

  const [interval, setInterval] = useState<NetWorthTimeFrameType | "all">("all")
  const [crosshair, setCrosshair] = useState<number | null>(null)

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
  const value = crosshair ?? lastDataPoint?.netWorth ?? 0

  const isEmpty = isSuccess && !balances.length

  const definition = useMemo(() => {
    const rows = balances.map<NetWorthRow>(({ netWorth, time }) => ({
      netWorth,
      time: time.valueOf(),
    }))

    const color = themeProps.details.chart

    return defineChart({
      marks: [
        areaY(rows, {
          x: "time",
          y: "netWorth",
          fill: `url(#${GRADIENT_ID})`,
        }),
        lineY(rows, {
          x: "time",
          y: "netWorth",
          stroke: color,
          strokeWidth: STROKE_WIDTH,
        }),
      ],
      gradients: [
        {
          id: GRADIENT_ID,
          x1: 0,
          y1: 0,
          x2: 0,
          y2: 1,
          stops: [
            { offset: 0.05, color, opacity: 1 },
            { offset: 0.95, color, opacity: 0 },
          ],
        },
      ],
      x: { scale: scaleLinear, axis: false },
      y: { scale: scaleLinear, axis: false },
      margin: { bottom: TIME_TOOLTIP_MARGIN },
      focus: "group-x",
      tooltip: {
        use: tooltip,
        format: ({ yValue }) => t("common:currency", { value: yValue }),
        ...chartTimeTooltipPlacement("bottom"),
      },
    })
  }, [balances, themeProps, t])

  return (
    <Grid minWidth={pxToRem(320)} rowTemplate="auto 1fr" align="center">
      <NetWorthValue
        assetId={assetId}
        value={value}
        isEmpty={isEmpty}
        isError={isError}
      />
      <Flex
        align="center"
        justify="center"
        sx={{ textAlign: "center" }}
        height="100%"
        width="100%"
      >
        <ChartState isError={isError} isLoading={isLoading} isEmpty={isEmpty}>
          <Chart
            definition={definition}
            ariaLabel={t("balances.header.netWorth")}
            height={CHART_HEIGHT}
            onFocusChange={(point) =>
              setCrosshair(point?.datum?.netWorth ?? null)
            }
            renderTooltipBody={({ points }) => (
              <ChartTimeTooltipBody points={points} />
            )}
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

const NetWorthValue = ({
  assetId,
  value,
  isEmpty,
  isError,
}: {
  assetId?: string
  value: number
  isEmpty: boolean
  isError: boolean
}) => {
  const { t } = useTranslation(["wallet", "common"])
  const [_, { price }] = useDisplayAssetPrice(assetId ?? USDT_ASSET_ID, value)

  return (
    <ValueStats
      wrap={[false, false, true]}
      size="medium"
      label={t("balances.header.netWorth")}
      customValue={
        !isEmpty &&
        !isError && (
          <SValueStatsValue size="medium">
            <AnimatedValue
              value={Number(price)}
              format={(value) => t("common:currency", { value })}
            />
          </SValueStatsValue>
        )
      }
    />
  )
}
