import { calculate_liquidity_out } from "@galacticcouncil/math-omnipool"
import { useAssetMetaList } from "api/assetMeta"
import { useTokensBalances } from "api/balances"
import { useApiIds } from "api/consts"
import {
  OmnipoolPosition,
  useOmnipoolAssets,
  useOmnipoolPositions,
} from "api/omnipool"
import { useUniques } from "api/uniques"
import BN from "bignumber.js"
import { useMemo } from "react"
import { OmnipoolPool } from "sections/pools/PoolsPage.utils"
import { useAllUserDepositShare } from "sections/pools/farms/position/FarmingPosition.utils"
import { useAccountStore } from "state/store"
import { OMNIPOOL_ACCOUNT_ADDRESS } from "utils/api"
import { BN_0, BN_10, BN_NAN } from "utils/constants"
import { useDisplayAssetStore, useDisplayPrices } from "utils/displayAsset"
import { isNotNil } from "utils/helpers"

export const useUsersTotalInPool = (pool: OmnipoolPool) => {
  const { account } = useAccountStore()
  const apiIds = useApiIds()
  const displayAsset = useDisplayAssetStore()
  const uniques = useUniques(
    account?.address ?? "",
    apiIds.data?.omnipoolCollectionId ?? "",
  )
  const positions = useOmnipoolPositions(
    uniques.data?.map((u) => u.itemId) ?? [],
  )
  const assetIds =
    positions.map((p) => p.data?.assetId.toString()).filter(isNotNil) ?? []
  const metas = useAssetMetaList([displayAsset.id, ...assetIds])
  const omnipoolAssets = useOmnipoolAssets()
  const omnipoolBalances = useTokensBalances(assetIds, OMNIPOOL_ACCOUNT_ADDRESS)
  const spotPrices = useDisplayPrices(assetIds)

  const queries = [
    apiIds,
    uniques,
    metas,
    omnipoolAssets,
    spotPrices,
    ...positions,
    ...omnipoolBalances,
  ]
  const isLoading = queries.some((q) => q.isLoading)

  const data = useMemo(() => {
    if (
      !apiIds.data ||
      !uniques.data ||
      !metas.data ||
      !omnipoolAssets.data ||
      !spotPrices.data ||
      positions.some((q) => !q.data) ||
      omnipoolBalances.some((q) => !q.data)
    )
      return undefined

    const totals = positions
      .reduce(
        (acc, curr) =>
          curr.data?.assetId.toString() === pool.id.toString()
            ? [...acc, curr.data]
            : acc,
        [] as OmnipoolPosition[],
      )
      .map((position) => {
        const meta = metas.data.find(
          (m) => m.id.toString() === position.assetId.toString(),
        )
        const omnipoolAsset = omnipoolAssets.data.find(
          (a) => a.id.toString() === position.assetId.toString(),
        )
        const omnipoolBalance = omnipoolBalances.find(
          (b) => b.data?.assetId.toString() === position.assetId.toString(),
        )

        if (!meta || !omnipoolAsset?.data || !omnipoolBalance?.data)
          return BN_NAN

        const id = position.assetId.toString()

        const [nom, denom] = position.price.map((n) => new BN(n.toString()))
        const price = nom.div(denom)
        const positionPrice = price.times(BN_10.pow(18))

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

        const liquidityOutResult = calculate_liquidity_out.apply(this, params)
        if (liquidityOutResult === "-1") return BN_NAN

        const valueSp = spotPrices.data?.find((sp) => sp?.tokenIn === id)
        const valueDp = BN_10.pow(meta.decimals.toBigNumber())
        const value = new BN(liquidityOutResult).div(valueDp)

        if (!valueSp?.spotPrice) return BN_NAN

        const valueDisplay = value.times(valueSp.spotPrice)

        return valueDisplay
      })

    return totals.reduce((acc, total) => acc.plus(total), BN_0)
  }, [
    apiIds.data,
    uniques.data,
    metas.data,
    omnipoolAssets.data,
    positions,
    omnipoolBalances,
    spotPrices,
    pool.id,
  ])

  return { data, isLoading }
}

export const useFooterValues = (pool: OmnipoolPool) => {
  const locked = useUsersTotalInPool(pool)
  const allPoolDeposits = useAllUserDepositShare()
  const poolDeposit = allPoolDeposits.data?.[pool.id.toString()] ?? []

  const totalDepositValueDisplay = poolDeposit.reduce(
    (memo, i) => memo.plus(i.valueDisplay),
    BN_0,
  )

  return {
    locked: locked.data?.plus(totalDepositValueDisplay ?? BN_0),
    available: locked.data,
    farming: totalDepositValueDisplay ?? BN_0,
    isLoading: allPoolDeposits.isLoading || locked.isLoading,
  }
}
