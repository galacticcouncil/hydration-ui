import {
  calculate_liquidity_hub_in,
  calculate_shares,
  verify_asset_cap,
} from "@galacticcouncil/math-omnipool"
import { useMutation } from "@tanstack/react-query"
import Big from "big.js"
import { FieldError } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { z } from "zod"

import {
  useMaxAddLiquidityLimit,
  useOmnipoolAssetsData,
  useOmnipoolMinLiquidity,
} from "@/api/omnipool"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useAccountBalances } from "@/states/account"
import { useOmnipoolAsset } from "@/states/liquidity"
import { useTransactionsStore } from "@/states/transactions"
import { scale, scaleHuman } from "@/utils/formatting"
import { maxBalance, required } from "@/utils/validators"

export const getLimitShares = (shares: string, limit: number) => {
  return Big(shares).times(Big(100).minus(limit).div(100)).toFixed(0)
}

export const getCustomErrors = (errors?: FieldError) =>
  errors
    ? (errors as unknown as {
        cap?: { message: string }
        circuitBreaker?: { message: string }
        farm?: { message: string }
      })
    : undefined

export const useLiquidityShares = (assetId: string, value: string) => {
  const { dataMap: omnipoolAssetsData } = useOmnipoolAssetsData()
  const omnipoolAssetData = omnipoolAssetsData?.get(assetId)

  if (!omnipoolAssetData || !value) return undefined

  const {
    hubReserve,
    shares,
    balance: assetReserve,
    decimals,
  } = omnipoolAssetData

  const sharesToGet = calculate_shares(
    assetReserve,
    hubReserve,
    shares,
    scale(value, decimals),
  )

  const totalShares = Big(shares).plus(sharesToGet).toString()
  const poolShare = Big(sharesToGet).div(totalShares).times(100).toString()

  return { totalShares, poolShare, sharesToGet }
}

export const useAddToOmnipoolZod = (
  assetId: string,
  isStablepool?: boolean,
) => {
  const { t } = useTranslation("liquidity")
  const { data: omnipoolAsset } = useOmnipoolAsset(assetId)

  const { dataMap: omnipoolAssetsData, hubToken } = useOmnipoolAssetsData()
  const { data: minPoolLiquidity } = useOmnipoolMinLiquidity()
  const { data: maxAddLiquidityLimit } = useMaxAddLiquidityLimit()

  const { getBalance } = useAccountBalances()
  const accountBalance = getBalance(assetId)?.free ?? "0"

  const omnipoolAssetData = omnipoolAssetsData?.get(assetId)
  const hubBalance = hubToken?.balance

  if (
    !minPoolLiquidity ||
    !omnipoolAssetData ||
    !hubBalance ||
    !maxAddLiquidityLimit ||
    !omnipoolAsset
  )
    return undefined

  const { decimals, symbol } = omnipoolAsset.meta
  const { balance: assetReserve, hubReserve, shares, cap } = omnipoolAssetData

  const circuitBreakerLimit = scaleHuman(
    Big(maxAddLiquidityLimit).times(assetReserve).toString(),
    decimals,
  )

  const rules = required
    .pipe(
      isStablepool
        ? z.string()
        : maxBalance(scaleHuman(accountBalance, decimals)),
    )
    .refine(
      (value) => Big(scale(value, decimals)).gte(minPoolLiquidity.toString()),
      {
        message: t("liquidity.add.modal.validation.minPoolLiquidity"),
      },
    )
    .refine(
      (value) => {
        if (!value) return true

        const hubIn = calculate_liquidity_hub_in(
          assetReserve,
          hubReserve,
          shares,
          scale(value, decimals),
        )

        const isWithinLimit = verify_asset_cap(
          assetReserve,
          cap,
          hubIn,
          hubBalance,
        )

        return isWithinLimit
      },
      {
        message: t("liquidity.add.modal.validation.cap"),
        path: ["cap"],
      },
    )
    .refine(
      (value) => {
        if (!value) return true

        return Big(circuitBreakerLimit).gte(value)
      },
      {
        message: t("liquidity.add.modal.validation.circuitBreaker", {
          amount: circuitBreakerLimit,
          symbol,
        }),
        path: ["circuitBreaker"],
      },
    )

  return z.object({
    amount: rules,
  })
}

export const useSubmitAddLiquidity = () => {
  const { t } = useTranslation("liquidity")
  const { papi } = useRpcProvider()
  const createTransaction = useTransactionsStore((s) => s.createTransaction)

  return useMutation({
    mutationFn: async ({
      assetId,
      amount,
      shares,
      decimals,
      symbol,
    }: {
      assetId: string
      amount: string
      shares: string
      symbol: string
      decimals: number
    }): Promise<void> => {
      const tx = papi.tx.Omnipool.add_liquidity_with_limit({
        asset: Number(assetId),
        amount: BigInt(amount),
        min_shares_limit: BigInt(shares),
      })
      const shiftedAmount = scaleHuman(amount, decimals)
      await createTransaction({
        tx,
        toasts: {
          submitted: t("liquidity.add.modal.toast.submitted", {
            value: shiftedAmount,
            symbol: symbol,
            where: "Omnipool",
          }),
          success: t("liquidity.add.modal.toast.success", {
            value: shiftedAmount,
            symbol: symbol,
            where: "Omnipool",
          }),
          error: t("liquidity.add.modal.toast.submitted", {
            value: shiftedAmount,
            symbol: symbol,
            where: "Omnipool",
          }),
        },
      })
    },
  })
}
