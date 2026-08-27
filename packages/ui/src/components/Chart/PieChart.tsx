import { defineChart } from "@tanstack/charts"
import { pie, polar, radialArc } from "@tanstack/charts/polar"
import { tooltip } from "@tanstack/charts/tooltip"
import { portal } from "@tanstack/charts/tooltip/portal"
import { ResponsiveStyleValue } from "@theme-ui/css"
import { ReactNode, useMemo } from "react"

import { Chart } from "@/components/Chart/Chart"
import { ChartLegendTooltipBody } from "@/components/Chart/ChartTooltip"

const FULL_TURN = Math.PI * 2
const GAP_ANGLE = 0.02
const CORNER_RADIUS_RATIO = 0.35
const DEFAULT_INNER_RADIUS = 0.55
const DEFAULT_SIZE = 90
const TOOLTIP_OFFSET = 12

export type PieSegment = {
  readonly value: number
  readonly color: string
  readonly label?: string
}

export type PieChartProps = {
  readonly segments: ReadonlyArray<PieSegment>
  readonly size?: ResponsiveStyleValue<number>
  readonly innerRadius?: number
  readonly total?: number
  readonly ariaLabel: string
  readonly tooltipLabel?: ReactNode
  readonly formatValue?: (segment: PieSegment) => ReactNode
  readonly className?: string
}

export const PieChart = ({
  segments,
  size = DEFAULT_SIZE,
  innerRadius = DEFAULT_INNER_RADIUS,
  total,
  ariaLabel,
  tooltipLabel,
  formatValue,
  className,
}: PieChartProps) => {
  const definition = useMemo(() => {
    const sum = segments.reduce((acc, { value }) => acc + value, 0)

    const filled = total && total > 0 ? Math.min(sum / total, 1) : 1

    const slices = pie(segments, {
      value: "value",
      endAngle: FULL_TURN * filled,
      gapAngle: GAP_ANGLE,
    })

    return defineChart({
      focusRing: false,
      marks: [
        polar({
          marks: [
            radialArc(slices, {
              key: (slice) => slice.label ?? String(slice.index),
              innerRadius: ({ radius }) => radius * innerRadius,
              cornerRadius: ({ radius }) =>
                radius * (1 - innerRadius) * CORNER_RADIUS_RATIO,
              fill: (slice) => slice.color,
            }),
          ],
        }),
      ],
      tooltip: {
        use: tooltip,
        portal,
        sticky: false,
        anchor: "pointer",
        placement: ["right", "left", "top", "bottom"],
        offset: TOOLTIP_OFFSET,
      },
    })
  }, [segments, innerRadius, total])

  return (
    <Chart
      className={className}
      definition={definition}
      ariaLabel={ariaLabel}
      height={size}
      renderTooltipBody={({ points }) => (
        <ChartLegendTooltipBody
          label={tooltipLabel}
          points={points}
          formatLabel={() => null}
          formatSeriesLabel={({ datum }) =>
            (datum as PieSegment).label ?? ariaLabel
          }
          formatValue={({ datum }) => {
            const segment = datum as PieSegment
            return formatValue ? formatValue(segment) : String(segment.value)
          }}
        />
      )}
    />
  )
}
