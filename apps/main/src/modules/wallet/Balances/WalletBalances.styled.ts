import { mq } from "@galacticcouncil/ui/theme"
import { css, styled } from "@galacticcouncil/ui/utils"

export const SWalletBalances = styled.div(
  ({ theme }) => css`
    display: grid;
    row-gap: ${theme.containers.paddings.tertiary}px;

    height: 292px;
    padding: ${theme.containers.paddings.secondary}px;
    border-radius: 16px;
    border: 1px solid ${theme.details.borders};

    background: ${theme.surfaces.containers.high.primary};

    grid-template-rows: 1fr auto auto;
    row-gap: 4px;

    ${mq("sm")} {
      padding: ${theme.containers.paddings.primary}px;

      grid-template-rows: auto;
      grid-template-columns: 1fr auto minmax(25%, auto);
      column-gap: 20px;
    }
  `,
)
