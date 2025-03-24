import { mq } from "@galacticcouncil/ui/theme"
import { css, styled } from "@galacticcouncil/ui/utils"

export const SWalletRewardsSection = styled.div(
  ({ theme }) => css`
    padding-inline: 20px;
    padding-block: 16px;
    border-radius: 16px;
    border: 1px solid ${theme.details.separators};

    display: grid;
    align-items: center;

    grid-template-rows: auto auto;

    ${mq("sm")} {
      padding-block: 20px;

      grid-template-rows: auto;
      grid-template-columns: 1fr auto;

      & > * {
        grid-column: 1 / -1;
      }
    }
  `,
)

export const SWalletRewardsActionItem = styled.div(
  ({ theme }) => css`
    display: grid;
    align-items: center;

    grid-template-columns: subgrid;
    row-gap: ${theme.containers.paddings.tertiary}px;
  `,
)
