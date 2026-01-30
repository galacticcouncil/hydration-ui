import { useBreakpoints, useTheme } from "@galacticcouncil/ui/theme"
import { Layer, Rectangle } from "recharts"

import {
  getFeeFlowColors,
  splitFeeFlowLabel,
} from "@/modules/stats/fees/FeeFlowChart/FeeFlowChart.utils"

type SankeyNodeProps = {
  x?: number
  y?: number
  width?: number
  height?: number
  index?: number
  payload?: { name: string }
}

export const CustomSankeyNode = ({
  x,
  y,
  width,
  height,
  index,
  payload,
}: SankeyNodeProps) => {
  const { getToken } = useTheme()
  const { isMobile } = useBreakpoints()

  const safeIndex = index ?? 0
  const safePayload = payload ?? { name: "" }
  const isSource = safeIndex < 6
  const color = getFeeFlowColors[safePayload.name] || getToken("text.high")
  const lines = splitFeeFlowLabel(safePayload.name, isMobile)
  const lineOffset = lines.length > 1 ? -7 : 0
  const labelOffset = isMobile ? 6 : 8

  return (
    <Layer key={`node-${index}`}>
      <Rectangle
        x={x}
        y={y}
        width={width}
        height={height}
        fill={getToken(color)}
        fillOpacity={0.9}
        rx={4}
        ry={4}
      />
      <text
        x={
          isSource
            ? (x ?? 0) - labelOffset
            : (x ?? 0) + (width ?? 0) + labelOffset
        }
        y={(y ?? 0) + (height ?? 0) / 2}
        textAnchor={isSource ? "end" : "start"}
        dominantBaseline="middle"
        fill={getToken("text.high")}
        fontSize={11}
        fontWeight={500}
      >
        {lines.map((line, lineIndex) => (
          <tspan
            key={`${safePayload.name}-${lineIndex}`}
            x={
              isSource
                ? (x ?? 0) - labelOffset
                : (x ?? 0) + (width ?? 0) + labelOffset
            }
            dy={lineIndex === 0 ? lineOffset : 12}
          >
            {line}
          </tspan>
        ))}
      </text>
    </Layer>
  )
}
