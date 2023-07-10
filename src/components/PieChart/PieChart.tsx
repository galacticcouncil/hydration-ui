import { getCircleCoordinates } from "sections/stats/components/PieChart/PieChart.utils"
import { SClipPath, SPieLabelContainer } from "./PieChart.styled"
import { ReactComponent as ChartBackground } from "assets/icons/StakingChart.svg"
import { getRuleScaleLines } from "./PieChart.utils"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { Skeleton } from "./Skeleton"
import styled from '@emotion/styled'

const RADIUS = 140

export const PieChart = styled(({
  percentage,
  loading,
  className,
}: {
  percentage: number
  loading: boolean,
  className?: string;
}) => {
  const { t } = useTranslation()

  if (loading) return <Skeleton />

  const lines = getRuleScaleLines(RADIUS)
  const calculatedPercentage = 0.56 * percentage

  return (
    <svg width={RADIUS * 2} height={RADIUS + 30}>
      <foreignObject width="100%" height="100%" css={{ position: "relative" }}>
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
          <SPieLabelContainer>
            <Text fs={12}>{t("staking.dashboard.stats.chart.label")}</Text>
            <Text fs={30} font="FontOver">
              {percentage}%
            </Text>
          </SPieLabelContainer>
        </div>
      </foreignObject>
      {lines}
    </svg>
  )
})``
