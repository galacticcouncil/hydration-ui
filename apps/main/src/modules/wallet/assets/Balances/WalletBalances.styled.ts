import { mq } from "@galacticcouncil/ui/theme"
import { css, styled } from "@galacticcouncil/ui/utils"

export const SWalletBalances = styled.div(
  ({ theme }) => css`
    display: grid;
    row-gap: ${theme.containers.paddings.tertiary};

    min-height: 18.25rem;
    padding: ${theme.containers.paddings.secondary};
    border-radius: 16px;
    border: 1px solid ${theme.details.borders};

    background: ${theme.surfaces.containers.high.primary};

    grid-template-rows: 1fr auto auto;
    row-gap: ${theme.space.s};

    ${mq("md")} {
      padding: ${theme.containers.paddings.primary};

      grid-template-rows: auto;
      grid-template-columns: 1fr auto minmax(25%, auto);
      column-gap: ${theme.space.xl};
    }
  `,
)
