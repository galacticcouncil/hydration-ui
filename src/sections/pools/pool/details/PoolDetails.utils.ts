import { getVolumeAssetTotalValue, useTradeVolumes } from "api/volume"
import { useMemo } from "react"
import { BN_0, BN_10 } from "utils/constants"
import { useSpotPrice, useSpotPrices } from "api/spotPrice"
import { useAssetMeta, useAssetMetaList } from "api/assetMeta"
import { useApiIds } from "api/consts"
import { u32 } from "@polkadot/types-codec"
import { normalizeId } from "../../../../utils/helpers"

export function usePoolDetailsTradeVolume(assetId: u32) {
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
  const assetMeta = useAssetMeta(assetId)
  const spotPrice = useSpotPrice(assetId, apiIds.data?.usdId)

  const queries = [...volumes, apiIds, assetMeta, spotPrice]
  const isLoading = queries.some((q) => q.isInitialLoading)

  const data = useMemo(() => {
    let result = BN_0
    if (!assetMeta.data || !spotPrice.data || !assetTotalValue) return result

    const assetScale = assetTotalValue.dividedBy(
      BN_10.pow(assetMeta.data?.decimals.toNumber()),
    )

    result = assetScale.multipliedBy(spotPrice.data.spotPrice)

    return result
  }, [assetTotalValue, spotPrice, assetMeta])

  return { data, isLoading }
}

export function usePoolsDetailsTradeVolumes(assetIds: u32[]) {
  const apiIds = useApiIds()
  const volumes = useTradeVolumes(assetIds)
  const assetMetas = useAssetMetaList(assetIds)
  const spotPrices = useSpotPrices(assetIds, apiIds.data?.usdId)

  const queries = [apiIds, ...volumes, assetMetas, ...spotPrices]
  const isLoading = queries.some((q) => q.isInitialLoading)

  const data = useMemo(() => {
    return assetIds.reduce((acc, assetId) => {
      const volume = volumes.find(
        (volume) => volume.data?.assetId === normalizeId(assetId),
      )
      const assetMeta = assetMetas.data?.find(
        (meta) => meta.id === assetId.toString(),
      )
      const spotPrice = spotPrices.find(
        (spot) => spot.data?.tokenIn === normalizeId(assetId),
      )?.data?.spotPrice

      const assetTotalValue = getVolumeAssetTotalValue(volume?.data)?.[
        assetId.toString()
      ]

      if (!assetMeta || !spotPrice || !assetTotalValue) return acc

      const assetScale = assetTotalValue.dividedBy(
        BN_10.pow(assetMeta.decimals.toNumber()),
      )

      return acc.plus(assetScale.multipliedBy(spotPrice))
    }, BN_0)
  }, [volumes, assetMetas, spotPrices, assetIds])

  return { isLoading, data }
}
