import { useMatchRoute } from "@tanstack/react-router"

import { DcaSettingsModal } from "@/modules/trade/swap/components/SettingsModal/DcaSettings/DcaSettingsModal"
import { SwapSettingsModal } from "@/modules/trade/swap/components/SettingsModal/SwapSettings/SwapSettingsModal"

export const SettingsModal = () => {
  const matchRoute = useMatchRoute()

  switch (true) {
    case !!matchRoute({ to: "/trade/swap/dca" }):
      return <DcaSettingsModal />
    case !!matchRoute({ to: "/trade/swap/market" }):
      return <SwapSettingsModal />
    default:
      throw new Error("Settings are not available for this route.")
  }
}
