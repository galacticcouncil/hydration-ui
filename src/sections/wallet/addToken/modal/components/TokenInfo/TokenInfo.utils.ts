import { useQuery } from "@tanstack/react-query"
import { useAssets } from "providers/assets"
import { useProviderRpcUrlStore } from "api/provider"
import { useXYKSquidVolumes } from "api/volume"
import { useRpcProvider } from "providers/rpcProvider"
import { useMemo, useState } from "react"
import {
  useExternalTokenMeta,
  useUserExternalTokenStore,
} from "sections/wallet/addToken/AddToken.utils"

import { isNotNil } from "utils/helpers"
import BN from "bignumber.js"
import { useExternalAssetsMetadata } from "state/store"
import { useShallow } from "hooks/useShallow"

import { pick } from "utils/rx"
import { assethub } from "api/external/assethub"
import { useAssetsPrice } from "state/displayPrice"

const useMissingExternalAssets = (ids: string[]) => {
  const { tradable, getAsset } = useAssets()
  const { getExternalAssetMetadata, isInitialized } = useExternalAssetsMetadata(
    useShallow((state) =>
      pick(state, ["getExternalAssetMetadata", "isInitialized"]),
    ),
  )

  const missingExternalAssets = useMemo(() => {
    if (isInitialized) {
      const invalidTokensId = ids.filter(
        (assetId) => !tradable.some((tradeAsset) => tradeAsset.id === assetId),
      )

      return invalidTokensId
        .map((tokenId) => {
          const externalId = getAsset(tokenId)?.externalId

          const meta = externalId
            ? getExternalAssetMetadata(
                assethub.parachainId.toString(),
                externalId,
              )
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
  }, [getAsset, ids, tradable, getExternalAssetMetadata, isInitialized])

  return missingExternalAssets
}

export const useExternalXYKVolume = (poolsAddress: string[]) => {
  const [valid, setValid] = useState(false)
  const { poolService } = useRpcProvider()
  const { getAsset } = useAssets()
  const dataEnv = useProviderRpcUrlStore.getState().getDataEnv()

  const getExtrernalTokenByInternalId = useExternalTokenMeta()

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
  const { getAssetPrice, isLoading: isLoadingPrice } = useAssetsPrice(
    valid ? volumeAssets : [],
  )

  const isLoading = isVolumesLoading || isLoadingPrice

  const data = useMemo(() => {
    if (!!volumes.length && !isLoadingPrice) {
      return volumes.map((value) => {
        const assetMeta = getAsset(value.assetId)
        const spotPrice = getAssetPrice(value.assetId).price

        const decimals = assetMeta?.name
          ? assetMeta.decimals
          : getExtrernalTokenByInternalId(value.assetId)?.decimals ?? 0

        const volume = BN(value.volume)
          .shiftedBy(-decimals)
          .multipliedBy(spotPrice)
          .toFixed(3)

        return { volume, poolAddress: value.poolId, assetMeta }
      })
    }
    return undefined
  }, [
    getAsset,
    getExtrernalTokenByInternalId,
    getAssetPrice,
    isLoadingPrice,
    volumes,
  ])

  return { data, isLoading }
}
