import { HYDRATION_CHAIN_KEY } from "@galacticcouncil/utils"
import { useMatchRoute, useSearch } from "@tanstack/react-router"

import { swapTabLink } from "@/config/navigation"
import {
  SwapSettingsModal,
  SwapSettingsSection,
} from "@/modules/trade/swap/components/SettingsModal/SwapSettings/SwapSettingsModal"

type Props = {
  readonly swapSection?: SwapSettingsSection
}

export const SettingsModal = ({ swapSection }: Props) => {
  const matchRoute = useMatchRoute()
  const { destPlatform } = useSearch({ strict: false })

  switch (true) {
    case !!matchRoute(swapTabLink("twap")):
      return (
        <SwapSettingsModal
          section="split"
          // Shown for every Intent TWAP; NEAR has no payout fee, but the setting still applies
          showPayout={!!destPlatform && destPlatform !== HYDRATION_CHAIN_KEY}
        />
      )
    case !!matchRoute(swapTabLink("market")):
      return <SwapSettingsModal section={swapSection} />
    case !!matchRoute(swapTabLink("limit")):
      return <SwapSettingsModal section="none" />
    default:
      throw new Error("Settings are not available for this route.")
  }
}
