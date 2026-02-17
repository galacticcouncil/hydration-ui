import { css, styled } from "@galacticcouncil/ui/utils"

export const SChartTooltipContainer = styled.div(
  ({ theme }) => css`
    display: grid;
    gap: ${theme.space.base};
    border-radius: ${theme.radii.l}px;
    background-color: ${theme.details.tooltips};
    border: 1px solid rgba(124, 127, 138, 0.2);
    padding: ${theme.space.m} ${theme.space.l};
    box-shadow: 0px 8px 30px 0px rgba(41, 41, 60, 0.41);
  `,
)
