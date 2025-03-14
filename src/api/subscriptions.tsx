import { useSDKPools } from "./pools"
import { useProviderMetadata } from "./provider"

export const QuerySubscriptions = () => {
  return <OmnipoolAssetsSubscription />
}

const OmnipoolAssetsSubscription = () => {
  useSDKPools()
  useProviderMetadata()

  return null
}
