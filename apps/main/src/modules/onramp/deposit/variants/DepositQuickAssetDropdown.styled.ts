import { Button, ToggleGroup } from "@galacticcouncil/ui/components"
import { SContent } from "@galacticcouncil/ui/components/Popover"
import { styled } from "@galacticcouncil/ui/utils"

export const SDepositQuickAssetDropdown = styled(SContent)`
  width: min(
    var(--deposit-asset-dropdown-width, var(--radix-popover-trigger-width)),
    var(--radix-popover-content-available-width)
  );
  max-height: var(--radix-popover-content-available-height);
  outline: none;
`

export const SDepositQuickAssetTrigger = styled(Button)`
  --button-icon: 0.6em;
  --button-icon-end: -0.4em;
  justify-content: space-between;
  scale: 1 !important;
`

export const SDepositQuickChainFilters = styled(ToggleGroup)`
  padding: 0;
  border: 0;
`
