import { OmnipoolPool } from "sections/pools/PoolsPage.utils"
import { useAccountStore } from "state/store"
import { useApiIds } from "api/consts"
import { useUniques } from "api/uniques"
import {
  OmnipoolPosition,
  useOmnipoolAssets,
  useOmnipoolPositions,
} from "api/omnipool"
import { isNotNil } from "utils/helpers"
import { useAssetMetaList } from "api/assetMeta"
import { useTokensBalances } from "api/balances"
import { OMNIPOOL_ACCOUNT_ADDRESS } from "utils/api"
import { useSpotPrices } from "api/spotPrice"
import { useMemo } from "react"
import { BN_0, BN_10, BN_NAN } from "utils/constants"
import BN from "bignumber.js"
import { calculate_liquidity_out } from "@galacticcouncil/math-omnipool"
import { useAllUserDepositShare } from "sections/pools/farms/position/FarmingPosition.utils"

export const useUsersTotalInPool = (pool: OmnipoolPool) => {
  const { account } = useAccountStore()
  const apiIds = useApiIds()
  const uniques = useUniques(
    account?.address ?? "",
    apiIds.data?.omnipoolCollectionId ?? "",
  )
  const positions = useOmnipoolPositions(
    uniques.data?.map((u) => u.itemId) ?? [],
  )
  const assetIds =
    positions.map((p) => p.data?.assetId.toString()).filter(isNotNil) ?? []
  const metas = useAssetMetaList([apiIds.data?.usdId.toString(), ...assetIds])
  const omnipoolAssets = useOmnipoolAssets()
  const omnipoolBalances = useTokensBalances(assetIds, OMNIPOOL_ACCOUNT_ADDRESS)
  const spotPrices = useSpotPrices(assetIds, apiIds.data?.usdId)

  const queries = [
    apiIds,
    uniques,
    metas,
    omnipoolAssets,
    ...positions,
    ...omnipoolBalances,
    ...spotPrices,
  ]
  const isLoading = queries.some((q) => q.isInitialLoading)

  const data = useMemo(() => {
    if (
      !apiIds.data ||
      !uniques.data ||
      !metas.data ||
      !omnipoolAssets.data ||
      positions.some((q) => !q.data) ||
      omnipoolBalances.some((q) => !q.data) ||
      spotPrices.some((q) => !q.data)
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
        ]

        const liquidityOutResult = calculate_liquidity_out.apply(this, params)
        if (liquidityOutResult === "-1") return BN_NAN

        const valueSp = spotPrices.find((sp) => sp.data?.tokenIn === id)
        const valueDp = BN_10.pow(meta.decimals.toBigNumber())
        const value = new BN(liquidityOutResult).div(valueDp)

        if (!valueSp?.data?.spotPrice) return BN_NAN

        const valueUSD = value.times(valueSp.data.spotPrice)

        return valueUSD
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

  const totalDepositValueUSD = poolDeposit.reduce(
    (memo, i) => memo.plus(i.valueUSD),
    BN_0,
  )

  return {
    locked: locked.data?.plus(totalDepositValueUSD ?? BN_0),
    available: locked.data,
    farming: totalDepositValueUSD ?? BN_0,
    isLoading: allPoolDeposits.isLoading || locked.isLoading,
  }
}
