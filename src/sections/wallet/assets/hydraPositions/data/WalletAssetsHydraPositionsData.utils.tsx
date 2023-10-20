import {
  calculate_liquidity_lrna_out,
  calculate_liquidity_out,
} from "@galacticcouncil/math-omnipool"
import { useTokensBalances } from "api/balances"
import { useApiIds } from "api/consts"
import { useOmnipoolAssets, useOmnipoolPositions } from "api/omnipool"
import { useUniques } from "api/uniques"
import BN from "bignumber.js"
import { useMemo } from "react"
import { HydraPositionsTableData } from "sections/wallet/assets/hydraPositions/WalletAssetsHydraPositions.utils"
import { useAccountStore } from "state/store"
import { OMNIPOOL_ACCOUNT_ADDRESS } from "utils/api"
import { BN_10, BN_NAN } from "utils/constants"
import { useDisplayPrices } from "utils/displayAsset"
import { isNotNil } from "utils/helpers"
import { useRpcProvider } from "providers/rpcProvider"
import { calculatePositionLiquidity } from "utils/omnipool"

export const useHydraPositionsData = () => {
  const { account } = useAccountStore()
  const { assets } = useRpcProvider()
  const apiIds = useApiIds()
  const uniques = useUniques(
    account?.address ?? "",
    apiIds.data?.omnipoolCollectionId ?? "",
  )
  const positions = useOmnipoolPositions(
    uniques.data?.map((u) => u.itemId) ?? [],
  )

  const omnipoolAssets = useOmnipoolAssets()
  const omnipoolBalances = useTokensBalances(
    positions.map((p) => p.data?.assetId).filter(isNotNil) ?? [],
    OMNIPOOL_ACCOUNT_ADDRESS,
  )
  const spotPrices = useDisplayPrices([
    apiIds.data?.hubId ?? "",
    ...(positions?.map((p) => p.data?.assetId.toString() ?? "") ?? []),
  ])

  const queries = [
    apiIds,
    uniques,
    omnipoolAssets,
    spotPrices,
    ...positions,
    ...omnipoolBalances,
  ]
  const isLoading = queries.some((q) => q.isLoading)

  const data = useMemo(() => {
    if (
      !uniques.data ||
      !omnipoolAssets.data ||
      !apiIds.data ||
      !spotPrices.data ||
      positions.some((q) => !q.data) ||
      omnipoolBalances.some((q) => !q.data)
    )
      return []

    const rows: HydraPositionsTableData[] = positions
      .map((query) => {
        const position = query.data
        if (!position) return null

        const assetId = position.assetId.toString()
        const meta = assets.getAsset(assetId)
        const lrnaMeta = assets.getAsset(apiIds.data.hubId)
        const omnipoolAsset = omnipoolAssets.data.find(
          (a) => a.id.toString() === assetId,
        )
        const omnipoolBalance = omnipoolBalances.find(
          (b) => b.data?.assetId.toString() === assetId,
        )

        const symbol = meta.symbol
        const name = meta.name

        const lrnaSp = spotPrices.data?.find(
          (sp) => sp?.tokenIn === apiIds.data.hubId,
        )

        const valueSp = spotPrices.data?.find((sp) => sp?.tokenIn === assetId)

        const liquidityValues = calculatePositionLiquidity({
          position,
          omnipoolBalance: omnipoolBalance?.data?.balance ?? BN(0),
          omnipoolHubReserve: omnipoolAsset?.data.hubReserve,
          omnipoolShares: omnipoolAsset?.data.shares,
          lrnaSpotPrice: lrnaSp?.spotPrice ?? BN(0),
          valueSpotPrice: valueSp?.spotPrice ?? BN(0),
          lrnaDecimals: lrnaMeta.decimals,
          assetDecimals: meta.decimals,
        })

        const result = {
          id: position.id.toString(),
          assetId,
          symbol,
          name,
          ...liquidityValues,
        }

        return result
      })
      .filter((x): x is HydraPositionsTableData => x !== null)
      .sort((a, b) => parseInt(a.id) - parseInt(b.id))

    return rows
  }, [
    uniques.data,
    omnipoolAssets.data,
    apiIds.data,
    spotPrices.data,
    positions,
    omnipoolBalances,
    assets,
  ])

  return {
    data,
    isLoading,
    refetch: uniques.refetch,
  }
}
