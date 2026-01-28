import { css } from "@emotion/react"
import styled from "@emotion/styled"

export const STooltipContainer = styled.div(
  ({ theme }) => css`
    display: grid;
    align-items: start;
    gap: ${theme.space.s};

    border-radius: ${theme.radii.base};
    background-color: ${theme.details.tooltips};
    padding: ${theme.space.m};
    box-shadow:
      0px 3px 9px 0px rgba(0, 0, 0, 0.04),
      0px 14px 37px 0px rgba(0, 0, 0, 0.04);
  `,
)
