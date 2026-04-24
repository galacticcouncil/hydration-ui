import { Flex } from "@galacticcouncil/ui/components"
import { css, styled } from "@galacticcouncil/ui/utils"

export const SUnstakingPosition = styled(Flex)(
  ({ theme }) => css`
    padding: ${theme.containers.paddings.secondary};
    border-radius: ${theme.containers.cornerRadius.containersPrimary};
    background: ${theme.controls.dim.base};
    border: 1px solid ${theme.details.borders};
  `,
)
