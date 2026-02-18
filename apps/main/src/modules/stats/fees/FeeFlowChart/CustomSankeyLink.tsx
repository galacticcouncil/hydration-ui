import { useTheme } from "@galacticcouncil/ui/theme"
import { useTranslation } from "react-i18next"
import { Layer } from "recharts"

import { feesAndRevenueColorConfig } from "@/modules/stats/fees/FeeAndRevenueChart/FeeAndRevenue.utils"
import {
  getFeeFlowColors,
  SANKEY_DATA,
} from "@/modules/stats/fees/FeeFlowChart/FeeFlowChart.utils"

export type SankeyLinkPayload = {
  source?: { name: string }
  target?: { name: string }
  value?: number
}

type SankeyLinkProps = {
  sourceX?: number
  targetX?: number
  sourceY?: number
  targetY?: number
  sourceControlX?: number
  targetControlX?: number
  linkWidth?: number
  index?: number
  payload?: SankeyLinkPayload
}

export const CustomSankeyLink = ({
  sourceX,
  targetX,
  sourceY,
  targetY,
  sourceControlX,
  targetControlX,
  linkWidth,
  index,
  payload,
}: SankeyLinkProps) => {
  const { t } = useTranslation("common")
  const { getToken } = useTheme()
  // Try to get colors from payload first (Recharts passes source/target objects)
  const sourceName = payload?.source?.name || ""
  const targetName = payload?.target?.name || ""

  // Fallback to SANKEY_DATA lookup if payload doesn't have names
  const safeIndex = index ?? 0
  const link = SANKEY_DATA.links[safeIndex]
  const sourceNodeName =
    sourceName ||
    (link ? SANKEY_DATA.nodes[link.source]?.name : "") ||
    "HSM Revenue"
  const targetNodeName =
    targetName ||
    (link ? SANKEY_DATA.nodes[link.target]?.name : "") ||
    "Protocol"

  const sourceColor = getToken(
    getFeeFlowColors[sourceNodeName] || feesAndRevenueColorConfig.networkFees,
  )
  const targetColor = getToken(
    getFeeFlowColors[targetNodeName] || feesAndRevenueColorConfig.protocol,
  )
  const percentage = payload?.value || link?.value || 100

  // Create safe gradient ID (remove spaces and special chars)
  const safeSourceName = sourceNodeName.replace(/[^a-zA-Z0-9]/g, "")
  const gradientId = `linkGrad${safeIndex}${safeSourceName}`

  // Calculate midpoint for label
  const midX = ((sourceX ?? 0) + (targetX ?? 0)) / 2
  const midY = ((sourceY ?? 0) + (targetY ?? 0)) / 2

  // Path definition
  const pathD = `M${sourceX ?? 0},${sourceY ?? 0} C${sourceControlX ?? 0},${sourceY ?? 0} ${targetControlX ?? 0},${targetY ?? 0} ${targetX ?? 0},${targetY ?? 0}`

  return (
    <Layer key={`link-${index}`}>
      {/* Define gradient for this link */}
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={sourceColor} stopOpacity={0.7} />
          <stop offset="50%" stopColor={sourceColor} stopOpacity={0.4} />
          <stop offset="100%" stopColor={targetColor} stopOpacity={0.7} />
        </linearGradient>
      </defs>
      {/* Render path with gradient stroke, fallback to solid color */}
      <path
        d={pathD}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth={linkWidth ?? 0}
      />
      {/* Fallback solid path underneath in case gradient fails */}
      <path
        d={pathD}
        fill="none"
        stroke={sourceColor}
        strokeWidth={linkWidth ?? 0}
        strokeOpacity={0.3}
        style={{ pointerEvents: "none" }}
      />
      {/* Percentage label on link */}
      {(linkWidth ?? 0) > 8 && (
        <text
          x={midX}
          y={midY}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={getToken("text.high")}
          fillOpacity={0.9}
          fontSize={10}
          fontWeight={600}
        >
          {t("percent", { value: percentage })}
        </text>
      )}
    </Layer>
  )
}
