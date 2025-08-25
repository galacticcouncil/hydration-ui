import { Stack } from "@galacticcouncil/ui/components"
import { mq } from "@galacticcouncil/ui/theme"
import { css, styled } from "@galacticcouncil/ui/utils"

export const SWalletRewardsSection = styled(Stack)(
  ({ theme }) => css`
    padding-inline: 20px;
    padding-block: 16px;
    border-radius: 16px;
    border: 1px solid ${theme.details.separators};

    ${mq("sm")} {
      padding-block: 20px;
    }
  `,
)
