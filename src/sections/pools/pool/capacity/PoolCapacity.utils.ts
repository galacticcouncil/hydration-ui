import { useOmnipoolDataObserver } from "api/omnipool"
import { useMemo } from "react"
import { BN_NAN } from "utils/constants"
import BN from "bignumber.js"
import { getFloatingPointAmount } from "utils/balance"
import { OmniMath } from "@galacticcouncil/sdk"
import { useAssets } from "providers/assets"

export const usePoolCapacity = (id: string) => {
  const { getAssetWithFallback } = useAssets()

  const omnipoolAssets = useOmnipoolDataObserver()
  const hubBalance = omnipoolAssets.hubToken?.balance

  const isLoading = omnipoolAssets.isLoading

  const data = useMemo(() => {
    if (!omnipoolAssets.dataMap || !hubBalance) return undefined

    const asset = omnipoolAssets.dataMap.get(id)

    if (!asset || !hubBalance)
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
    const totalHubReserve = hubBalance

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
  }, [getAssetWithFallback, hubBalance, id, omnipoolAssets.dataMap])

  return { data, isLoading }
}
