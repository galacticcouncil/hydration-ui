import {
  SBarContainer,
  SLabelContainer,
  SBar,
  SRowContainer,
} from "./VerticalBarChart.styled"

import { Text } from "components/Typography/Text/Text"

export type BarChartData = {
  value: number
  label: string
  color?: string
}

export type VerticalBarChartProps = {
  data: BarChartData[]
}

export const VerticalBarChart: React.FC<VerticalBarChartProps> = ({ data }) => {
  const max = Math.max(...data.map(({ value }) => value))

  const dataWithPercentage = data
    .sort((a, b) => b.value - a.value)
    .map(({ value, ...rest }) => ({
      ...rest,
      percentage: (value / max) * 100,
    }))

  return (
    <div sx={{ flex: "column", gap: 10 }}>
      {dataWithPercentage.map(({ label, percentage, color }) => (
        <SRowContainer key={label}>
          <SLabelContainer>
            <Text fs={12}>{label}</Text>
          </SLabelContainer>
          <SBarContainer>
            <SBar color={color} percentage={percentage} />
          </SBarContainer>
        </SRowContainer>
      ))}
    </div>
  )
}
