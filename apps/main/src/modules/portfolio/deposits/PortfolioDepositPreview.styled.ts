import { TableContainer } from "@galacticcouncil/ui/components"
import { styled } from "@galacticcouncil/ui/utils"

export const SPortfolioDepositTableContainer = styled(TableContainer)`
  tbody tr:has([data-claimable="true"]) {
    background-color: ${({ theme }) => theme.buttons.secondary.accent.rest};

    &:hover {
      background-color: ${({ theme }) => theme.accents.info.primary};
    }
  }
`
