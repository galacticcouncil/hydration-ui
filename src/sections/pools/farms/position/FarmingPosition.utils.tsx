import {
  calculate_liquidity_lrna_out,
  calculate_liquidity_out,
} from "@galacticcouncil/math-omnipool"
import { u32 } from "@polkadot/types"
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
import BN from "bignumber.js"
import { useMemo } from "react"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { OMNIPOOL_ACCOUNT_ADDRESS } from "utils/api"
import { BN_10, BN_NAN } from "utils/constants"
import { useDisplayPrice, useDisplayPrices } from "utils/displayAsset"
import { normalizeBigNumber } from "utils/balance"
import { useRpcProvider } from "providers/rpcProvider"

export const useAllUserDepositShare = () => {
  const { assets } = useRpcProvider()
  const { account } = useAccount()
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
  const omnipoolAssetIds =
    omnipoolAssets.data?.map((asset) => asset.id.toString()) ?? []
  const omnipoolBalances = useTokensBalances(
    omnipoolAssetIds,
    OMNIPOOL_ACCOUNT_ADDRESS,
  )

  const lrnaMeta = apiIds.data?.hubId
    ? assets.getAsset(apiIds.data.hubId)
    : undefined

  const positionIds = useOmniPositionIds(depositIds ?? [])

  const positions = useOmnipoolPositions(
    positionIds.map((pos) => pos.data?.value),
  )

  const spotPrices = useDisplayPrices(omnipoolAssetIds)
  const lrnaSp = useDisplayPrice(apiIds.data?.hubId ?? "")

  const queries = [
    apiIds,
    omnipoolAssets,
    lrnaSp,
    spotPrices,
    ...omnipoolBalances,
    ...positions,
  ]
  const isLoading = queries.some((q) => q.isLoading)

  const data = useMemo(() => {
    const rows = positions.reduce(
      (memo, position) => {
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

        const spotPrice = spotPrices.data?.find(
          (spotPrice) =>
            spotPrice?.tokenIn === position.data?.assetId.toString(),
        )

        const meta = position.data?.assetId
          ? assets.getAsset(position.data?.assetId.toString())
          : undefined

        if (
          omnipoolBalance &&
          meta &&
          omnipoolAsset?.data &&
          position.data &&
          lrnaMeta &&
          spotPrice &&
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
            "0", // fee zero
          ]

          lernaOutResult = calculate_liquidity_lrna_out.apply(this, params)
          liquidityOutResult = calculate_liquidity_out.apply(this, params)

          const lrnaDp = BN_10.pow(lrnaMeta.decimals)
          const lrna =
            lernaOutResult !== "-1"
              ? new BN(lernaOutResult).div(lrnaDp)
              : BN_NAN

          const valueDp = BN_10.pow(meta.decimals)
          const value =
            liquidityOutResult !== "-1"
              ? new BN(liquidityOutResult).div(valueDp)
              : BN_NAN

          let valueDisplay = BN_NAN

          if (liquidityOutResult !== "-1" && spotPrice) {
            valueDisplay = value.times(spotPrice.spotPrice)

            if (lrna.gt(0)) {
              valueDisplay = !lrnaSp
                ? BN_NAN
                : valueDisplay.plus(lrna.times(lrnaSp.data.spotPrice))
            }
          }

          const providedAmount = normalizeBigNumber(
            position.data.amount,
          ).shiftedBy(-1 * meta.decimals)
          const providedAmountDisplay = spotPrice?.spotPrice
            ? providedAmount.times(spotPrice.spotPrice)
            : BN_NAN

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
              valueDisplay,
              providedAmount,
              providedAmountDisplay,
              lrna,
              symbol: meta.symbol,
            },
          ]
        }

        return memo
      },
      {} as Record<
        string,
        Array<
          OmnipoolPosition & {
            value: BN
            valueDisplay: BN
            lrna: BN
            symbol: string
            depositId: string | undefined
            providedAmountDisplay: BN
            providedAmount: BN
          }
        >
      >,
    )

    return rows
  }, [
    positions,
    omnipoolBalances,
    omnipoolAssets.data,
    spotPrices.data,
    assets,
    lrnaMeta,
    lrnaSp,
    positionIds,
  ])

  return { data, isLoading }
}

export const useDepositShare = (poolId: u32, depositNftId: string) => {
  const deposits = useAllUserDepositShare()

  const deposit = deposits.data[poolId.toString()]?.find(
    (deposit) => deposit.depositId === depositNftId,
  )

  return { data: deposit, isLoading: deposits.isLoading }
}
