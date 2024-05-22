import { u32 } from "@polkadot/types"
import { useTokensBalances } from "api/balances"
import { useOmniPositionIds, useUserDeposits } from "api/deposits"
import {
  OmnipoolPosition,
  useOmnipoolAssets,
  useOmnipoolPositions,
} from "api/omnipool"
import BN from "bignumber.js"
import { useMemo } from "react"
import { OMNIPOOL_ACCOUNT_ADDRESS } from "utils/api"
import { useDisplayPrice, useDisplayPrices } from "utils/displayAsset"
import { useRpcProvider } from "providers/rpcProvider"
import { useXYKDepositValues } from "sections/pools/PoolsPage.utils"
import { calculatePositionLiquidity } from "utils/omnipool"
import { BN_0 } from "utils/constants"

export const useOmnipoolDepositValues = (depositIds: string[]) => {
  const { assets } = useRpcProvider()
  const omnipoolAssets = useOmnipoolAssets()
  const omnipoolAssetIds =
    omnipoolAssets.data?.map((asset) => asset.id.toString()) ?? []
  const omnipoolBalances = useTokensBalances(
    omnipoolAssetIds,
    OMNIPOOL_ACCOUNT_ADDRESS,
  )

  const lrnaMeta = assets.hub

  const positionIds = useOmniPositionIds(depositIds ?? [])

  const positions = useOmnipoolPositions(
    positionIds.map((pos) => pos.data?.value),
  )

  const spotPrices = useDisplayPrices(omnipoolAssetIds)
  const lrnaSp = useDisplayPrice(lrnaMeta.id)

  const queries = [
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
          spotPrice &&
          lrnaSp.data
        ) {
          const {
            lrna,
            value,
            valueDisplay,
            providedAmount,
            providedAmountDisplay,
          } = calculatePositionLiquidity({
            position: position.data,
            omnipoolBalance: omnipoolBalance.balance,
            omnipoolHubReserve: omnipoolAsset.data.hubReserve,
            omnipoolShares: omnipoolAsset.data.shares,
            lrnaSpotPrice: lrnaSp.data.spotPrice,
            valueSpotPrice: spotPrice.spotPrice,
            lrnaDecimals: lrnaMeta.decimals,
            assetDecimals: meta.decimals,
          })

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

export const useDepositShare = (poolId: u32 | string, depositNftId: string) => {
  const deposits = useAllOmnipoolDeposits()

  const deposit = deposits.data[poolId.toString()]?.find(
    (deposit) => deposit.depositId === depositNftId,
  )

  return { data: deposit, isLoading: deposits.isLoading }
}

export const useAllOmnipoolDeposits = (address?: string) => {
  const { omnipoolDeposits } = useUserDeposits(address)

  return useOmnipoolDepositValues(omnipoolDeposits.map((deposit) => deposit.id))
}

export const useAllXYKDeposits = (address?: string) => {
  const { xykDeposits } = useUserDeposits(address)

  return useXYKDepositValues(xykDeposits)
}

export const useAllFarmDeposits = (address?: string) => {
  const omnipoolDepositValues = useAllOmnipoolDeposits(address)
  const xykDepositValues = useAllXYKDeposits(address)

  const isLoading =
    omnipoolDepositValues.isLoading || xykDepositValues.isLoading

  return {
    isLoading,
    omnipool: omnipoolDepositValues.data,
    xyk: xykDepositValues.data,
  }
}

export const useFarmDepositsTotal = (address?: string) => {
  const { isLoading, omnipool, xyk } = useAllFarmDeposits(address)

  const total = useMemo(() => {
    let poolsTotal = BN_0

    for (const poolId in omnipool) {
      const poolTotal = omnipool[poolId].reduce((memo, share) => {
        return memo.plus(share.valueDisplay)
      }, BN_0)
      poolsTotal = poolsTotal.plus(poolTotal)
    }

    const xykTotal = xyk.reduce((memo, deposit) => {
      if (deposit.amountUSD) return memo.plus(deposit.amountUSD)
      return memo
    }, BN_0)

    return poolsTotal.plus(xykTotal)
  }, [omnipool, xyk])

  return { isLoading: isLoading, value: total }
}
