import { useEffect, useRef } from "react"
import { useSDKPools } from "./pools"
import { useRpcProvider } from "providers/rpcProvider"
import { useQueryClient } from "@tanstack/react-query"
import { QUERY_KEY_PREFIX, QUERY_KEYS } from "utils/queryKeys"
import { useDegenModeSubscription } from "components/Layout/Header/DegenMode/DegenMode.utils"
import { useExternalAssetRegistry } from "./external"
import { useSettingsStore } from "state/store"
import { usePriceSubscriber } from "./spotPrice"
import { useProviderMetadata } from "./provider"
import { useOmnipoolVolumeSubscription } from "./omnipool"
import { useActiveQueries } from "hooks/useActiveQueries"
import { useXYKVolumeSubscription } from "./volume"

export const QuerySubscriptions = () => {
  const { isLoaded } = useRpcProvider()
  const { degenMode } = useSettingsStore()
  usePriceSubscriber()
  useProviderMetadata()

  if (!isLoaded) return null

  return (
    <>
      {degenMode && <DegenMode />}
      <InvalidateOnBlockSubscription />
      <OmnipoolAssetsSubscription />
      <ExternalAssetsMetadata />
      <OmnipoolVolumes />
      <XYKVolumes />
    </>
  )
}

export const InvalidateOnBlockSubscription = () => {
  const queryClient = useQueryClient()
  const { api, isLoaded } = useRpcProvider()

  const cancelRef = useRef<VoidFunction | null>(null)

  useEffect(() => {
    if (isLoaded) {
      api.rpc.chain
        .subscribeNewHeads(() => {
          queryClient.invalidateQueries([QUERY_KEY_PREFIX])
        })
        .then((cancel) => {
          cancelRef.current = cancel
        })
    }

    return () => {
      cancelRef.current?.()
    }
  }, [isLoaded, api, queryClient])

  return null
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

const OmnipoolVolumes = () => {
  const activeQueriesAmount = useActiveQueries([
    ...QUERY_KEYS.omnipoolSquidVolumes,
  ])

  return activeQueriesAmount ? <OmnipoolVolumeSubscription /> : null
}

const OmnipoolVolumeSubscription = () => {
  useOmnipoolVolumeSubscription()
  return null
}

const XYKVolumes = () => {
  //const activeQueriesAmount = useActiveQueries(["xykSquidVolumes"])
  useXYKVolumeSubscription()

  return null
}
