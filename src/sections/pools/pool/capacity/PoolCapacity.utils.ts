import { useApiIds } from "api/consts"
import { useOmnipoolAssets } from "api/omnipool"
import { useTokensBalances } from "api/balances"
import { OMNIPOOL_ACCOUNT_ADDRESS } from "utils/api"
import { useMemo } from "react"
import { BN_NAN } from "utils/constants"
import BN from "bignumber.js"
import { calculate_cap_difference } from "@galacticcouncil/math-omnipool"
import { getFloatingPointAmount } from "utils/balance"
import { useRpcProvider } from "providers/rpcProvider"
import { useDisplayAssetStore } from "utils/displayAsset"

export const usePoolCapacity = (id: string) => {
  const { assets } = useRpcProvider()
  const { stableCoinId } = useDisplayAssetStore()

  const apiIds = useApiIds()
  const omnipoolAssets = useOmnipoolAssets()
  const balances = useTokensBalances(
    [apiIds.data?.hubId ?? "", stableCoinId ?? "", id],
    OMNIPOOL_ACCOUNT_ADDRESS,
  )
  const meta = assets.getAsset(id.toString())

  const queries = [apiIds, omnipoolAssets, ...balances]
  const isLoading = queries.some((q) => q.isInitialLoading)

  const data = useMemo(() => {
    if (!apiIds.data || !omnipoolAssets.data || balances.some((q) => !q.data))
      return undefined

    const asset = omnipoolAssets.data.find(
      (a) => a.id.toString() === id.toString(),
    )
    const assetUsd = omnipoolAssets.data.find(
      (a) => a.id.toString() === stableCoinId,
    )
    const assetBalance = balances.find(
      (b) => b.data?.assetId.toString() === id.toString(),
    )
    const hubBalance = balances.find(
      (b) => b.data?.assetId.toString() === apiIds.data.hubId.toString(),
    )
    const usdBalance = balances.find(
      (b) => b.data?.assetId.toString() === stableCoinId,
    )
    const symbol = meta.symbol

    if (
      !asset?.data ||
      !assetBalance?.data ||
      !hubBalance?.data ||
      !usdBalance?.data ||
      !assetUsd?.data
    )
      return {
        capacity: BN_NAN,
        filled: BN_NAN,
        filledPercent: BN_NAN,
        symbol,
      }

    const assetReserve = assetBalance.data.balance.toString()
    const assetHubReserve = asset.data.hubReserve.toString()
    const assetCap = asset.data.cap.toString()
    const totalHubReserve = hubBalance.data.total.toString()

    let capDifference = calculate_cap_difference(
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
      assetBalance.data.balance.plus(new BN(capDifference)),
      meta.decimals,
    )
    const filled = getFloatingPointAmount(
      assetBalance.data.balance,
      meta.decimals,
    )
    const filledPercent = filled.div(capacity).times(100)

    return { capacity, filled, filledPercent, symbol }
  }, [
    apiIds.data,
    omnipoolAssets.data,
    balances,
    meta.symbol,
    meta.decimals,
    id,
    stableCoinId,
  ])

  return { data, isLoading }
}
