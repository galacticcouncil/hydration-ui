import { calculate_liquidity_out_one_asset } from "@galacticcouncil/math-stableswap"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useMutation } from "@tanstack/react-query"
import Big from "big.js"
import { useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { prop } from "remeda"
import * as z from "zod/v4"

import { TAssetData, TStableswap } from "@/api/assets"
import { StableSwapBase } from "@/api/pools"
import { TSelectedAsset } from "@/components/AssetSelect/AssetSelect"
import { TAssetWithBalance } from "@/components/AssetSelectModal/AssetSelectModal.utils"
import { TRemoveLiquidityFormValues } from "@/modules/liquidity/components/RemoveLiquidity/RemoveLiquidity.utils"
import { calculatePoolFee, TReserve } from "@/modules/liquidity/Liquidity.utils"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useAccountBalances } from "@/states/account"
import { useTradeSettings } from "@/states/tradeSettings"
import { useTransactionsStore } from "@/states/transactions"
import { scale, scaleHuman } from "@/utils/formatting"
import { positive, required, validateFieldMaxBalance } from "@/utils/validators"

export type TRemoveStablepoolLiquidityFormValues =
  TRemoveLiquidityFormValues & {
    split: boolean
    receiveAsset: TAssetData
    receiveAmount: string
  }

export const useStablepoolRemoveLiquidity = ({
  pool,
  reserves,
  initialReceiveAsset,
}: {
  pool: StableSwapBase
  reserves: TReserve[]
  initialReceiveAsset: TAssetWithBalance
}) => {
  const { t } = useTranslation("liquidity")
  const { getAssetWithFallback } = useAssets()
  const { papi } = useRpcProvider()
  const createTransaction = useTransactionsStore(prop("createTransaction"))
  const {
    liquidity: { slippage },
  } = useTradeSettings()

  const { getTransferableBalance } = useAccountBalances()
  const meta = getAssetWithFallback(pool.id) as TStableswap
  const fee = calculatePoolFee(pool.fee)

  const balanceShifted = scaleHuman(
    getTransferableBalance(pool.id.toString()).toString(),
    meta.decimals,
  )

  const form = useRemoveStablepoolLiquidityForm({
    receiveAsset: initialReceiveAsset,
    balance: balanceShifted,
    asset: { ...meta, iconId: meta.underlyingAssetId },
  })

  const removeAmountShifted = form.watch("amount") || "0"
  const removeAmount = Big(scale(removeAmountShifted, meta.decimals)).toFixed(0)
  const receiveAsset = form.watch("receiveAsset")
  const split = form.watch("split")
  const totalIssuance = pool.totalIssuance.toString()

  const receiveAssetsProportionally = useMemo(() => {
    return reserves.map((reserve) => {
      const maxValue = Big(removeAmount)
        .div(totalIssuance)
        .times(reserve.amount)
        .toFixed(0)

      const value = Big(maxValue)
        .minus(Big(slippage).times(maxValue).div(100))
        .toFixed(0)

      return { value, asset: reserve.meta }
    })
  }, [totalIssuance, removeAmount, reserves, slippage])

  const liquidityOutOneAsset = useMemo(() => {
    if (!fee) return undefined

    const maxValue = calculate_liquidity_out_one_asset(
      JSON.stringify(
        reserves.map((reserve) => ({
          amount: reserve.amount,
          decimals: reserve.meta.decimals,
          asset_id: reserve.asset_id,
        })),
      ),
      removeAmount,
      Number(receiveAsset.id),
      pool.amplification.toString(),
      totalIssuance,
      scaleHuman(fee, 2),
      JSON.stringify(pool.pegs),
    )

    const value = Big(maxValue)
      .minus(Big(slippage).times(maxValue).div(100))
      .toFixed(0)

    return value
  }, [
    fee,
    pool.amplification,
    pool.pegs,
    receiveAsset.id,
    removeAmount,
    reserves,
    slippage,
    totalIssuance,
  ])

  useEffect(() => {
    if (!split && liquidityOutOneAsset) {
      form.setValue(
        "receiveAmount",
        scaleHuman(liquidityOutOneAsset, receiveAsset.decimals),
      )
    }
  }, [form, split, liquidityOutOneAsset, receiveAsset.decimals])

  const mutation = useMutation({
    mutationFn: async (): Promise<void> => {
      if (!receiveAssetsProportionally)
        throw new Error("Receive assets not found")

      const tx = split
        ? papi.tx.Stableswap.remove_liquidity({
            pool_id: Number(pool.id),
            share_amount: BigInt(removeAmount),
            min_amounts_out: receiveAssetsProportionally.map((asset) => ({
              amount: BigInt(asset.value),
              asset_id: Number(asset.asset.id),
            })),
          })
        : papi.tx.Stableswap.remove_liquidity_one_asset({
            pool_id: Number(pool.id),
            share_amount: BigInt(removeAmount),
            asset_id: Number(receiveAsset.id),
            min_amount_out: BigInt(
              scale(form.watch("receiveAmount"), receiveAsset.decimals),
            ),
          })

      const toasts = {
        submitted: t("liquidity.remove.stablepool.modal.toast.submitted", {
          value: removeAmount,
          symbol: t("shares"),
        }),
        success: t("liquidity.remove.stablepool.modal.toast.success", {
          value: removeAmount,
          symbol: t("shares"),
        }),
      }

      await createTransaction({
        tx,
        toasts,
      })
    },
  })

  const onSubmit = () => {
    mutation.mutate()
  }

  return {
    form,
    balance: balanceShifted,
    fee,
    receiveAssetsProportionally,
    mutation,
    onSubmit,
    removeAmountShifted,
  }
}

export const useRemoveStablepoolLiquidityForm = ({
  asset,
  balance,
  receiveAsset,
}: {
  asset?: TSelectedAsset
  receiveAsset: TAssetData
  balance: string
}) => {
  return useForm<TRemoveStablepoolLiquidityFormValues>({
    mode: "onChange",
    defaultValues: {
      amount: balance,
      asset,
      split: true,
      receiveAsset,
      receiveAmount: "",
    },
    resolver: standardSchemaResolver(
      z.object({
        amount: required.pipe(positive).check(validateFieldMaxBalance(balance)),
        asset: z.custom<TSelectedAsset>(),
        split: z.boolean(),
        receiveAsset: z.custom<TAssetData>(),
        receiveAmount: z.string(),
      }),
    ),
  })
}
