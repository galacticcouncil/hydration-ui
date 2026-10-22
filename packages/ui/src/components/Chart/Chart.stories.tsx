import type { Meta, StoryObj } from "@storybook/react-vite"
import {
  areaY,
  barY,
  defineChart,
  dot,
  lineY,
  ruleX,
  stack,
  text,
} from "@tanstack/charts"
import { scaleBand } from "@tanstack/charts/scales/band"
import { scaleLinear } from "@tanstack/charts/scales/linear"
import { tooltip } from "@tanstack/charts/tooltip"
import { fold } from "@tanstack/charts/transform/fold"
import { useMemo } from "react"

import { useTheme } from "@/theme"

import { Chart, chartColorScale } from "./Chart"
import {
  ChartLegendTooltipBody,
  ChartTimeTooltipBody,
  chartTimeTooltipPlacement,
} from "./ChartTooltip"
import { PieChart } from "./PieChart"
import {
  dateFormatter,
  MOCK_CATEGORY_DATA,
  MOCK_CURVE_DATA,
  MOCK_TIME_DATA,
} from "./utils"

type Story = StoryObj<typeof Chart>

export default {
  component: Chart,
} as Meta<typeof Chart>

const CHART_HEIGHT = 300
const STROKE_WIDTH = 2.5
const DOT_RADIUS = 6

