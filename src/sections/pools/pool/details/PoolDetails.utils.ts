import { u32 } from "@polkadot/types-codec"
import { useApiIds } from "api/consts"
import {
  getVolumeAssetTotalValue,
  getXYKVolumeAssetTotalValue,
  useTradeVolumes,
  useXYKTradeVolumes,
} from "api/volume"
import { useMemo } from "react"
import { BN_0, BN_10 } from "utils/constants"
import { useDisplayPrice, useDisplayPrices } from "utils/displayAsset"
import { isNotNil, normalizeId } from "utils/helpers"
import { useRpcProvider } from "providers/rpcProvider"

export function usePoolDetailsTradeVolume(assetId: u32 | string) {
  const { assets } = useRpcProvider()
  const volumes = useTradeVolumes([assetId])

  const assetTotalValue = useMemo(() => {
    const volume = volumes.find(
      (volume) => volume.data?.assetId === normalizeId(assetId),
    )

    if (!volume?.data) return
    const sums = getVolumeAssetTotalValue(volume.data)
    return sums?.[assetId.toString()]
  }, [volumes, assetId])

  const apiIds = useApiIds()
  const assetMeta = assets.getAsset(assetId.toString())
  const spotPrice = useDisplayPrice(assetId.toString())

  const queries = [...volumes, apiIds, spotPrice]
  const isLoading = queries.some((q) => q.isLoading)

  const data = useMemo(() => {
    let result = BN_0
    if (!spotPrice.data || !assetTotalValue) return result

    const assetScale = assetTotalValue.dividedBy(BN_10.pow(assetMeta.decimals))

    result = assetScale.multipliedBy(spotPrice.data.spotPrice)

    return result
  }, [assetTotalValue, spotPrice, assetMeta])

  return { data, isLoading }
}

export function usePoolsDetailsTradeVolumes(assetIds: string[]) {
  const { assets } = useRpcProvider()
  const volumes = useTradeVolumes(assetIds)
  const spotPrices = useDisplayPrices(assetIds)

  const queries = [...volumes, spotPrices]
  const isLoading = queries.some((q) => q.isLoading)

  const data = useMemo(() => {
    return assetIds.reduce((acc, assetId) => {
      const volume = volumes.find(
        (volume) => volume.data?.assetId === normalizeId(assetId),
      )
      const assetMeta = assets.getAsset(assetId.toString())

      const spotPrice = spotPrices.data?.find(
        (sp) => sp?.tokenIn === normalizeId(assetId),
      )?.spotPrice

      const assetTotalValue = getVolumeAssetTotalValue(volume?.data)?.[
        assetId.toString()
      ]

      if (!assetMeta || !spotPrice || !assetTotalValue) return acc

      const assetScale = assetTotalValue.dividedBy(
        BN_10.pow(assetMeta.decimals),
      )

      return acc.plus(assetScale.multipliedBy(spotPrice))
    }, BN_0)
  }, [assetIds, volumes, assets, spotPrices.data])

  return { isLoading, data }
}

export const useXYKPollTradeVolumes = (poolsAddress: string[]) => {
  const { assets } = useRpcProvider()
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

  const spotPrices = useDisplayPrices(allAssetsInPools)

  const data = useMemo(() => {
    if (!volumes || !values || !spotPrices.data) return

    const data = values
      .map((value) => {
        if (!value) return undefined
        const volume = value.assets.reduce((acc, asset) => {
          const assetMeta = assets.getAsset(asset)
          const sum = value.sums[assetMeta.id]

          const spotPrice = spotPrices.data?.find(
            (spotPrice) => spotPrice?.tokenIn === asset,
          )?.spotPrice

          if (!sum || !spotPrice) return acc
          const sumScale = sum.shiftedBy(-assetMeta.decimals)

          return acc.plus(sumScale.multipliedBy(spotPrice))
        }, BN_0)

        return { volume, poolAddress: value.poolAddress }
      })
      .filter(isNotNil)

    return data
  }, [assets, spotPrices, values, volumes])

  return { data }
}
