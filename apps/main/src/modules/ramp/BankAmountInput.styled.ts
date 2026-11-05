import { AssetInput } from "@galacticcouncil/ui/components"
import { pxToRem, styled } from "@galacticcouncil/ui/utils"

// Fiat labels need more room around the bank icon.
export const SBankFiatAmountInput = styled(AssetInput)`
  [data-asset-button] {
    height: ${pxToRem(36)};
    padding-inline: ${({ theme }) => theme.space.m};
    gap: ${({ theme }) => theme.space.base};

    & > svg {
      margin: 0;
      color: inherit;
    }
  }
`
