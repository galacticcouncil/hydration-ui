import { useSDKPools } from "./pools"

export const QuerySubscriptions = () => {
  return <OmnipoolAssetsSubscription />
}

const OmnipoolAssetsSubscription = () => {
  useSDKPools()

  return null
}
