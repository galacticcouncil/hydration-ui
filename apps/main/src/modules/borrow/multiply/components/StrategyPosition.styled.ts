import { css, styled } from "@galacticcouncil/ui/utils"

export const SStrategyPosition = styled.div(
  ({ theme }) => css`
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr auto;
    align-items: center;
    gap: ${theme.space.base};

    border: 1px solid ${theme.details.borders};
    border-radius: ${theme.containers.cornerRadius.internalPrimary};

    padding-block: ${theme.containers.paddings.secondary};
    padding-inline: ${theme.containers.paddings.tertiary};

    background: ${theme.controls.dim.base};
  `,
)

export const SStrategyPositionMobile = styled.div(
  ({ theme }) => css`
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    grid-template-rows: auto auto;
    align-items: center;
    gap: ${theme.space.base};

    border: 1px solid ${theme.details.borders};
    border-radius: ${theme.containers.cornerRadius.internalPrimary};

    padding-block: ${theme.containers.paddings.secondary};
    padding-inline: ${theme.containers.paddings.tertiary};

    background: ${theme.controls.dim.base};

    & > *:nth-child(1),
    & > *:nth-child(2) {
      grid-column: span 3;
    }
    & > *:nth-child(2) {
      justify-self: end;
    }

    & > *:nth-child(3),
    & > *:nth-child(4),
    & > *:nth-child(5) {
      grid-column: span 2;
    }
  `,
)
