import { Stack } from "@galacticcouncil/ui/components"
import { mq } from "@galacticcouncil/ui/theme"
import { css, styled } from "@galacticcouncil/ui/utils"

export const SWalletRewardsSection = styled(Stack)(
  ({ theme }) => css`
    padding-inline: ${theme.containers.paddings.primary};
    padding-block: ${theme.containers.paddings.secondary};
    border-radius: ${theme.radii.xl};
    border: 1px solid ${theme.details.separators};

    ${mq("sm")} {
      padding-block: ${theme.containers.paddings.primary};
    }
  `,
)
