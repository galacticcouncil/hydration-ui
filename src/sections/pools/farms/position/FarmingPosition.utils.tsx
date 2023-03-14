import {
  calculate_liquidity_lrna_out,
  calculate_liquidity_out,
} from "@galacticcouncil/math-omnipool"
import { u32 } from "@polkadot/types"
import { useAssetMeta } from "api/assetMeta"
import { useTokensBalances } from "api/balances"
import { useApiIds } from "api/consts"
import {
  useAccountDepositIds,
  useAllDeposits,
  useOmniPositionIds,
} from "api/deposits"
import {
  OmnipoolPosition,
  useOmnipoolAssets,
  useOmnipoolPositions,
} from "api/omnipool"
import { useSpotPrice, useSpotPrices } from "api/spotPrice"
import { OMNIPOOL_ACCOUNT_ADDRESS } from "utils/api"
import { BN_10, BN_NAN } from "utils/constants"
import BN from "bignumber.js"
import { useAssetMetaList } from "api/assetMeta"
import { useMemo } from "react"
import { useAccountStore } from "state/store"

export const useAllUserDepositShare = () => {
  const { account } = useAccountStore()
  const accountDepositIds = useAccountDepositIds(account?.address)
  const deposits = useAllDeposits()

  const ids = new Set<string>(
    accountDepositIds.data?.map((i) => i.instanceId.toString()),
  )

  const depositIds = deposits.data?.reduce((memo, item) => {
    if (ids.has(item.id.toString())) memo.push(item.id.toString())
    return memo
  }, [] as Array<string>)

  const apiIds = useApiIds()
  const omnipoolAssets = useOmnipoolAssets()
  const omnipoolAssetIds = omnipoolAssets.data?.map((asset) => asset.id) ?? []
  const omnipoolBalances = useTokensBalances(
    omnipoolAssetIds,
    OMNIPOOL_ACCOUNT_ADDRESS,
  )

  const metas = useAssetMetaList(omnipoolAssetIds)
  const lrnaMeta = useAssetMeta(apiIds.data?.hubId)

  const positionIds = useOmniPositionIds(depositIds ?? [])

  const positions = useOmnipoolPositions(
    positionIds.map((pos) => pos.data?.value),
  )

  const spotPrices = useSpotPrices(omnipoolAssetIds, apiIds.data?.usdId)
  const lrnaSp = useSpotPrice(apiIds.data?.hubId, apiIds.data?.usdId)

  const queries = [
    apiIds,
    omnipoolAssets,
    metas,
    lrnaMeta,
    lrnaSp,
    ...omnipoolBalances,
    ...positions,
    ...spotPrices,
  ]
  const isLoading = queries.some((q) => q.isInitialLoading)

  const data = useMemo(() => {
    const rows = positions.reduce((memo, position) => {
      const { data: omnipoolBalance } =
        omnipoolBalances.find(
          (omnipoolBalance) =>
            omnipoolBalance.data?.assetId.toString() ===
            position.data?.assetId.toString(),
        ) ?? {}

      const omnipoolAsset = omnipoolAssets.data?.find(
        (omnipoolAsset) =>
          omnipoolAsset.id.toString() === position.data?.assetId.toString(),
      )

      const spotPrice = spotPrices.find(
        (spotPrice) =>
          spotPrice.data?.tokenIn === position.data?.assetId.toString(),
      )

      const meta = metas.data?.find(
        (meta) => meta.id === position.data?.assetId.toString(),
      )

      if (
        omnipoolBalance &&
        meta &&
        omnipoolAsset?.data &&
        position.data &&
        lrnaMeta.data &&
        spotPrice?.data &&
        lrnaSp.data
      ) {
        let lernaOutResult = "-1"
        let liquidityOutResult = "-1"

        const [nom, denom] =
          position.data.price.map((n) => new BN(n.toString())) ?? []
        const price = nom.div(denom)
        const positionPrice = price.times(BN_10.pow(18))

        const params: Parameters<typeof calculate_liquidity_out> = [
          omnipoolBalance.balance.toString(),
          omnipoolAsset.data.hubReserve.toString(),
          omnipoolAsset.data.shares.toString(),
          position.data.amount.toString(),
          position.data.shares.toString(),
          positionPrice.toFixed(0),
          position.data.shares.toString(),
        ]

        lernaOutResult = calculate_liquidity_lrna_out.apply(this, params)
        liquidityOutResult = calculate_liquidity_out.apply(this, params)

        const lrnaDp = BN_10.pow(lrnaMeta.data.decimals.toNumber() ?? 12)
        const lrna =
          lernaOutResult !== "-1" ? new BN(lernaOutResult).div(lrnaDp) : BN_NAN

        const valueDp = BN_10.pow(meta.decimals.toNumber() ?? 12)
        const value =
          liquidityOutResult !== "-1"
            ? new BN(liquidityOutResult).div(valueDp)
            : BN_NAN

        let valueUSD = BN_NAN

        if (liquidityOutResult !== "-1" && spotPrice.data) {
          valueUSD = value.times(spotPrice.data.spotPrice)

          if (lrna.gt(0)) {
            valueUSD = !lrnaSp
              ? BN_NAN
              : valueUSD.plus(lrna.times(lrnaSp.data.spotPrice))
          }
        }
        const index = position.data?.assetId.toString()

        memo[index] = [
          ...(memo[index] ?? []),
          {
            ...position.data,
            depositId: positionIds
              .find(
                (pos) =>
                  pos.data?.value.toString() === position.data?.id.toString(),
              )
              ?.data?.depositionId.toString(),
            value,
            valueUSD,
            lrna,
            symbol: meta.symbol,
          },
        ]
      }

      return memo
    }, {} as Record<string, Array<OmnipoolPosition & { value: BN; valueUSD: BN; lrna: BN; symbol: string; depositId: string | undefined }>>)

    return rows
  }, [
    positions,
    omnipoolBalances,
    metas,
    omnipoolAssets,
    spotPrices,
    lrnaMeta,
    lrnaSp,
    positionIds,
  ])

  return { data, isLoading }
}

export const useDepositShare = (poolId: u32, depositNftId: string) => {
  const deposits = useAllUserDepositShare()

  const deposit = deposits.data[poolId.toString()].find(
    (deposit) => deposit.depositId === depositNftId,
  )

  return { data: deposit, isLoading: deposits.isLoading }
}
