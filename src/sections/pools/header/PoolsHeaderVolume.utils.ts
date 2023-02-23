import { useOmnipoolAssets, useOmnipoolPositions } from "../../../api/omnipool"
import { usePoolsDetailsTradeVolumes } from "../pool/details/PoolDetails.utils"
import { useAccountStore } from "../../../state/store"
import { useApiIds } from "../../../api/consts"
import { useUniques } from "../../../api/uniques"
import { isNotNil } from "../../../utils/helpers"

export function useTotalVolumesInPools() {
  const assets = useOmnipoolAssets()
  const totalVolume = usePoolsDetailsTradeVolumes(
    assets.data?.map((asset) => asset.id) ?? [],
  )

  const queries = [assets, totalVolume]
  const isLoading = queries.some((query) => query.isLoading)

  return {
    isLoading,
    value: totalVolume.data,
  }
}

export function useTotalVolumesInPoolsUser() {
  const { account } = useAccountStore()
  const apiIds = useApiIds()
  const uniques = useUniques(
    account?.address ?? "",
    apiIds.data?.omnipoolCollectionId ?? "",
  )
  const positions = useOmnipoolPositions(
    uniques.data?.map((u) => u.itemId) ?? [],
  )
  const assetIds = positions.map((p) => p.data?.assetId).filter(isNotNil) ?? []

  const totalVolume = usePoolsDetailsTradeVolumes(assetIds)

  const queries = [uniques, ...positions, totalVolume]
  const isLoading = queries.some((query) => query.isLoading)

  return {
    isLoading,
    value: totalVolume.data,
  }
}
