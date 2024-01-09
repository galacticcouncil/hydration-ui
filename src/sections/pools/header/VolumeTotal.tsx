import { useOmnipoolAssets } from "api/omnipool"
import { useVolume } from "api/volume"
import { useGetXYKPools } from "api/xyk"
import { useXYKPoolTradeVolumes } from "sections/pools/pool/details/PoolDetails.utils"
import { BN_0 } from "utils/constants"
import { HeaderTotalData } from "./PoolsHeaderTotal"

export const AllPoolsVolumeTotal = () => {
  const pools = useGetXYKPools()
  const poolsAddress = pools.data?.map((pool) => pool.poolAddress) ?? []
  const xykVolumes = useXYKPoolTradeVolumes(poolsAddress)

  const omnipoolAssets = useOmnipoolAssets()

  const volumes = useVolume("all")

  const isLoading =
    pools.isInitialLoading ||
    xykVolumes.isLoading ||
    omnipoolAssets.isInitialLoading ||
    volumes.isLoading

  const totalVolumes = volumes.data?.reduce(
    (memo, volume) => memo.plus(volume.volume_usd ?? BN_0),
    BN_0,
  )

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

  const volumes = useVolume("all")

  const isLoading = omnipoolAssets.isInitialLoading || volumes.isLoading

  const totalVolumes = volumes.data?.reduce(
    (memo, volume) => memo.plus(volume.volume_usd ?? BN_0),
    BN_0,
  )

  return <HeaderTotalData isLoading={isLoading} value={totalVolumes?.div(2)} />
}
