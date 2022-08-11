import styled from "styled-components/macro"
import { LineChart } from "recharts"

export const StyledChart = styled(LineChart)`
  // remove cartesian grid lines on borders
  .recharts-cartesian-grid-horizontal line:nth-last-child(-n + 2),
  .recharts-cartesian-grid-vertical line:nth-last-child(-n + 2) {
    stroke-opacity: 0;
  }
`
