import { Button } from "@galacticcouncil/ui/components"
import { styled } from "@galacticcouncil/ui/utils"

export const SConnectedButton = styled(Button)`
  background: ${({ theme }) => theme.buttons.outlineDark.rest};

  &:not(:disabled):hover,
  &:not(:disabled):active {
    background: ${({ theme }) => theme.buttons.outlineDark.hover};
  }
`
