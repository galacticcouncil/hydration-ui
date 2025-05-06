import { css, styled } from "@galacticcouncil/ui/utils"

export const SLiquidityPositionMobile = styled.div(
  ({ theme }) => css`
    display: grid;
    grid-template-columns: subgrid;
    row-gap: ${theme.containers.paddings.secondary}px;

    grid-column: 1 / -1;

    padding-top: ${theme.containers.paddings.secondary}px;
    padding-bottom: ${theme.containers.paddings.primary}px;
    border-radius: ${theme.containers.cornerRadius.containersPrimary}px;
    background: ${theme.controls.dim.base};
    border: 1px solid ${theme.details.borders};

    & > * {
      grid-column: 1 / -1;
    }
  `,
)

export const SLiquidityPositionMobileHeader = styled.div(
  ({ theme }) => css`
    display: grid;
    grid-template-columns: subgrid;
    align-items: center;

    padding: ${theme.containers.paddings.primary}px;
  `,
)
