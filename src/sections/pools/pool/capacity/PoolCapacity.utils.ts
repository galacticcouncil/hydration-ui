import { OmnipoolPool } from "sections/pools/PoolsPage.utils"
import { useApiIds } from "api/consts"
import { useOmnipoolAssets } from "api/omnipool"
import { useTokenBalance } from "api/balances"
import { OMNIPOOL_ACCOUNT_ADDRESS } from "utils/api"
import { useMemo } from "react"
import { BN_NAN } from "utils/constants"
import BN from "bignumber.js"
import { calculate_cap_difference } from "@galacticcouncil/math/build/omnipool/bundler"
import { useAssetMeta } from "api/assetMeta"

export const usePoolCapacity = (pool: OmnipoolPool) => {
  const apiIds = useApiIds()
  const assets = useOmnipoolAssets()
  const hubBalance = useTokenBalance(
    apiIds.data?.hubId,
    OMNIPOOL_ACCOUNT_ADDRESS,
  )
  const poolBalance = useTokenBalance(pool.id, OMNIPOOL_ACCOUNT_ADDRESS)
  const meta = useAssetMeta(pool.id)

  const queries = [apiIds, assets, hubBalance, poolBalance, meta]
  const isLoading = queries.some((q) => q.isLoading)

  const data = useMemo(() => {
    if (!apiIds.data || !assets.data || !hubBalance.data || !poolBalance.data)
      return undefined

    const asset = assets.data.find(
      (a) => a.id.toString() === pool.id.toString(),
    )
    const symbol = meta.data?.symbol ?? "N/A"

    if (!asset?.data)
      return { capacity: BN_NAN, filled: BN_NAN, filledPercent: BN_NAN, symbol }

    const assetHubReserve = asset.data.hubReserve.toString()
    const assetCap = asset.data.cap.toString()
    const totalHubReserve = hubBalance.data.balance.toString()

    const capDifference = calculate_cap_difference(
      assetHubReserve,
      assetCap,
      totalHubReserve,
    )

    if (capDifference === "-1")
      return { capacity: BN_NAN, filled: BN_NAN, filledPercent: BN_NAN, symbol }

    const capacity = poolBalance.data.balance.plus(new BN(capDifference))
    const filled = poolBalance.data.balance
    const filledPercent = filled.div(capacity).times(100)

    console.table([
      ["asset_id", asset.id.toString()],
      ["asset_hub_reserve", assetHubReserve],
      ["asset_cap", assetCap],
      ["total_hub_reserve", totalHubReserve],
      ["calculate_cap_difference", capDifference],
    ])

    return { capacity, filled, filledPercent, symbol }
  }, [
    apiIds.data,
    assets.data,
    hubBalance.data,
    meta.data,
    pool.id,
    poolBalance.data,
  ])

  return { data, isLoading }
}
