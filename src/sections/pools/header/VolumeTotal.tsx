import { useGetXYKPools } from "api/xyk"
import { useXYKPoolTradeVolumes } from "sections/pools/pool/details/PoolDetails.utils"
import { BN_0 } from "utils/constants"
import { HeaderTotalData } from "./PoolsHeaderTotal"
import { usePools } from "sections/pools/PoolsPage.utils"

export const AllPoolsVolumeTotal = () => {
  const xykPools = useGetXYKPools()
  const poolsAddress = xykPools.data?.map((pool) => pool.poolAddress) ?? []
  const xykVolumes = useXYKPoolTradeVolumes(poolsAddress)

  const pools = usePools()

  const isLoading =
    xykPools.isInitialLoading ||
    xykVolumes.isLoading ||
    pools.isLoading ||
    !!pools.data?.some((pool) => pool.isVolumeLoading)

  const totalVolumes = pools.data?.reduce(
    (memo, pool) => memo.plus(pool.volume ?? BN_0),
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
  const pools = usePools()

  const isLoading =
    pools.isLoading || !!pools.data?.some((pool) => pool.isVolumeLoading)

  const totalVolumes = pools.data?.reduce(
    (memo, pool) => memo.plus(pool.volume ?? BN_0),
    BN_0,
  )

  return <HeaderTotalData isLoading={isLoading} value={totalVolumes?.div(2)} />
}
