import { css, styled } from "@galacticcouncil/ui/utils"

export const SChartTooltipContainer = styled.div(
  ({ theme }) => css`
    display: grid;
    gap: ${theme.space.base};
    border-radius: ${theme.radii.l};
    padding: ${theme.space.m} ${theme.space.l};
  `,
)
