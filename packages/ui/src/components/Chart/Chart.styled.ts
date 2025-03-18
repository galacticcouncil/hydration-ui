import { css } from "@emotion/react"
import styled from "@emotion/styled"

import { Box } from "@/components/Box"

export const SPriceIndicator = styled(Box)(
  ({ theme }) => css`
    background: ${theme.buttons.primary.low.rest};
    padding: ${theme.scales.paddings.xs}px ${theme.scales.paddings.base}px;
    border-radius: ${theme.radii.full}px;
  `,
)
