import { Button, Flex } from "@galacticcouncil/ui/components"
import { css, styled } from "@galacticcouncil/ui/utils"

export const SLockedBalanceButton = styled(Button)(
  ({ theme }) => css`
    border: 1px solid;
    border-color: ${theme.buttons.secondary.low.borderRest};
    padding: ${theme.space.base};
    padding-block: ${theme.space.s};
    height: fit-content;
  `,
)

export const SClaimableRewardsContainer = styled(Flex)(
  ({ theme }) => css`
    background: ${theme.surfaces.containers.mid.primary};
    border-radius: ${theme.containers.cornerRadius.containersPrimary};
    border: 1px solid ${theme.details.borders};
    padding: ${theme.scales.paddings.s} ${theme.scales.paddings.s}
      ${theme.scales.paddings.s} ${theme.scales.paddings.m};
  `,
)
