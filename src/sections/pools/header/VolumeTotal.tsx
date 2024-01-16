import { useOmnipoolAssets } from "api/omnipool"
import { useVolume } from "api/volume"
import { useGetXYKPools } from "api/xyk"
import { useXYKPoolTradeVolumes } from "sections/pools/pool/details/PoolDetails.utils"
import { BN_0 } from "utils/constants"
import { HeaderTotalData } from "./PoolsHeaderTotal"
import { useDisplayAssetStore, useDisplayPrice } from "utils/displayAsset"

export const AllPoolsVolumeTotal = () => {
  const displayAsset = useDisplayAssetStore()
  const pools = useGetXYKPools()
  const poolsAddress = pools.data?.map((pool) => pool.poolAddress) ?? []
  const xykVolumes = useXYKPoolTradeVolumes(poolsAddress)

  const volumes = useVolume("all")

  const spotPrice = useDisplayPrice(displayAsset.stableCoinId)

  const isLoading =
    pools.isInitialLoading ||
    xykVolumes.isLoading ||
    volumes.isLoading ||
    spotPrice.isInitialLoading

  const totalVolumes = volumes.data
    ?.reduce((memo, volume) => memo.plus(volume.volume_usd ?? BN_0), BN_0)
    .multipliedBy(spotPrice.data?.spotPrice ?? 1)

  const totalXYKVolume =
    xykVolumes.data?.reduce(
      (memo, volume) => memo.plus(volume.volume ?? BN_0),
      BN_0,
    ) ?? BN_0

  const volumeTotal = totalVolumes?.div(2).plus(totalXYKVolume)

  return <HeaderTotalData isLoading={isLoading} value={volumeTotal} />
}

export const XYKVolumeTotal = () => {
  const pools = useGetXYKPools()
  const poolsAddress = pools.data?.map((pool) => pool.poolAddress) ?? []
  const xykVolumes = useXYKPoolTradeVolumes(poolsAddress)

  const isLoading = pools.isInitialLoading || xykVolumes.isLoading

  const totalXYKVolume =
    xykVolumes.data?.reduce(
      (memo, volume) => memo.plus(volume.volume ?? BN_0),
      BN_0,
    ) ?? BN_0

  return <HeaderTotalData isLoading={isLoading} value={totalXYKVolume} />
}

export const VolumeTotal = () => {
  const omnipoolAssets = useOmnipoolAssets()
  const displayAsset = useDisplayAssetStore()

  const volumes = useVolume("all")

  const spotPrice = useDisplayPrice(displayAsset.stableCoinId)

  const isLoading =
    omnipoolAssets.isInitialLoading ||
    volumes.isLoading ||
    spotPrice.isInitialLoading

  const totalVolumes = volumes.data
    ?.reduce((memo, volume) => memo.plus(volume.volume_usd ?? BN_0), BN_0)
    .multipliedBy(spotPrice.data?.spotPrice ?? 1)

  return <HeaderTotalData isLoading={isLoading} value={totalVolumes?.div(2)} />
}
