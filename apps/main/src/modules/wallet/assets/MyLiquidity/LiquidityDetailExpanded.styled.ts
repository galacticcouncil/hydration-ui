import { css, styled } from "@galacticcouncil/ui/utils"

export const SLiquidityDetailExpandedContainer = styled.div(
  ({ theme }) => css`
    display: grid;
    grid-template-columns:
      minmax(8rem, 1fr)
      minmax(9rem, 1fr)
      minmax(12rem, 1fr)
      minmax(5rem, 1fr)
      auto;
    column-gap: ${theme.space.xxl};
    row-gap: ${theme.space.base};
    white-space: normal;
  `,
)
