import { useVolumes } from "api/volume"
import { useOmnipoolPools } from "sections/pools/PoolsPage.utils"
import { BN_0 } from "utils/constants"

export function useTotalVolumesInPoolsUser() {
  const pools = useOmnipoolPools(true)
  const assetIds = pools.data?.map((pool) => pool.id.toString()) ?? []

  const totalVolume = useVolumes(assetIds)
  const sum = totalVolume.reduce(
    (acc, volume) => acc.plus(volume.data?.volume ?? 0),
    BN_0,
  )

  const queries = [pools, ...totalVolume]
  const isLoading = queries.some((query) => query.isLoading)

  //the value should be divided by two
  //because the value is summed by assetIn and assetOut
  return {
    isLoading,
    value: sum,
  }
}
