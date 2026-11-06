import { css } from "@emotion/react"
import styled from "@emotion/styled"

import { Box } from "@/components/Box"
import { Stack } from "@/components/Stack"

export const SCardHeader = styled(Stack)(
  ({ theme }) => css`
    border-bottom: 1px solid ${theme.details.separators};
  `,
)

export const SCardBody = styled(Box)(
  ({ theme }) => css`
    font-size: ${theme.fontSizes.p4};
    padding: ${theme.space.l};
  `,
)
