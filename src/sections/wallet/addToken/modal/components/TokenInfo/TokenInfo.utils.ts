import { useQuery } from "@tanstack/react-query"
import { useAssetHubAssetRegistry } from "api/external/assethub"
import { TExternal, useAssets } from "providers/assets"
import { useProviderRpcUrlStore } from "api/provider"
import { getXYKVolumeAssetTotalValue, useXYKTradeVolumes } from "api/volume"
import { useRpcProvider } from "providers/rpcProvider"
import { useMemo, useState } from "react"
import { useUserExternalTokenStore } from "sections/wallet/addToken/AddToken.utils"
import { BN_0, BN_NAN } from "utils/constants"
import { useDisplayPrices } from "utils/displayAsset"
import { isNotNil } from "utils/helpers"

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

  const { tokens: externalTokensStored } = useUserExternalTokenStore.getState()
  const volumes = useXYKTradeVolumes(poolsAddress)

  const values = useMemo(() => {
    return poolsAddress.map((poolAddress) => {
      const volume = volumes.find(
        (volume) => volume.data?.poolAddress === poolAddress,
      )

      const sums = getXYKVolumeAssetTotalValue(volume?.data)

      if (!volume?.data || !sums) return undefined

      return { poolAddress, assets: Object.keys(sums), sums }
    })
  }, [poolsAddress, volumes])

  // Get all uniques assets in pools
  const allAssetsInPools = [
    ...new Set(
      values.filter(isNotNil).reduce((acc, pool) => {
        if (!pool) return acc
        return [...acc, ...pool.assets]
      }, [] as string[]),
    ),
  ]

  const missingAssets = useMissingExternalAssets(allAssetsInPools)
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

  const spotPrices = useDisplayPrices(valid ? allAssetsInPools : [])

  const isLoading =
    volumes.some((volume) => volume.isInitialLoading) ||
    spotPrices.isInitialLoading
  const data = useMemo(() => {
    if (!volumes || !values || !spotPrices.data) return

    const data = values
      .map((value) => {
        if (!value) return undefined
        const volume = value.assets.reduce((acc, asset) => {
          const assetMeta = getAsset(asset)
          if (!assetMeta) return acc
          const decimals = assetMeta.symbol
            ? assetMeta.decimals
            : missingAssets.find(
                (missingAsset) =>
                  missingAsset.id === (assetMeta as TExternal).externalId,
              )?.decimals ?? 0

          const sum = value.sums[assetMeta.id]

          const spotPrice = spotPrices.data?.find(
            (spotPrice) => spotPrice?.tokenIn === asset,
          )?.spotPrice

          if (!sum || !spotPrice) return BN_NAN
          const sumScale = sum.shiftedBy(-decimals)

          return acc.plus(sumScale.multipliedBy(spotPrice))
        }, BN_0)

        return { volume, poolAddress: value.poolAddress }
      })
      .filter(isNotNil)

    return data
  }, [getAsset, missingAssets, spotPrices.data, values, volumes])

  return { data, isLoading }
}
