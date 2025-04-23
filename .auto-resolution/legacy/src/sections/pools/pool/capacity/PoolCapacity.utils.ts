import { useOmnipoolDataObserver } from "api/omnipool"
import { useTokenBalance } from "api/balances"
import { OMNIPOOL_ACCOUNT_ADDRESS } from "utils/api"
import { useMemo } from "react"
import { BN_NAN } from "utils/constants"
import BN from "bignumber.js"
import { getFloatingPointAmount } from "utils/balance"
import { OmniMath } from "@galacticcouncil/sdk"
import { useAssets } from "providers/assets"

export const usePoolCapacity = (id: string) => {
  const { hub, getAssetWithFallback } = useAssets()

  const omnipoolAssets = useOmnipoolDataObserver()
  const hubBalance = useTokenBalance(hub.id, OMNIPOOL_ACCOUNT_ADDRESS)

  const isLoading = omnipoolAssets.isLoading || hubBalance.isLoading

  const data = useMemo(() => {
    if (!omnipoolAssets.dataMap || !hubBalance.data) return undefined

    const asset = omnipoolAssets.dataMap.get(id)

    if (!asset || !hubBalance?.data)
      return {
        capacity: BN_NAN,
        filled: BN_NAN,
        filledPercent: BN_NAN,
        symbol: "N/a",
      }

    const meta = getAssetWithFallback(asset.id)
    const symbol = meta.symbol
    const assetReserve = asset.balance
    const assetHubReserve = asset.hubReserve
    const assetCap = asset.cap
    const totalHubReserve = hubBalance.data.total.toString()

    const capDifference = OmniMath.calculateCapDifference(
      assetReserve,
      assetHubReserve,
      assetCap,
      totalHubReserve,
    )

    if (capDifference === "-1")
      return {
        capacity: BN_NAN,
        filled: BN_NAN,
        filledPercent: BN_NAN,
        symbol,
      }

    const capacity = getFloatingPointAmount(
      BN(asset.balance).plus(BN(capDifference)),
      meta.decimals,
    )
    const filled = getFloatingPointAmount(asset.balance, meta.decimals)
    const filledPercent = filled.div(capacity).times(100)

    return { capacity, filled, filledPercent, symbol }
  }, [getAssetWithFallback, hubBalance.data, id, omnipoolAssets.dataMap])

  return { data, isLoading }
}
