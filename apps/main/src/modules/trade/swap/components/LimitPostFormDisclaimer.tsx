import { useMatchRoute } from "@tanstack/react-router"
import { FC } from "react"

import { swapTabLink } from "@/config/navigation"
import { LimitWarning } from "@/modules/trade/swap/sections/Limit/LimitWarning"

/**
 * Limit-only copy shown under the swap card (not inside the Paper) so it
 * spans the full width of the right column.
 */
export const LimitPostFormDisclaimer: FC = () => {
  const matchRoute = useMatchRoute()
  if (!matchRoute(swapTabLink("limit"))) return null

  return <LimitWarning />
}
