import { css, styled } from "@galacticcouncil/ui/utils"

export const SLiquidityDetailExpandedContainer = styled.div(
  ({ theme }) => css`
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr auto;
    row-gap: ${theme.space.base};
  `,
)
