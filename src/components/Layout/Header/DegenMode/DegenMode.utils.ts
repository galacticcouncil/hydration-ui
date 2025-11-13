import { useProviderRpcUrlStore, useRefetchProviderData } from "api/provider"
import { useRpcProvider } from "providers/rpcProvider"
import { useEffect, useMemo, useRef } from "react"
import {
  TRegisteredAsset,
  updateExternalAssetsCursor,
} from "sections/wallet/addToken/AddToken.utils"
import { useExternalAssetsMetadata, useSettingsStore } from "state/store"
import { useAssets } from "providers/assets"
import { pick } from "utils/rx"
import { useShallow } from "hooks/useShallow"

export const useDegenModeSubscription = () => {
  const { external, externalInvalid } = useAssets()
  const { degenMode } = useSettingsStore()
  const { isInitialized, getExternalAssetMetadata } = useExternalAssetsMetadata(
    useShallow((state) =>
      pick(state, ["isInitialized", "getExternalAssetMetadata"]),
    ),
  )
  const { getDataEnv } = useProviderRpcUrlStore()
  const refetchProvider = useRefetchProviderData()
  const { isLoaded } = useRpcProvider()

  const hasInitializedDegenMode = useRef(false)

  const { data, isSuccess } = useMemo(() => {
    if (!isInitialized || !isLoaded)
      return {
        data: [],
        isSuccess: false,
      }

    const data = [...external, ...externalInvalid].reduce((acc, asset) => {
      if (asset.parachainId && asset.externalId) {
        const externalAsset = getExternalAssetMetadata(
          asset.parachainId,
          asset.externalId,
        )

        if (externalAsset) {
          acc.push({
            ...externalAsset,
            internalId: asset.id,
          })
        }
      }

      return acc
    }, [] as TRegisteredAsset[])

    return {
      data,
      isSuccess: true,
    }
  }, [
    external,
    externalInvalid,
    isLoaded,
    getExternalAssetMetadata,
    isInitialized,
  ])

  // Initialize ExternalAssetCursor if degenMode is true
  useEffect(() => {
    if (
      degenMode &&
      isSuccess &&
      data.length &&
      !hasInitializedDegenMode.current
    ) {
      updateExternalAssetsCursor(data, {
        degenMode,
        dataEnv: getDataEnv(),
      })
      hasInitializedDegenMode.current = true
      refetchProvider()
    }
  }, [degenMode, data, getDataEnv, isSuccess, refetchProvider])

  // Subscribe to degenMode change to update ExternalAssetCursor
  useEffect(() => {
    return useSettingsStore.subscribe((state, prevState) => {
      if (state.degenMode !== prevState.degenMode) {
        const { degenMode } = state
        if (data.length) {
          updateExternalAssetsCursor(data, {
            degenMode,
            dataEnv: getDataEnv(),
          })
          refetchProvider()
        }
      }
    })
  }, [data, getDataEnv, refetchProvider])
}
