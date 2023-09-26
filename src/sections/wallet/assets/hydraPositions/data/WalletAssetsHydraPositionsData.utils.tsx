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

        const [nom, denom] = position.price.map((n) => new BN(n.toString()))
        const price = nom.div(denom)
        const positionPrice = price.times(BN_10.pow(18))

        let lernaOutResult = "-1"
        let liquidityOutResult = "-1"

        if (omnipoolBalance?.data && omnipoolAsset?.data) {
          const params: Parameters<typeof calculate_liquidity_out> = [
            omnipoolBalance.data.balance.toString(),
            omnipoolAsset.data.hubReserve.toString(),
            omnipoolAsset.data.shares.toString(),
            position.amount.toString(),
            position.shares.toString(),
            positionPrice.toFixed(0),
            position.shares.toString(),
            "0", // fee zero
          ]
          lernaOutResult = calculate_liquidity_lrna_out.apply(this, params)
          liquidityOutResult = calculate_liquidity_out.apply(this, params)
        }

        const lrnaSp = spotPrices.data?.find(
          (sp) => sp?.tokenIn === apiIds.data.hubId,
        )
        const lrnaDp = BN_10.pow(lrnaMeta.decimals)
        const lrna =
          lernaOutResult !== "-1" ? new BN(lernaOutResult).div(lrnaDp) : BN_NAN

        const valueSp = spotPrices.data?.find((sp) => sp?.tokenIn === assetId)
        const valueDp = BN_10.pow(meta.decimals)
        const value =
          liquidityOutResult !== "-1"
            ? new BN(liquidityOutResult).div(valueDp)
            : BN_NAN
        let valueDisplay = BN_NAN

        const providedAmount = position.amount.toBigNumber().div(valueDp)
        let providedAmountDisplay = BN_NAN

        const shares = position.shares.toBigNumber()

        if (liquidityOutResult !== "-1" && valueSp?.spotPrice) {
          valueDisplay = value.times(valueSp.spotPrice)

          if (lrna.gt(0)) {
            valueDisplay = !lrnaSp?.spotPrice
              ? BN_NAN
              : valueDisplay.plus(lrna.times(lrnaSp.spotPrice))
          }
        }

        if (valueSp?.spotPrice)
          providedAmountDisplay = providedAmount.times(valueSp.spotPrice)

        const result = {
          id: position.id.toString(),
          assetId,
          symbol,
          name,
          lrna,
          value,
          valueDisplay,
          price,
          providedAmountShifted: providedAmount,
          providedAmount: position.amount.toBigNumber(),
          providedAmountDisplay,
          shares,
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
