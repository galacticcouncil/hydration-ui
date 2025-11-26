import {
  calculate_liquidity_hub_in,
  calculate_shares,
  verify_asset_cap,
} from "@galacticcouncil/math-omnipool"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useMutation } from "@tanstack/react-query"
import Big from "big.js"
import { FieldError, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { z, ZodType } from "zod/v4"

import { TAssetData } from "@/api/assets"
import { useOmnipoolFarms } from "@/api/farms"
import {
  useMaxAddLiquidityLimit,
  useOmnipoolAssetsData,
  useOmnipoolMinLiquidity,
} from "@/api/omnipool"
import { useMinOmnipoolFarmJoin } from "@/modules/liquidity/components/JoinFarms/JoinFarms.utils"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useAccountBalances } from "@/states/account"
import { useOmnipoolAsset } from "@/states/liquidity"
import { useTradeSettings } from "@/states/tradeSettings"
import { useTransactionsStore } from "@/states/transactions"
import { scale, scaleHuman } from "@/utils/formatting"
import { positive, required, validateFieldMaxBalance } from "@/utils/validators"

export type TAddLiquidityFormValues = { amount: string }

export const getCustomErrors = (errors?: FieldError) =>
  errors
    ? (errors as unknown as {
        cap?: { message: string }
        circuitBreaker?: { message: string }
        farm?: { message: string }
      })
    : undefined

export const useLiquidityOmnipoolShares = (assetId: string) => {
  const { dataMap: omnipoolAssetsData } = useOmnipoolAssetsData()
  const {
    liquidity: { slippage },
  } = useTradeSettings()
  const omnipoolAssetData = omnipoolAssetsData?.get(Number(assetId))

  const getOmnipoolGetShares = (value: string) => {
    if (!omnipoolAssetData || !value) return undefined

    const {
      hubReserves,
      shares,
      balance: assetReserve,
      decimals,
    } = omnipoolAssetData

    const sharesToGet = calculate_shares(
      assetReserve.toString(),
      hubReserves.toString(),
      shares.toString(),
      scale(value, decimals ?? 0),
    )

    const minSharesToGet = Big(sharesToGet)
      .times(100 - slippage)
      .div(100)
      .toFixed(0)

    const totalShares = Big(shares.toString()).plus(minSharesToGet).toString()
    const poolShare = Big(minSharesToGet).div(totalShares).times(100).toString()

    return { totalShares, poolShare, sharesToGet, minSharesToGet }
  }

  return getOmnipoolGetShares
}

export const useCheckJoinOmnipoolFarm = ({
  amount,
  meta,
  disabled = false,
}: {
  amount: string
  meta: TAssetData
  disabled?: boolean
}) => {
  const { t } = useTranslation("liquidity")
  const { data: omnipoolFarms } = useOmnipoolFarms()

  const activeFarms =
    omnipoolFarms?.[meta.id]?.filter((farm) => farm.apr !== "0") ?? []
  const minJoinAmount = useMinOmnipoolFarmJoin(activeFarms, meta) || "0"

  const isCheckJoinFarms =
    activeFarms.length > 0 && Big(amount).gt(0) && !disabled
  const joinFarmErrorMessage =
    isCheckJoinFarms && Big(amount).lte(minJoinAmount)
      ? t("liquidity.joinFarms.modal.validation.minShares", {
          value: minJoinAmount,
          symbol: meta.symbol,
        })
      : undefined

  const isJoinFarms = isCheckJoinFarms && !joinFarmErrorMessage

  return {
    activeFarms,
    isJoinFarms,
    joinFarmErrorMessage,
  }
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

  const omnipoolAssetData = omnipoolAssetsData?.get(Number(assetId))
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
  const { balance: assetReserve, hubReserves, shares, cap } = omnipoolAssetData

  const circuitBreakerLimit = scaleHuman(
    Big(maxAddLiquidityLimit).times(assetReserve.toString()).toString(),
    decimals,
  )

  const rules = required
    .pipe(positive)
    .check(
      ...(isStablepool
        ? []
        : [validateFieldMaxBalance(scaleHuman(accountBalance, decimals))]),
    )
    .refine(
      (value) => Big(scale(value, decimals)).gte(minPoolLiquidity.toString()),
      {
        error: t("liquidity.add.modal.validation.minPoolLiquidity"),
      },
    )
    .refine(
      (value) => {
        if (!value) return true

        const hubIn = calculate_liquidity_hub_in(
          assetReserve.toString(),
          hubReserves.toString(),
          shares.toString(),
          scale(value, decimals),
        )

        const isWithinLimit = verify_asset_cap(
          hubReserves.toString(),
          cap.toString(),
          hubIn,
          hubBalance.toString(),
        )

        return isWithinLimit
      },
      {
        error: t("liquidity.add.modal.validation.cap"),
        path: ["cap"],
      },
    )
    .refine(
      (value) => {
        if (!value) return true

        return Big(circuitBreakerLimit).gte(value)
      },
      {
        error: t("liquidity.add.modal.validation.circuitBreaker", {
          amount: circuitBreakerLimit,
          symbol,
        }),
        path: ["circuitBreaker"],
      },
    )

  return rules
}

