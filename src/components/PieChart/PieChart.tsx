import { getCircleCoordinates } from "sections/stats/components/PieChart/PieChart.utils"
import { SClipPath, SPieLabelContainer } from "./PieChart.styled"
import { ReactComponent as ChartBackground } from "assets/icons/StakingChart.svg"
import { getRuleScaleLines } from "./PieChart.utils"
import { Skeleton } from "./Skeleton"
import styled from "@emotion/styled"
import { ReactNode } from "react"

const RADIUS = 140

type Props = {
  percentage: number
  loading: boolean
  className?: string
  label: ReactNode
}

export const PieChart = styled(
  ({ percentage, loading, className, label }: Props) => {
    if (loading) return <Skeleton />

    const lines = getRuleScaleLines(RADIUS)
    const calculatedPercentage = 0.56 * percentage

    return (
      <svg width={RADIUS * 2} height={RADIUS + 60}>
        <foreignObject
          width="100%"
          height="100%"
          css={{ position: "relative" }}
        >
          <div css={{ margin: 15 }}>
            <SClipPath
              radius={RADIUS}
              className={className}
              clipPath={getCircleCoordinates(
                80,
                125,
                250,
                calculatedPercentage,
                -100,
              )}
            />
            <ChartBackground />
            <SPieLabelContainer>{label}</SPieLabelContainer>
          </div>
        </foreignObject>
        {lines}
      </svg>
    )
  },
)``
