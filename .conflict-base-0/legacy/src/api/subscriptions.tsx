import { useOmnipoolAssetsSubsciption } from "./omnipool"

export const QuerySubscriptions = () => {
  return <OmnipoolAssetsSubscription />
}

const OmnipoolAssetsSubscription = () => {
  useOmnipoolAssetsSubsciption()

  return null
}
