import { css, styled } from "@galacticcouncil/ui/utils"

export const SLiquidityPosition = styled.div(
  ({ theme }) => css`
    display: grid;
    grid-template-columns: subgrid;
    align-items: center;
    column-gap: inherit;

    grid-column: 1 / -1;

    padding-block: ${theme.containers.paddings.tertiary};
    padding-inline: ${theme.containers.paddings.primary};

    background: ${theme.controls.dim.base};
    border: 1px solid ${theme.details.borders};
    border-radius: ${theme.containers.cornerRadius.containersPrimary};

    & > :first-child {
      justify-self: start;
      text-align: start;
    }

    .liquidity-position-amount {
      justify-self: start;
      width: max-content;
      max-width: 100%;
      text-align: start;

      & > div {
        align-items: flex-start;
      }
    }
  `,
)
