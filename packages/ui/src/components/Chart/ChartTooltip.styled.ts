import { css } from "@emotion/react"
import styled from "@emotion/styled"

export const STooltipContainer = styled.div(
  ({ theme }) => css`
    display: grid;
    align-items: start;
    gap: 4px;

    border-radius: ${theme.radii.md}px;
    background-color: ${theme.details.tooltips};
    padding: ${theme.scales.paddings.m}px;
    box-shadow:
      0px 3px 9px 0px rgba(0, 0, 0, 0.04),
      0px 14px 37px 0px rgba(0, 0, 0, 0.04);
  `,
)
