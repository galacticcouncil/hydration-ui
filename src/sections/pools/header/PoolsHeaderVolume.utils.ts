import { useOmnipoolAssets } from "../../../api/omnipool"
import { usePoolsDetailsTradeVolumes } from "../pool/details/PoolDetails.utils"
import { useOmnipoolPools } from "../PoolsPage.utils"

export function useTotalVolumesInPools() {
  const assets = useOmnipoolAssets()
  const totalVolume = usePoolsDetailsTradeVolumes(
    assets.data?.map((asset) => asset.id) ?? [],
  )

  const queries = [assets, totalVolume]
  const isLoading = queries.some((query) => query.isLoading)

  //the value should be divided by two
  //because the value is summed by assetIn and assetOut
  return {
    isLoading,
    value: totalVolume.data.div(2),
  }
}

export function useTotalVolumesInPoolsUser() {
  const pools = useOmnipoolPools(true)
  const assetIds = pools.data?.map((pool) => pool.id) ?? []

  const totalVolume = usePoolsDetailsTradeVolumes(assetIds)

  const queries = [pools, totalVolume]
  const isLoading = queries.some((query) => query.isLoading)

  //the value should be divided by two
  //because the value is summed by assetIn and assetOut
  return {
    isLoading,
    value: totalVolume.data.div(2),
  }
}
