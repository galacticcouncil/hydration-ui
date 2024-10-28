import { useOmnipoolAssetsSubsciption, useSquidSubscription } from "./omnipool"

export const QuerySubscriptions = () => {
  return <OmnipoolAssetsSubscription />
}

const OmnipoolAssetsSubscription = () => {
  useOmnipoolAssetsSubsciption()
  // useSquidSubscription()

  return null
}
