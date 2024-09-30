import { useMatchRoute } from "@tanstack/react-location"
import { useOmnipoolAssetsSubsciption } from "./omnipool"
import { LINKS } from "utils/navigation"

export const QuerySubscriptions = () => {
  const matchRoute = useMatchRoute()

  const isOmnipoolAssetsActive = [
    LINKS.allPools,
    LINKS.myLiquidity,
    LINKS.isolated,
    LINKS.omnipool,
    LINKS.walletAssets,
    LINKS.statsOverview,
    LINKS.statsPOL,
  ].some((item) => matchRoute({ to: item }))

  return isOmnipoolAssetsActive ? <OmnipoolAssetsSubscription /> : null
}

const OmnipoolAssetsSubscription = () => {
  useOmnipoolAssetsSubsciption()

  return null
}
