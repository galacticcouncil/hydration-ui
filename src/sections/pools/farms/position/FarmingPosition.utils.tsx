import {
  calculate_liquidity_lrna_out,
  calculate_liquidity_out,
} from "@galacticcouncil/math-omnipool"
import { u32 } from "@polkadot/types"
import { useAssetMeta } from "api/assetMeta"
import { useTokenBalance } from "api/balances"
import { useApiIds } from "api/consts"
import { useOmniPositionId } from "api/deposits"
import { useOmnipoolAsset, useOmnipoolPosition } from "api/omnipool"
import { useSpotPrice } from "api/spotPrice"
import { OMNIPOOL_ACCOUNT_ADDRESS } from "utils/api"
import { BN_10, BN_NAN } from "utils/constants"
import BN from "bignumber.js"
import { useMemo } from "react"

export const useDepositShare = (poolId: u32, depositNftId: string) => {
  const apiIds = useApiIds()
  const omnipoolBalance = useTokenBalance(poolId, OMNIPOOL_ACCOUNT_ADDRESS)
  const omnipoolAsset = useOmnipoolAsset(poolId)

  const meta = useAssetMeta(poolId)
  const lrnaMeta = useAssetMeta(apiIds.data?.hubId)

  const positionId = useOmniPositionId(depositNftId)
  const position = useOmnipoolPosition(positionId.data?.value)

  const valueSp = useSpotPrice(position.data?.assetId, apiIds.data?.usdId)
  const lrnaSp = useSpotPrice(apiIds.data?.hubId, apiIds.data?.usdId)

  const queries = [
    apiIds,
    omnipoolBalance,
    omnipoolAsset,
    meta,
    lrnaMeta,
    positionId,
    position,
    valueSp,
    lrnaSp,
  ]
  const isLoading = queries.some((q) => q.isInitialLoading)

  const data = useMemo(() => {
    if (
      !(
        omnipoolBalance.data &&
        omnipoolAsset.data &&
        position.data &&
        lrnaMeta.data &&
        meta.data &&
        valueSp.data &&
        lrnaSp.data
      )
    )
      return null

    let lernaOutResult = "-1"
    let liquidityOutResult = "-1"

    const [nom, denom] =
      position.data.price.map((n) => new BN(n.toString())) ?? []
    const price = nom.div(denom)
    const positionPrice = price.times(BN_10.pow(18))

    const params: Parameters<typeof calculate_liquidity_out> = [
      omnipoolBalance.data.balance.toString(),
      omnipoolAsset.data.hubReserve.toString(),
      omnipoolAsset.data.shares.toString(),
      position.data.amount.toString(),
      position.data.shares.toString(),
      positionPrice.toFixed(0),
      position.data.shares.toString(),
    ]

    lernaOutResult = calculate_liquidity_lrna_out.apply(this, params)
    liquidityOutResult = calculate_liquidity_out.apply(this, params)

    const lrnaDp = BN_10.pow(lrnaMeta.data?.decimals.toNumber() ?? 12)
    const lrna =
      lernaOutResult !== "-1" ? new BN(lernaOutResult).div(lrnaDp) : BN_NAN

    const valueDp = BN_10.pow(meta.data?.decimals.toNumber() ?? 12)
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

    return {
      ...position.data,
      value,
      valueUSD,
      lrna,
      symbol: meta.data?.symbol,
    }
  }, [
    position.data,
    omnipoolBalance.data,
    omnipoolAsset.data,
    lrnaMeta.data,
    meta.data,
    valueSp.data,
    lrnaSp.data,
  ])

  return { data, isLoading }
}
