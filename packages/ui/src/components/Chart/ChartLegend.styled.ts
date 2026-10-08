import { css } from "@emotion/react"
import styled from "@emotion/styled"

export const SChartLegendButton = styled.button(
  ({ theme }) => css`
    display: flex;
    align-items: center;
    gap: ${theme.space.s};
    cursor: pointer;
    padding: 0;
    border: none;
    background: none;
    font: inherit;
    color: inherit;
    border-radius: ${theme.radii.base};

    &:focus-visible {
      outline: 2px solid ${theme.controls.outline.active};
      outline-offset: 2px;
    }
  `,
)
