import { useOmnipoolAssets } from "api/omnipool"
import { useVolumes } from "api/volume"
import { useGetXYKPools } from "api/xyk"
import { useMemo } from "react"
import { useXYKPoolTradeVolumes } from "sections/pools/pool/details/PoolDetails.utils"
import { BN_0 } from "utils/constants"
import { HeaderTotalData } from "./PoolsHeaderTotal"

export const AllPoolsVolumeTotal = () => {
  const pools = useGetXYKPools()
  const poolsAddress = pools.data?.map((pool) => pool.poolAddress) ?? []
  const xykVolumes = useXYKPoolTradeVolumes(poolsAddress)

  const omnipoolAssets = useOmnipoolAssets()

  const assetsId = useMemo(
    () => omnipoolAssets.data?.map((a) => a.id.toString()) ?? [],
    [omnipoolAssets.data],
  )

  const volumes = useVolumes(assetsId)

  const isLoading =
    pools.isInitialLoading ||
    xykVolumes.isLoading ||
    omnipoolAssets.isInitialLoading ||
    volumes.some((volume) => volume.isInitialLoading)

  const totalVolumes = volumes.reduce(
    (memo, volume) => memo.plus(volume.data?.volume ?? BN_0),
    BN_0,
  )

  const totalXYKVolume =
    xykVolumes.data?.reduce(
      (memo, volume) => memo.plus(volume.volume ?? BN_0),
      BN_0,
    ) ?? BN_0

  const volumeTotal = totalVolumes.div(2).plus(totalXYKVolume)

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

  const assetsId = useMemo(
    () => omnipoolAssets.data?.map((a) => a.id.toString()) ?? [],
    [omnipoolAssets.data],
  )

  const volumes = useVolumes(assetsId)

  const isLoading =
    omnipoolAssets.isInitialLoading ||
    volumes.some((volume) => volume.isInitialLoading)

  const totalVolumes = volumes.reduce(
    (memo, volume) => memo.plus(volume.data?.volume ?? BN_0),
    BN_0,
  )

  return <HeaderTotalData isLoading={isLoading} value={totalVolumes.div(2)} />
}
