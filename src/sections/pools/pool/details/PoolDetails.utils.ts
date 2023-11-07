import { u32 } from "@polkadot/types-codec"
import { useApiIds } from "api/consts"
import { getVolumeAssetTotalValue, useTradeVolumes } from "api/volume"
import { useMemo } from "react"
import { BN_0, BN_10 } from "utils/constants"
import { useDisplayPrice, useDisplayPrices } from "utils/displayAsset"
import { normalizeId } from "utils/helpers"
import { useRpcProvider } from "providers/rpcProvider"

export function usePoolDetailsTradeVolume(assetId: u32) {
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
