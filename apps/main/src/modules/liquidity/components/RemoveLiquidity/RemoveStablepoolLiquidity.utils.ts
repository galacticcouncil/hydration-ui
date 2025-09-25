import { calculate_liquidity_out_one_asset } from "@galacticcouncil/math-stableswap"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useMutation } from "@tanstack/react-query"
import Big from "big.js"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { prop } from "remeda"
import * as z from "zod/v4"

import { TAssetData } from "@/api/assets"
import { StableSwapBase } from "@/api/pools"
import { TSelectedAsset } from "@/components/AssetSelect/AssetSelect"
import { TRemoveLiquidityFormValues } from "@/modules/liquidity/components/RemoveLiquidity/RemoveLiquidity.utils"
import { calculatePoolFee, TReserve } from "@/modules/liquidity/Liquidity.utils"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useAccountBalances } from "@/states/account"
import { useTransactionsStore } from "@/states/transactions"
import { scale, scaleHuman } from "@/utils/formatting"
import { positive, required, validateFieldMaxBalance } from "@/utils/validators"

export type TRemoveStablepoolLiquidityFormValues =
  TRemoveLiquidityFormValues & {
    split: boolean
    receiveAsset: TAssetData
    receiveAmount: string
  }

export const LIQUIDITY_LIMIT = 3

export const useStablepoolRemoveLiquidity = ({
  pool,
  reserves,
  initialReceiveAsset,
}: {
  pool: StableSwapBase
  reserves: TReserve[]
  initialReceiveAsset: TAssetData
}) => {
  const { t } = useTranslation("liquidity")
  const { getAssetWithFallback } = useAssets()
  const { papi } = useRpcProvider()
  const createTransaction = useTransactionsStore(prop("createTransaction"))

  const { getFreeBalance } = useAccountBalances()
  const meta = getAssetWithFallback(pool.id)
  const fee = calculatePoolFee(pool.fee)

  const balanceShifted = scaleHuman(
    getFreeBalance(pool.id).toString(),
    meta.decimals,
  )

  const form = useRemoveStablepoolLiquidityForm({
    receiveAsset: initialReceiveAsset,
    balance: balanceShifted,
    asset: meta,
  })

  const removeAmount = Big(scale(form.watch("amount") || "0", meta.decimals))
  const receiveAsset = form.watch("receiveAsset")
  const split = form.watch("split")

  const receiveAssets = (() => {
    const totalIssuance = pool.totalIssuance.toString()

    if (removeAmount.gt(0) && fee) {
      if (split) {
        return reserves.map((reserve) => {
          const maxValue = removeAmount
            .div(totalIssuance)
            .times(reserve.amount)
            .toFixed(0)

          const value = Big(maxValue)
            .minus(Big(LIQUIDITY_LIMIT).times(maxValue).div(100))
            .toFixed(0)

          return { value, asset: reserve.meta }
        })
      } else {
        const maxValue = calculate_liquidity_out_one_asset(
          JSON.stringify(
            reserves.map((reserve) => ({
              amount: reserve.amount,
              decimals: reserve.meta.decimals,
              asset_id: reserve.asset_id,
            })),
          ),
          removeAmount.toFixed(0),
          Number(receiveAsset.id),
          pool.amplification.toString(),
          totalIssuance,
          scaleHuman(fee, 2),
          JSON.stringify(pool.pegs),
        )

        const value = Big(maxValue)
          .minus(Big(LIQUIDITY_LIMIT).times(maxValue).div(100))
          .toFixed(0)

        form.setValue("receiveAmount", scaleHuman(value, receiveAsset.decimals))

        return [{ value, asset: receiveAsset }]
      }
    }
  })()

  const mutation = useMutation({
    mutationFn: async (): Promise<void> => {
      if (!receiveAssets) throw new Error("Receive assets not found")

      const receiveAsset = receiveAssets[0]

      if (!receiveAsset) throw new Error("Receive assets not found")

      const tx = split
        ? papi.tx.Stableswap.remove_liquidity({
            pool_id: Number(pool.id),
            share_amount: BigInt(removeAmount.toFixed(0)),
            min_amounts_out: receiveAssets.map((asset) => ({
              amount: BigInt(asset.value),
              asset_id: Number(asset.asset.id),
            })),
          })
        : papi.tx.Stableswap.remove_liquidity_one_asset({
            pool_id: Number(pool.id),
            share_amount: BigInt(removeAmount.toFixed(0)),
            asset_id: Number(receiveAsset.asset.id),
            min_amount_out: BigInt(receiveAsset.value),
          })

      const toasts = {
        submitted: t("liquidity.remove.stablepool.modal.toast.submitted", {
          value: removeAmount.toFixed(0),
          symbol: t("shares"),
        }),
        success: t("liquidity.remove.stablepool.modal.toast.success", {
          value: removeAmount.toFixed(0),
          symbol: t("shares"),
        }),
        error: t("liquidity.remove.stablepool.modal.toast.submitted", {
          value: removeAmount.toFixed(0),
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
    split,
    receiveAssets,
    mutation,
    onSubmit,
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
