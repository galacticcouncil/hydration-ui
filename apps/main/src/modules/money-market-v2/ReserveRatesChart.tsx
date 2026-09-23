import { useMoneyMarket } from "@galacticcouncil/money-market-v2/react"
import type { ReserveSummary } from "@galacticcouncil/money-market-v2/types"
import {
  Box,
  Button,
  Chart,
  ChartLegendTooltipBody,
  Flex,
  Text,
} from "@galacticcouncil/ui/components"
import { useTheme } from "@galacticcouncil/ui/theme"
import { getToken } from "@galacticcouncil/ui/utils"
import { defineChart, lineY, ruleY, text } from "@tanstack/charts"
import { decorative } from "@tanstack/charts/mark/decorative"
import { scaleLinear } from "@tanstack/charts/scales/linear"
import { tooltip } from "@tanstack/charts/tooltip"
import { useQuery } from "@tanstack/react-query"
import { FC, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

import { ChartState } from "@/components/ChartState"
import { ChartTimeRange } from "@/components/ChartTimeRange/ChartTimeRange"
import {
  ApyChartTimeRangeOption,
  apyChartTimeRangeOptions,
} from "@/modules/borrow/reserve/components/ApyChart.utils"
import {
  RatePoint,
  reserveRatesQuery,
} from "@/modules/money-market-v2/reserveRates"

type SeriesKey = "supply" | "borrow"

type Series = {
  key: SeriesKey
  label: string
  color: string
  data: RatePoint[]
  average: number | null
}

const STROKE_WIDTH = 2
const AVERAGE_LABEL_OFFSET = -8

const average = (data: RatePoint[]) =>
  data.length ? data.reduce((sum, p) => sum + p.rate, 0) / data.length : null

/**
 * Supply and variable borrow APR history on one chart. Each legend entry
 * toggles its series and carries the series' average over the range, which is
 * also drawn as a dashed line.
 */
export const ReserveRatesChart: FC<{ reserve: ReserveSummary }> = ({
  reserve,
}) => {
  const { t } = useTranslation()
  const { themeProps } = useTheme()
  const { market } = useMoneyMarket()
  const [timeRange, setTimeRange] = useState<ApyChartTimeRangeOption>("1M")
  const [hidden, setHidden] = useState<ReadonlySet<SeriesKey>>(new Set())

  const { data, isLoading, isError } = useQuery(
    reserveRatesQuery(
      market.addresses.POOL,
      reserve.underlyingAsset,
      timeRange,
    ),
  )

  const series = useMemo((): Series[] => {
    const supply = data?.supply ?? []
    const borrow = data?.borrow ?? []

    return [
      {
        key: "supply" as const,
        label: "Supply APR",
        color: themeProps.accents.info.onPrimary,
        data: supply,
        average: average(supply),
      },
      {
        key: "borrow" as const,
        label: "Borrow APR",
        color: themeProps.colors.basePalette.coralPink,
        data: borrow,
        average: average(borrow),
      },
    ].filter((s) => s.key === "supply" || reserve.borrowingEnabled)
  }, [data, themeProps, reserve.borrowingEnabled])

  const visible = useMemo(
    () => series.filter((s) => !hidden.has(s.key)),
    [series, hidden],
  )

  const toggle = (key: SeriesKey) =>
    setHidden((current) => {
      const next = new Set(current)
      if (!next.delete(key)) next.add(key)
      // the last visible series stays on, or the chart would be empty
      return next.size === series.length ? current : next
    })

  const definition = useMemo(
    () =>
      defineChart({
        marks: visible.flatMap((s, index) => {
          const avg = s.average ?? 0
          // the line snaps to a half-percent step, the label keeps the exact value
          const avgLine = Math.round(avg * 2) / 2
          // one label on each side, so two close averages do not overlap
          const atEnd = index % 2 === 1
          const edge = atEnd ? s.data.at(-1) : s.data[0]

          return [
            lineY(s.data, {
              id: s.key,
              x: "timestamp",
              y: "rate",
              stroke: s.color,
              strokeWidth: STROKE_WIDTH,
            }),
            decorative(
              ruleY([avgLine], { stroke: s.color, strokeDasharray: "6 6" }),
            ),
            decorative(
              text(
                [
                  {
                    timestamp: edge?.timestamp ?? 0,
                    rate: avgLine,
                    label: `${t("avg")} ${t("percent", { value: avg })}`,
                  },
                ],
                {
                  x: "timestamp",
                  y: "rate",
                  text: "label",
                  fontSize: 12,
                  fontWeight: 600,
                  anchor: atEnd ? "end" : "start",
                  dx: atEnd ? -5 : 5,
                  dy: AVERAGE_LABEL_OFFSET,
                  fill: s.color,
                },
              ),
            ),
          ]
        }),
        x: {
          scale: scaleLinear,
          axis: {
            line: false,
            ticks: {
              size: 0,
              padding: 8,
              format: (value) => t("date.day", { value: new Date(value) }),
            },
          },
        },
        y: {
          scale: scaleLinear,
          grid: true,
          axis: {
            line: false,
            ticks: {
              size: 0,
              padding: 8,
              format: (value) => t("percent", { value }),
            },
          },
        },
        focus: "group-x",
        tooltip: { use: tooltip, sticky: false },
      }),
    [visible, t],
  )

  const labelOf = (markId: string | undefined) =>
    series.find((s) => s.key === markId)?.label

  return (
    <Flex direction="column" gap="base">
      <Flex justify="space-between" align="center" gap="base" wrap>
        <Flex gap="s" wrap>
          {series.map((s) => {
            const isActive = !hidden.has(s.key)
            return (
              <Button
                key={s.key}
                size="small"
                sx={{ px: "m" }}
                variant={isActive ? "secondary" : "restSubtle"}
                outline={!isActive}
                onClick={() => toggle(s.key)}
              >
                <Box
                  width="2xs"
                  height="2xs"
                  borderRadius="full"
                  bg={s.color}
                  sx={{ opacity: isActive ? 1 : 0.3 }}
                />
                <Text
                  fs="p6"
                  fw={500}
                  color={isActive ? undefined : getToken("text.high")}
                >
                  {s.label}
                </Text>
                <Text fs="p6" fw={500}>
                  {s.average === null
                    ? "—"
                    : `${t("avg")} ${t("percent", { value: s.average })}`}
                </Text>
              </Button>
            )
          })}
        </Flex>
        <ChartTimeRange
          options={apyChartTimeRangeOptions}
          selectedOption={timeRange}
          onSelect={setTimeRange}
        />
      </Flex>
      <ChartState
        sx={{ height: [150, 250] }}
        isError={isError}
        isLoading={isLoading}
        isEmpty={visible.every((s) => !s.data.length)}
      >
        <Chart
          definition={definition}
          ariaLabel="Supply and borrow APR history"
          height={[150, 250]}
          renderTooltipBody={({ points }) => (
            <ChartLegendTooltipBody
              points={points.filter(({ markId }) => !!labelOf(markId))}
              formatLabel={(value) =>
                t("date.daytime", { value: new Date(Number(value)) })
              }
              formatSeriesLabel={({ markId }) => labelOf(markId)}
              formatValue={({ yValue }) => t("percent", { value: yValue })}
            />
          )}
        />
      </ChartState>
    </Flex>
  )
}
