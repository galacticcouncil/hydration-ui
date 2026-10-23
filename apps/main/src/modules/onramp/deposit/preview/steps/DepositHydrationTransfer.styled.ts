import { AccountTile } from "@galacticcouncil/ui/components"
import { styled } from "@galacticcouncil/ui/utils"

export const SDepositSourceAccount = styled(AccountTile)`
  background: ${({ theme }) => theme.controls.dim.active};
  border-color: ${({ theme }) => theme.buttons.secondary.accent.outline};
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
`

export const SDepositHydrationTransfer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 0;
  flex: 1;

  & > form {
    display: flex;
    flex-direction: column;
    min-height: 0;
    flex: 1;
  }
`
