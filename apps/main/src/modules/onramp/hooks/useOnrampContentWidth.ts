import { pxToRem } from "@galacticcouncil/ui/utils"

import { useOnrampStore } from "@/modules/onramp/store/useOnrampStore"
import { OnrampScreen } from "@/modules/onramp/types"

// Screens not listed use the modal's default width.
const SCREEN_WIDTH: Partial<Record<OnrampScreen, string>> = {
  [OnrampScreen.DepositOnchainHoldings]: pxToRem(650),
}

export const useOnrampContentWidth = () =>
  useOnrampStore((state) => SCREEN_WIDTH[state.page])
