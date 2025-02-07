import { Button } from "@galacticcouncil/ui/components"
import { styled } from "@galacticcouncil/ui/utils"

export const SConnectedButton = styled(Button)`
  height: 40px;
`

export const SDisconnectedButton = styled(Button)`
  height: 40px;

  background: ${({ theme }) => theme.buttons.outlineDark.rest};

  &:not(:disabled):hover,
  &:not(:disabled):active {
    background: ${({ theme }) => theme.buttons.outlineDark.hover};
  }
`