export const useAddLiquidityForm = ({
  initialAmount,
  rule,
}: {
  initialAmount?: string
  rule?: ZodType<string, string> | undefined
}) => {
  const form = useForm<TAddLiquidityFormValues>({
    mode: "onChange",
    defaultValues: { amount: initialAmount ?? "" },
    resolver: rule
      ? standardSchemaResolver(z.object({ amount: rule }))
      : undefined,
  })

  return form
}

export const useAddLiquidity = (assetId: string) => {
  const { t } = useTranslation(["liquidity", "common"])
  const { papi } = useRpcProvider()
  const createTransaction = useTransactionsStore((s) => s.createTransaction)
  const { getAssetWithFallback } = useAssets()
  const { getTransferableBalance } = useAccountBalances()

  const meta = getAssetWithFallback(assetId)

  const addLiquidityZod = useAddToOmnipoolZod(assetId)

  const form = useAddLiquidityForm({
    initialAmount: "",
    rule: addLiquidityZod,
  })

  const amount = Big(form.watch("amount") || "0")

  const { isJoinFarms, joinFarmErrorMessage, activeFarms } =
    useCheckJoinOmnipoolFarm({
      amount: amount.toString(),
      meta,
    })
  const isFarms = activeFarms.length > 0
  const getOmnipoolGetShares = useLiquidityOmnipoolShares(assetId)
  const liquidityShares = getOmnipoolGetShares(amount.toString())

  const balance = scaleHuman(getTransferableBalance(assetId), meta.decimals)

  const mutation = useMutation({
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
      const tx = isJoinFarms
        ? papi.tx.OmnipoolLiquidityMining.add_liquidity_and_join_farms({
            asset: Number(assetId),
            amount: BigInt(amount),
            min_shares_limit: BigInt(shares),
            farm_entries: activeFarms.map((farm) => [
              farm.globalFarmId,
              farm.yieldFarmId,
            ]),
          })
        : papi.tx.Omnipool.add_liquidity_with_limit({
            asset: Number(assetId),
            amount: BigInt(amount),
            min_shares_limit: BigInt(shares),
          })

      const shiftedAmount = scaleHuman(amount, decimals)
      const tOptions = {
        value: t("common:currency", { value: shiftedAmount, symbol }),
        where: "Omnipool",
      }
      console.log(tOptions)

      await createTransaction({
        tx,
        toasts: {
          submitted: t(
            isJoinFarms
              ? "liquidity.add.joinFarms.modal.toast.submitted"
              : "liquidity.add.modal.toast.submitted",
            tOptions,
          ),
          success: t(
            isJoinFarms
              ? "liquidity.add.joinFarms.modal.toast.success"
              : "liquidity.add.modal.toast.success",
            tOptions,
          ),
        },
      })
    },
  })

  return {
    form,
    liquidityShares,
    balance,
    isFarms,
    activeFarms,
    meta,
    joinFarmErrorMessage,
    isJoinFarms,
    mutation,
  }
}
