import { css } from "@emotion/react"
import styled from "@emotion/styled"

import { Box } from "@/components/Box"

export const SChartContainer = styled(Box)(
  () => css`
    display: flex;
    justify-content: center;

    width: 100%;

    .recharts-dot[stroke="#fff"] {
      stroke: transparent;
    }

    .recharts-layer,
    .recharts-sector,
    .recharts-surface {
      outline: none;
    }

    .recharts-sector[stroke="#fff"] {
      stroke: transparent;
    }
  `,
)
