import { useExternalAssetRegistry } from "api/externalAssetRegistry"
import { useProviderRpcUrlStore, useRefetchProviderData } from "api/provider"
import { useRpcProvider } from "providers/rpcProvider"
import { useEffect, useMemo, useRef } from "react"
import {
  TRegisteredAsset,
  updateExternalAssetsCursor,
} from "sections/wallet/addToken/AddToken.utils"
import { useSettingsStore } from "state/store"
import { useAssetsLocations } from "api/assetDetails"
import { parseLocation } from "utils/externalAssets"

export const useDegenModeSubscription = () => {
  const { degenMode } = useSettingsStore()
  const externalAssets = useExternalAssetRegistry(degenMode)
  const locations = useAssetsLocations()
  const { getDataEnv } = useProviderRpcUrlStore()
  const refetchProvider = useRefetchProviderData()
  const { isLoaded } = useRpcProvider()

  const hasInitializedDegenMode = useRef(false)

  const { data, isSuccess } = useMemo(() => {
    const isSuccess = Object.values(externalAssets)
      .map(({ isSuccess }) => isSuccess)
      .every(Boolean)

    if (!isSuccess || !isLoaded) {
      return {
        data: [],
        isSuccess: false,
      }
    }

    const locationIds = (locations.data ?? []).reduce<Map<string, string>>(
      (acc, location) => {
        const id = parseLocation("generalIndex", location.data)?.toString()

        if (id) acc.set(id, location.id)

        return acc
      },
      new Map([]),
    )

    const data: TRegisteredAsset[] = []
    for (const parachain in externalAssets) {
      externalAssets[parachain].data?.forEach((value, key) => {
        const internalId = locationIds.get(key)
        if (internalId)
          data.push({
            ...value,
            internalId,
          })
      })
    }

    return {
      data,
      isSuccess,
    }
  }, [externalAssets, isLoaded, locations.data])

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
