import { useDegenModeSubscription } from "components/Layout/Header/DegenMode/DegenMode.utils"
import { useSDKPools } from "./pools"
import { useSettingsStore } from "state/store"
import { useExternalAssetRegistry } from "./external"
import { useRpcProvider } from "providers/rpcProvider"

export const QuerySubscriptions = () => {
  const { degenMode } = useSettingsStore()
  const { isLoaded } = useRpcProvider()

  return (
    <>
      {degenMode && <DegenMode />}
      {isLoaded && <ExternalAssetsMetadata />}
      <OmnipoolAssetsSubscription />
    </>
  )
}

const OmnipoolAssetsSubscription = () => {
  useSDKPools()

  return null
}

const DegenMode = () => {
  useDegenModeSubscription()

  return null
}

const ExternalAssetsMetadata = () => {
  useExternalAssetRegistry()

  return null
}
