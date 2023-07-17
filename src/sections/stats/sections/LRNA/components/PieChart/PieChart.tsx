import { PieChart as PieChartComponent } from "components/PieChart/PieChart"
import styled from "@emotion/styled"
import { ComponentProps } from "react"
import { PieChartLabel } from "./PieChartLabel"

export const SPieChart = styled(PieChartComponent)`
  background: conic-gradient(
    from 335deg at 48.08% 50.64%,
    #29f6c5 -0.8deg,
    rgba(246, 41, 124, 0) 285.15deg,
    #29f6c5 359.2deg,
    rgba(246, 41, 124, 0) 645.15deg
  );
`
type Props = Omit<ComponentProps<typeof PieChartComponent>, "label"> & {
  state: 'BURNING' | 'BIDDING'
}

export const PieChart = ({ state, ...props }: Props) => (
  <SPieChart {...props} label={<PieChartLabel state={state} />} />
)
