import { useXYKSquidVolumes } from "api/volume"
import { useMemo } from "react"
import { useDisplayPrices } from "utils/displayAsset"
import { TShareToken, useAssets } from "providers/assets"
import BN from "bignumber.js"

export const useXYKPoolTradeVolumes = (shareTokens: TShareToken[]) => {
  const { getAssetWithFallback } = useAssets()

  const { data: volumes = [], isLoading: isVolumesLoading } =
    useXYKSquidVolumes(shareTokens.map((shareToken) => shareToken.poolAddress))

  const allAssetsInPools = [...new Set(volumes.map((volume) => volume.assetId))]

  const spotPrices = useDisplayPrices(allAssetsInPools)
  const isLoading = spotPrices.isInitialLoading || isVolumesLoading

  const data = useMemo(() => {
    if (!volumes.length || !spotPrices.data) return

    return volumes.map((value) => {
      const assetMeta = getAssetWithFallback(value.assetId)
      const spotPrice = spotPrices.data?.find(
        (spotPrice) => spotPrice?.tokenIn === value.assetId,
      )?.spotPrice

      const volume = BN(value.volume)
        .shiftedBy(-assetMeta.decimals)
        .multipliedBy(spotPrice ?? 1)
        .toFixed(3)

      return { volume, poolAddress: value.poolId, assetMeta }
    })
  }, [getAssetWithFallback, spotPrices, volumes])

  return { data, isLoading }
}
