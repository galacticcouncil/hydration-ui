import { calculate_shares } from "@galacticcouncil/math-xyk"
import { useMutation } from "@tanstack/react-query"
import Big from "big.js"
import { useCallback } from "react"
import { useTranslation } from "react-i18next"
import z from "zod/v4"

import { TAssetData } from "@/api/assets"
import { useXYKConsts, useXYKPoolsLiquidity } from "@/api/xyk"
import { IsolatedPoolTable } from "@/modules/liquidity/Liquidity.utils"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useTransactionsStore } from "@/states/transactions"
import { scale, scaleHuman } from "@/utils/formatting"
import { positive, required, validateFieldMaxBalance } from "@/utils/validators"

const getTradeFee = (fee?: number[]) => {
  if (fee?.length !== 2) return

  const numerator = fee[0]
  const denominator = fee[1]

  if (!numerator || !denominator) return undefined

  const tradeFee = Big(numerator).div(denominator)

  return tradeFee.times(100).toString()
}

export const useAddIsolatedLiquidityData = (
  pool: IsolatedPoolTable,
  shares: string,
) => {
  const { t } = useTranslation("liquidity")
  const { papi } = useRpcProvider()
  const createTransaction = useTransactionsStore((s) => s.createTransaction)
  const { data: liquidity, isLoading } = useXYKPoolsLiquidity(pool.id)
  const { data: consts, isLoading: isConstsLoading } = useXYKConsts()
  const assetA = pool.tokens[0]

  const getShares = useCallback(
    (amountA: string) =>
      liquidity && assetA && amountA.length
        ? calculate_shares(
            assetA.balance.toString(),
            scale(amountA, assetA.decimals ?? 0),
            liquidity.toString(),
          )
        : "0",
    [liquidity, assetA],
  )
  const ratio =
    liquidity && shares
      ? Big(shares)
          .div(Big(liquidity.toString()).plus(shares))
          .times(100)
          .toString()
      : undefined

  const fee = getTradeFee(consts?.fee)

  const mutation = useMutation({
    mutationFn: async ({
      assetA,
      assetB,
      amountA,
      amountB,
    }: {
      assetA: TAssetData
      assetB: TAssetData
      amountA: string
      amountB: string
    }): Promise<void> => {
      const tx = papi.tx.XYK.add_liquidity({
        asset_a: Number(assetA.id),
        asset_b: Number(assetB.id),
        amount_a: BigInt(Big(scale(amountA, assetA.decimals)).toFixed(0)),
        amount_b_max_limit: BigInt(
          Big(scale(amountB, assetB.decimals)).toFixed(0),
        ),
      })

      const sharesHuman = scaleHuman(shares, pool.meta.decimals)

      await createTransaction({
        tx,
        toasts: {
          submitted: t("liquidity.add.modal.xyk.toast.submitted", {
            shares: sharesHuman,
          }),
          success: t("liquidity.add.modal.xyk.toast.success", {
            shares: sharesHuman,
          }),
          error: t("liquidity.add.modal.xyk.toast.submitted", {
            shares: sharesHuman,
          }),
        },
      })
    },
  })

  return {
    getShares,
    ratio,
    fee,
    liquidity,
    mutation,
    isLoading: isConstsLoading || isLoading,
  }
}

export const useAddIsolatedLiquidityZod = (
  balanceA: string,
  balanceB: string,
  minTradingLimit: bigint,
) => {
  const { t } = useTranslation("liquidity")
  const { data: consts } = useXYKConsts()

  if (!consts) return

  return z
    .object({
      amountA: required.pipe(positive).check(validateFieldMaxBalance(balanceA)),
      amountB: required.check(validateFieldMaxBalance(balanceB)),
      assetA: z.custom<TAssetData>(),
      assetB: z.custom<TAssetData>(),
      shares: z
        .string()
        .refine(
          (shares) => Big(shares).gt(consts.minPoolLiquidity.toString()),
          {
            error: t("liquidity.add.modal.validation.minPoolLiquidity"),
          },
        ),
    })
    .refine(
      ({ amountA, assetA }) => {
        const minAssetATradingLimit = Big(
          scale(amountA || "0", assetA.decimals),
        ).gt(minTradingLimit.toString())

        return minAssetATradingLimit
      },
      {
        error: t("liquidity.add.modal.validation.minPoolLiquidity"),
        path: ["amountA"],
      },
    )

    .refine(
      ({ amountB, assetB }) => {
        const minAssetBTradingLimit = Big(
          scale(amountB || "0", assetB.decimals),
        ).gt(minTradingLimit.toString())

        return minAssetBTradingLimit
      },
      {
        error: t("liquidity.add.modal.validation.minPoolLiquidity"),
        path: ["amountB"],
      },
    )
}
