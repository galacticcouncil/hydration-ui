import BN from "bignumber.js"
import {
  SBar,
  SBarContainer,
  SContainer,
  SLabelContainer,
  SRowContainer,
} from "./VerticalBarChart.styled"

import { ChartState } from "components/Charts/components/ChartState"
import { Text } from "components/Typography/Text/Text"
import { BN_0 } from "utils/constants"

export type BarChartData = {
  value: number | string | BN
  label: string
  color?: string
}

export type VerticalBarChartProps = {
  data: BarChartData[]
  isLoading?: boolean
  slanted?: boolean
}

export const VerticalBarChart: React.FC<VerticalBarChartProps> = ({
  data,
  isLoading = false,
  slanted = false,
}) => {
  const max = BN.max(
    ...data.map(({ value }) => {
      const bn = BN(value)
      return bn.isNaN() ? BN_0 : bn
    }),
  )

  const dataWithPercentage = data.map(({ value, ...rest }) => {
    const bn = BN(value)
    return {
      ...rest,
      percentage: bn.gt(0) ? bn.div(max).times(100).toNumber() : 0,
    }
  })

  return (
    <SContainer isLoading={isLoading}>
      {dataWithPercentage.map(({ label, percentage, color }) => (
        <SRowContainer key={label}>
          <SLabelContainer>
            <Text fs={12}>{label}</Text>
          </SLabelContainer>
          <SBarContainer>
            <SBar slanted={slanted} color={color} percentage={percentage} />
          </SBarContainer>
        </SRowContainer>
      ))}
      {isLoading && <ChartState state="loading" />}
    </SContainer>
  )
}
