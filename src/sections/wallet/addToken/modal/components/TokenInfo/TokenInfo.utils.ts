import { useQuery } from "@tanstack/react-query"
import { useAssetHubAssetRegistry } from "api/external/assethub"
import { useAssets } from "providers/assets"
import { useProviderRpcUrlStore } from "api/provider"
import { useXYKSquidVolumes } from "api/volume"
import { useRpcProvider } from "providers/rpcProvider"
import { useMemo, useState } from "react"
import {
  useExternalTokenMeta,
  useUserExternalTokenStore,
} from "sections/wallet/addToken/AddToken.utils"

import { useDisplayPrices } from "utils/displayAsset"
import { isNotNil } from "utils/helpers"
import BN from "bignumber.js"

const useMissingExternalAssets = (ids: string[]) => {
  const { tradable, getAsset } = useAssets()
  const externalAssets = useAssetHubAssetRegistry()

  const missingExternalAssets = useMemo(() => {
    if (externalAssets.data) {
      const invalidTokensId = ids.filter(
        (assetId) => !tradable.some((tradeAsset) => tradeAsset.id === assetId),
      )

      return invalidTokensId
        .map((tokenId) => {
          const externalId = getAsset(tokenId)?.externalId

          const meta = externalId
            ? externalAssets.data?.get(externalId)
            : undefined
          return meta
            ? {
                ...meta,
                internalId: tokenId,
              }
            : undefined
        })
        .filter(isNotNil)
    }

    return []
  }, [externalAssets.data, getAsset, ids, tradable])

  return missingExternalAssets
}

export const useExternalXYKVolume = (poolsAddress: string[]) => {
  const [valid, setValid] = useState(false)
  const { poolService } = useRpcProvider()
  const { getAsset } = useAssets()
  const dataEnv = useProviderRpcUrlStore.getState().getDataEnv()
  const getExternalMeta = useExternalTokenMeta()

  const { tokens: externalTokensStored } = useUserExternalTokenStore.getState()
  const { data: volumes = [], isLoading: isVolumesLoading } =
    useXYKSquidVolumes(poolsAddress)

  const { volumeAssets = [], allAssets = [] } = useMemo(() => {
    if (volumes.length) {
      const assetIds: string[] = []
      const volumeAsseIds: string[] = []
      volumes.forEach((volume) => {
        volumeAsseIds.push(volume.assetId)
        assetIds.push(volume.assetId)
        assetIds.push(volume.assetIdB)
      })

      return {
        volumeAssets: [...new Set(volumeAsseIds)],
        allAssets: [...new Set(assetIds)],
      }
    }

    return {}
  }, [volumes])

  const missingAssets = useMissingExternalAssets(allAssets)

  useQuery(
    ["syncExternalTokens", missingAssets.map((asset) => asset.id).join(",")],
    async () => {
      await poolService.syncRegistry([
        ...externalTokensStored[dataEnv],
        ...missingAssets,
      ])

      return true
    },
    {
      onSuccess: () => {
        setValid(true)
      },
      enabled: !valid && !!missingAssets.length,
    },
  )

  const spotPrices = useDisplayPrices(valid ? volumeAssets : [])

  const isLoading = isVolumesLoading || spotPrices.isInitialLoading

  const data = useMemo(() => {
    if (
      !!volumes.length &&
      !!spotPrices.data?.length &&
      spotPrices.data.every((spotPrice) => !spotPrice?.spotPrice.isNaN())
    ) {
      return volumes.map((value) => {
        const assetMeta = getAsset(value.assetId)
        const spotPrice = spotPrices.data?.find(
          (spotPrice) => spotPrice?.tokenIn === value.assetId,
        )?.spotPrice

        const decimals = assetMeta?.name
          ? assetMeta.decimals
          : getExternalMeta(value.assetId)?.decimals ?? 0

        const volume = BN(value.volume)
          .shiftedBy(-decimals)
          .multipliedBy(spotPrice ?? 1)
          .toFixed(3)

        return { volume, poolAddress: value.poolId, assetMeta }
      })
    }
    return undefined
  }, [getAsset, getExternalMeta, spotPrices.data, volumes])

  return { data, isLoading }
}
