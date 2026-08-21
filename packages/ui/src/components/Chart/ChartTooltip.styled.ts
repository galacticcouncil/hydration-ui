import { css } from "@emotion/react"
import styled from "@emotion/styled"

export const STooltipContainer = styled.div(
  ({ theme }) => css`
    display: grid;
    align-items: start;
    gap: ${theme.space.base};
    min-width: ${theme.sizes["3xl"]};
    padding: ${theme.space.m};
  `,
)
