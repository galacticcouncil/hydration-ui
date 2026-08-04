import { css } from "@emotion/react"
import styled from "@emotion/styled"

export const SChartTooltipContainer = styled.div(
  ({ theme }) => css`
    display: grid;
    align-items: start;
    gap: ${theme.space.base};
    position: relative;
    border-radius: ${theme.radii.l};
    background-color: ${theme.details.tooltips};
    border: 1px solid rgba(124, 127, 138, 0.2);
    padding: ${theme.space.m} ${theme.space.l};
    box-shadow: 0px 8px 30px 0px rgba(41, 41, 60, 0.41);
    z-index: 9999;
    pointer-events: none;
    opacity: 0;
    transform: translateY(4px) scale(0.98);
    transition:
      opacity 180ms cubic-bezier(0.22, 1, 0.36, 1),
      transform 180ms cubic-bezier(0.22, 1, 0.36, 1);

    &[data-state="visible"] {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  `,
)
