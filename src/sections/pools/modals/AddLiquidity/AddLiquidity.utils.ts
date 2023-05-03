import {
  calculate_liquidity_hub_in,
  calculate_shares,
  verify_asset_cap,
} from "@galacticcouncil/math-omnipool"
import { u32 } from "@polkadot/types"
import { useAssetMeta } from "api/assetMeta"
import { useTokenBalance } from "api/balances"
import { useApiIds, useMaxAddLiquidityLimit } from "api/consts"
import { useOmnipoolAsset, useOmnipoolFee } from "api/omnipool"
import { useSpotPrice } from "api/spotPrice"
import BigNumber from "bignumber.js"
import { useMemo } from "react"
import { useAccountStore } from "state/store"
import { OMNIPOOL_ACCOUNT_ADDRESS } from "utils/api"
import { BN_10 } from "utils/constants"
import { getFixedPointAmount } from "utils/balance"

export const useAddLiquidity = (assetId: u32 | string, assetValue?: string) => {
  const omnipoolBalance = useTokenBalance(assetId, OMNIPOOL_ACCOUNT_ADDRESS)
  const ommipoolAsset = useOmnipoolAsset(assetId)
  const { data: assetMeta } = useAssetMeta(assetId)

  const { data: apiIds } = useApiIds()
  const { data: spotPrice } = useSpotPrice(assetId, apiIds?.usdId)

  const { data: omnipoolFee } = useOmnipoolFee()

  const { account } = useAccountStore()
  const { data: assetBalance } = useTokenBalance(assetId, account?.address)

  const calculatedShares = useMemo(() => {
    if (ommipoolAsset.data && assetValue && assetMeta) {
      const { hubReserve, shares } = ommipoolAsset.data

      const assetReserve = omnipoolBalance.data?.balance.toString()
      const amount = BigNumber(assetValue)
        .multipliedBy(BN_10.pow(assetMeta.decimals.toNumber()))
        .toString()

      if (assetReserve && hubReserve && shares && amount) {
        return calculate_shares(
          assetReserve,
          hubReserve.toString(),
          shares.toString(),
          amount,
        )
      }
    }
    return null
  }, [omnipoolBalance, assetValue, ommipoolAsset, assetMeta])

  return { calculatedShares, spotPrice, omnipoolFee, assetMeta, assetBalance }
}

export const useVerifyLimits = ({
  assetId,
  amount,
  decimals,
}: {
  assetId: string
  amount: string
  decimals: number
}) => {
  const apiIds = useApiIds()
  const asset = useOmnipoolAsset(assetId)
  const assetMeta = useAssetMeta(assetId)
  const hubBalance = useTokenBalance(
    apiIds.data?.hubId,
    OMNIPOOL_ACCOUNT_ADDRESS,
  )
  const poolBalance = useTokenBalance(assetId, OMNIPOOL_ACCOUNT_ADDRESS)
  const maxAddLiquidityLimit = useMaxAddLiquidityLimit()

  const queries = [apiIds, hubBalance, maxAddLiquidityLimit, assetMeta]
  const isLoading = queries.some((q) => q.isLoading)

  const data = useMemo(() => {
    if (
      !apiIds.data ||
      !asset.data ||
      !hubBalance.data ||
      !poolBalance.data ||
      !amount ||
      !maxAddLiquidityLimit.data
    )
      return undefined

    const assetReserve = poolBalance.data.balance.toString()
    const assetHubReserve = asset.data.hubReserve.toString()
    const assetShares = asset.data.shares.toString()
    const assetCap = asset.data.cap.toString()
    const totalHubReserve = hubBalance.data.total.toString()
    const amountIn = getFixedPointAmount(amount, decimals).toFixed(0)
    const circuitBreakerLimit = maxAddLiquidityLimit.data
      .multipliedBy(assetReserve)
      .div(BN_10.pow(assetMeta.data?.decimals.toString() ?? 12))
      .toFixed(4)
    const isWithinCircuitBreakerLimit =
      BigNumber(circuitBreakerLimit).gte(amount)

    const hubIn = calculate_liquidity_hub_in(
      assetReserve,
      assetHubReserve,
      assetShares,
      amountIn,
    )

    const isWithinLimit = verify_asset_cap(
      assetHubReserve,
      assetCap,
      hubIn,
      totalHubReserve,
    )

    return {
      cap: isWithinLimit,
      circuitBreaker: {
        isWithinLimit: isWithinCircuitBreakerLimit,
        maxValue: circuitBreakerLimit,
      },
    }
  }, [
    apiIds.data,
    asset.data,
    hubBalance.data,
    poolBalance.data,
    amount,
    decimals,
    maxAddLiquidityLimit.data,
    assetMeta.data?.decimals,
  ])

  return { data, isLoading }
}
