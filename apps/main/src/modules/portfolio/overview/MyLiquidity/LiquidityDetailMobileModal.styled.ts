import { css, styled } from "@galacticcouncil/ui/utils"

export const SLiquidityPositionsMobile = styled.div(
  ({ theme }) => css`
    display: grid;
    grid-template-columns: auto 1fr auto;
    column-gap: ${theme.space.xxxl};
    row-gap: ${theme.space.m};

    overflow-y: auto;
  `,
)
