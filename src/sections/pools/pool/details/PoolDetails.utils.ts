import { useXYKSquidVolumes } from "api/volume"
import { useMemo } from "react"
import { TShareToken, useAssets } from "providers/assets"
import BN from "bignumber.js"
import { BN_NAN } from "utils/constants"
import { useAssetsPrice } from "state/displayPrice"

export const useXYKPoolTradeVolumes = (shareTokens: TShareToken[]) => {
  const { getAssetWithFallback } = useAssets()

  const { data: volumes = [], isLoading: isVolumesLoading } =
    useXYKSquidVolumes(shareTokens.map((shareToken) => shareToken.poolAddress))

  const allAssetsInPools = [...new Set(volumes.map((volume) => volume.assetId))]
  const { getAssetPrice, isLoading: isLoadingPrices } =
    useAssetsPrice(allAssetsInPools)

  const isLoading = isLoadingPrices || isVolumesLoading

  const data = useMemo(() => {
    if (!volumes.length || isLoading) return

    return volumes.map((value) => {
      const assetMeta = getAssetWithFallback(value.assetId)
      const spotPrice = getAssetPrice(value.assetId).price

      const volume = BN(value.volume)
        .shiftedBy(-assetMeta.decimals)
        .multipliedBy(spotPrice ?? BN_NAN)
        .toFixed(3)

      return { volume, poolAddress: value.poolId, assetMeta }
    })
  }, [getAssetWithFallback, volumes, getAssetPrice, isLoading])

  return { data, isLoading }
}