const AreaWithGradientChart = () => {
  const { themeProps } = useTheme()

  const definition = useMemo(() => {
    const color = themeProps.details.chart

    return defineChart({
      marks: [
        areaY(MOCK_TIME_DATA, {
          x: "timestamp",
          y: "value",
          fill: "url(#gradient)",
        }),
        lineY(MOCK_TIME_DATA, {
          x: "timestamp",
          y: "value",
          stroke: color,
          strokeWidth: STROKE_WIDTH,
        }),
      ],
      gradients: [
        {
          id: "gradient",
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
      x: {
        scale: scaleLinear,
        axis: {
          line: false,
          ticks: { size: 0, padding: 8, format: dateFormatter.format },
        },
      },
      y: {
        scale: scaleLinear,
        grid: true,
        axis: { line: false, ticks: { size: 0 } },
      },
    })
  }, [themeProps])

  return (
    <Chart
      definition={definition}
      ariaLabel="Net worth over time"
      height={CHART_HEIGHT}
    />
  )
}

export const AreaWithGradient: Story = {
  render: () => <AreaWithGradientChart />,
}

const OPTIMAL = 300
const CURRENT = 600

const AreaWithReferenceLinesChart = () => {
  const { themeProps } = useTheme()

  const definition = useMemo(() => {
    const topValue = Math.max(...MOCK_CURVE_DATA.map(({ y }) => y))

    const labels = [
      {
        x: OPTIMAL + 5,
        y: topValue,
        label: "Optimal 30%",
        anchor: "start" as const,
      },
      {
        x: CURRENT - 5,
        y: topValue,
        label: "Current 60%",
        anchor: "end" as const,
      },
    ]

    return defineChart({
      marks: [
        areaY(MOCK_CURVE_DATA, {
          x: "x",
          y: "y",
          fill: "none",
        }),
        lineY(MOCK_CURVE_DATA, {
          x: "x",
          y: "y",
          stroke: themeProps.accents.success.emphasis,
          strokeWidth: STROKE_WIDTH,
        }),
        ruleX([OPTIMAL, CURRENT], {
          stroke: themeProps.text.tint.quart,
          strokeDasharray: "4 2",
        }),
        text(labels, {
          x: "x",
          y: "y",
          text: "label",
          fontSize: 12,
          anchor: (row) => row.anchor,
          dy: 10,
          fill: themeProps.text.tint.quart,
        }),
      ],
      x: { scale: scaleLinear, axis: { line: false, ticks: { size: 0 } } },
      y: {
        scale: scaleLinear,
        grid: true,
        axis: { line: false, ticks: { size: 0 } },
      },
    })
  }, [themeProps])

  return (
    <Chart
      definition={definition}
      ariaLabel="Interest rate model"
      height={CHART_HEIGHT}
    />
  )
}

export const AreaWithReferenceLines: Story = {
  render: () => <AreaWithReferenceLinesChart />,
}

const AreaWithLayeredDotsChart = () => {
  const { themeProps } = useTheme()

  const definition = useMemo(
    () =>
      defineChart({
        marks: [
          areaY(MOCK_CURVE_DATA, {
            x: "x",
            y: "y",
            fill: "none",
          }),
          lineY(MOCK_CURVE_DATA, {
            x: "x",
            y: "y",
            stroke: themeProps.details.chart,
            strokeWidth: STROKE_WIDTH,
          }),
          dot(
            MOCK_CURVE_DATA.filter(({ current }) => current),
            { x: "x", y: "y", r: DOT_RADIUS, fill: themeProps.text.tint.quart },
          ),
          dot(
            MOCK_CURVE_DATA.filter(({ currentSecondary }) => currentSecondary),
            {
              x: "x",
              y: "y",
              r: DOT_RADIUS,
              fill: themeProps.text.tint.quart,
            },
          ),
        ],
        x: { scale: scaleLinear, axis: { line: false, ticks: { size: 0 } } },
        y: {
          scale: scaleLinear,
          grid: true,
          axis: { line: false, ticks: { size: 0 } },
        },
      }),
    [themeProps],
  )

  return (
    <Chart
      definition={definition}
      ariaLabel="Rewards curve"
      height={CHART_HEIGHT}
    />
  )
}

export const AreaWithLayeredDots: Story = {
  render: () => <AreaWithLayeredDotsChart />,
}

const AreaWithTimeTooltipChart = () => {
  const { themeProps } = useTheme()

  const definition = useMemo(
    () =>
      defineChart({
        marks: [
          areaY(MOCK_TIME_DATA, {
            x: "timestamp",
            y: "value",
            fill: "none",
          }),
          lineY(MOCK_TIME_DATA, {
            x: "timestamp",
            y: "value",
            stroke: themeProps.details.chart,
            strokeWidth: STROKE_WIDTH,
          }),
        ],
        x: { scale: scaleLinear, axis: false },
        y: { scale: scaleLinear, axis: false },
        margin: { bottom: 40 },
        tooltip: {
          use: tooltip,
          ...chartTimeTooltipPlacement("bottom"),
        },
      }),
    [themeProps],
  )

  return (
    <Chart
      definition={definition}
      ariaLabel="Net worth with a time crosshair"
      height={CHART_HEIGHT}
      renderTooltipBody={({ points }) => (
        <ChartTimeTooltipBody points={points} />
      )}
    />
  )
}

export const AreaWithTimeTooltip: Story = {
  render: () => <AreaWithTimeTooltipChart />,
}

const SERIES = ["desktop", "mobile"] as const
const SERIES_COLORS = {
  desktop: "colors.skyBlue.700",
  mobile: "colors.lavender.700",
} as const

const BAR_RADIUS = 4

const BasicBarsChart = () => {
  const { themeProps } = useTheme()

  const definition = useMemo(
    () =>
      defineChart({
        marks: [
          barY(MOCK_CATEGORY_DATA, {
            x: "month",
            y: "desktop",
            fill: themeProps.details.chart,
            radius: BAR_RADIUS,
          }),
        ],
        x: {
          scale: () => scaleBand<string>().padding(0.3),
          axis: { line: false, ticks: { size: 0 } },
        },
        y: {
          scale: scaleLinear,
          grid: true,
          axis: { line: false, ticks: { size: 0 } },
        },
        focus: "group-x",
        tooltip: {
          use: tooltip,
          anchor: { x: "value", y: "plot-top" },
          placement: "top",
        },
      }),
    [themeProps],
  )

  return (
    <Chart
      definition={definition}
      ariaLabel="Desktop visitors per month"
      height={CHART_HEIGHT}
      renderTooltipBody={({ points }) => (
        <ChartLegendTooltipBody label="Visitors" points={points} />
      )}
    />
  )
}

export const Bars: Story = {
  render: () => <BasicBarsChart />,
}

type StackedRow = {
  month: string
  series: string
  value: number
}

const StackedBarsChart = () => {
  const { getToken } = useTheme()

  const definition = useMemo(() => {
    const rows = fold(MOCK_CATEGORY_DATA, {
      fields: [...SERIES],
      as: { key: "series", value: "value" },
    }).map<StackedRow>(({ month, series, value }) => ({
      month: String(month),
      series,
      value: Number(value),
    }))

    return defineChart({
      marks: [
        barY(rows, {
          x: "month",
          y: "value",
          color: "series",
          layout: stack({ order: [...SERIES] }),
          radius: BAR_RADIUS,
        }),
      ],
      x: {
        scale: () => scaleBand<string>().padding(0.3),
        axis: { line: false, ticks: { size: 0 } },
      },
      y: {
        scale: scaleLinear,
        grid: true,
        axis: { line: false, ticks: { size: 0 } },
      },
      color: chartColorScale(SERIES_COLORS, getToken),
      focus: "group-x",
      tooltip: {
        use: tooltip,
        sort: "color-domain",
        anchor: { x: "value", y: "plot-top" },
        placement: "top",
      },
    })
  }, [getToken])

  return (
    <Chart
      definition={definition}
      ariaLabel="Visitors per month by device"
      height={CHART_HEIGHT}
      renderTooltipBody={({ points }) => (
        <ChartLegendTooltipBody label="Visitors" points={points} />
      )}
    />
  )
}

export const BarsStacked: Story = {
  render: () => <StackedBarsChart />,
}

const SupplyPieChart = () => {
  const { getToken } = useTheme()

  return (
    <PieChart
      size={200}
      ariaLabel="Supply split"
      tooltipLabel="Supply"
      formatValue={({ value }) => `${value}%`}
      segments={[
        {
          value: 35,
          label: "Legacy",
          color: getToken("colors.basePalette.coralPink"),
        },
        {
          value: 25,
          label: "Giga",
          color: getToken("colors.basePalette.hollar-green"),
        },
        {
          value: 40,
          label: "Other",
          color: getToken("controls.outline.base"),
        },
      ]}
    />
  )
}

export const Pie: Story = {
  render: () => <SupplyPieChart />,
}
