import { useAccountAssetBalances } from "api/accountBalances"
import { useAssetMetaList } from "api/assetMeta"
import { useApiIds } from "api/consts"
import { useOmnipoolAssets, useOmnipoolPositions } from "api/omnipool"
import { useSpotPrices } from "api/spotPrice"
import { useUniques } from "api/uniques"
import { HYDRA_TREASURE_ACCOUNT, OMNIPOOL_ACCOUNT_ADDRESS } from "utils/api"
import { BN_0, BN_10, BN_NAN } from "utils/constants"
import { isNotNil } from "utils/helpers"
import BN from "bignumber.js"
import { useMemo } from "react"
import {
  calculate_liquidity_lrna_out,
  calculate_liquidity_out,
} from "@galacticcouncil/math-omnipool"
import { useTokensBalances } from "api/balances"

export const useTotalPolValue = () => {
  const omnipoolAssets = useOmnipoolAssets()
  const apiIds = useApiIds()

  // get all NFTs on HYDRA_TREASURE_ACCOUNT
  const uniques = useUniques(
    HYDRA_TREASURE_ACCOUNT,
    apiIds.data?.omnipoolCollectionId ?? "",
  )

  // details of each NFT position of HYDRA_TREASURE_ACCOUNT
  const positions = useOmnipoolPositions(
    uniques.data?.map((u) => u.itemId) ?? [],
  )

  // get balance of each omnipool asset
  const omnipoolAssetsBalance = useAccountAssetBalances(
    omnipoolAssets.data?.map((asset) => [
      OMNIPOOL_ACCOUNT_ADDRESS,
      asset.id.toString(),
    ]) ?? [],
  )

  const positionsAssetId = new Set(
    positions.map((query) => query.data?.assetId.toString()).filter(isNotNil),
  )

  const assetIds = new Set([
    apiIds.data?.hubId,
    apiIds.data?.usdId,
    ...positionsAssetId,
    ...(omnipoolAssets.data?.map((asset) => asset.id.toString()) ?? []),
  ])

  const metas = useAssetMetaList([...assetIds])

  // get a balance of each NFT position on HYDRA_TREASURE_ACCOUNT
  const omnipoolBalances = useTokensBalances(
    [...positionsAssetId],
    HYDRA_TREASURE_ACCOUNT,
  )

  const spotPrices = useSpotPrices([...assetIds], apiIds.data?.usdId)

  const queries = [
    apiIds,
    uniques,
    metas,
    omnipoolAssets,
    omnipoolAssetsBalance,
    ...positions,
    ...omnipoolBalances,
    ...spotPrices,
  ]

  const isLoading = queries.some((q) => q.isInitialLoading)

  const data = useMemo(() => {
    if (
      !uniques.data ||
      !metas.data ||
      !omnipoolAssets.data ||
      !apiIds.data ||
      !omnipoolAssetsBalance.data ||
      positions.some((q) => !q.data) ||
      omnipoolBalances.some((q) => !q.data) ||
      spotPrices.some((q) => !q.data)
    )
      return []

    // get a price of each position of HYDRA_TREASURE_ACCOUNT and filter it
    const assetsPositions = positions.reduce((acc, query) => {
      const position = query.data
      if (!position) return {}

      const assetId = position.assetId.toString()
      const meta = metas.data.find((m) => m.id.toString() === assetId)

      const lrnaMeta = metas.data.find(
        (m) => m.id.toString() === apiIds.data.hubId,
      )
      const omnipoolAsset = omnipoolAssets.data.find(
        (a) => a.id.toString() === assetId,
      )
      const omnipoolBalance = omnipoolBalances.find(
        (b) => b.data?.assetId.toString() === assetId,
      )

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

      const lrnaSp = spotPrices.find(
        (sp) => sp.data?.tokenIn === apiIds.data.hubId,
      )
      const lrnaDp = BN_10.pow(lrnaMeta?.decimals.toNumber() ?? 12)
      const lrna =
        lernaOutResult !== "-1" ? new BN(lernaOutResult).div(lrnaDp) : BN_NAN

      const valueSp = spotPrices.find((sp) => sp.data?.tokenIn === assetId)
      const valueDp = BN_10.pow(meta?.decimals.toNumber() ?? 12)
      const value =
        liquidityOutResult !== "-1"
          ? new BN(liquidityOutResult).div(valueDp)
          : BN_NAN
      let valueUSD = BN_NAN

      if (liquidityOutResult !== "-1" && valueSp?.data) {
        valueUSD = value.times(valueSp.data.spotPrice)

        if (lrna.gt(0)) {
          valueUSD = !lrnaSp?.data
            ? BN_NAN
            : valueUSD.plus(lrna.times(lrnaSp.data.spotPrice))
        }
      }

      return { ...acc, [assetId]: valueUSD.plus(acc[assetId] ?? BN_0) }
    }, {} as { [key: string]: BN })

    const total = omnipoolAssets.data.reduce((acc, omnipoolAsset) => {
      const assetId = omnipoolAsset.id.toString()
      const shares = omnipoolAsset.data.shares.toBigNumber()
      const protocolShares = omnipoolAsset.data.protocolShares.toBigNumber()

      const meta = metas.data.find((meta) => meta.id === assetId)

      const assetBalance = omnipoolAssetsBalance.data?.find(
        (omnipoolAssetBalance) =>
          omnipoolAssetBalance.assetId === omnipoolAsset.id.toString(),
      )
      const spotPrice = spotPrices.find((sp) => sp.data?.tokenIn === assetId)

      const free = BN(assetBalance?.free.toString() ?? "").div(
        BN_10.pow(meta?.decimals.toNumber() ?? 12),
      )

      if (!free || !assetBalance) return acc

      const valueOfShares = protocolShares
        .div(shares)
        .multipliedBy(free)
        .multipliedBy(spotPrice?.data?.spotPrice ?? 1)

      const valueOfLiquidityPositions = assetsPositions[assetId] ?? BN_0

      const pol = valueOfLiquidityPositions.plus(valueOfShares)

      return acc.plus(pol)
    }, BN_0)

    return total
  }, [
    uniques.data,
    metas.data,
    omnipoolAssets.data,
    apiIds.data,
    positions,
    omnipoolBalances,
    spotPrices,
    omnipoolAssetsBalance.data,
  ])

  return {
    data,
    isLoading,
  }
}
