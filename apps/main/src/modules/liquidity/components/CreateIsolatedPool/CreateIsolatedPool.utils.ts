import { useMutation } from "@tanstack/react-query"
import Big from "big.js"
import { t } from "i18next"
import { useTranslation } from "react-i18next"
import { z } from "zod/v4"

import { TAssetData } from "@/api/assets"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useTransactionsStore } from "@/states/transactions"
import { positive, required, validateFieldMaxBalance } from "@/utils/validators"

export const zodCreateIsolatedPool = (
  balanceA: string,
  balanceB: string,
  assetA?: TAssetData,
  assetB?: TAssetData,
) =>
  z.object({
    amountA: required
      .pipe(positive)
      .check(validateFieldMaxBalance(balanceA))
      .refine(
        () => {
          return !!assetA
        },
        {
          message: t("liquidity:liquidity.createPool.modal.validation.assetA"),
        },
      ),
    amountB: required
      .pipe(positive)
      .check(validateFieldMaxBalance(balanceB))
      .refine(
        () => {
          return !!assetB
        },
        {
          message: t("liquidity:liquidity.createPool.modal.validation.assetB"),
        },
      ),
  })

export const useSubmitCreateIsolatedPool = () => {
  const { t } = useTranslation("liquidity")
  const { papi } = useRpcProvider()
  const createTransaction = useTransactionsStore((s) => s.createTransaction)

  return useMutation({
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
      const tx = papi.tx.XYK.create_pool({
        asset_a: Number(assetA.id),
        amount_a: BigInt(Big(amountA).toFixed(0)),
        asset_b: Number(assetB.id),
        amount_b: BigInt(Big(amountB).toFixed(0)),
      })

      const tOptions = { assetA: assetA.symbol, assetB: assetB.symbol }

      const toasts = {
        submitted: t("liquidity.createPool.toast.submitted", tOptions),
        success: t("liquidity.createPool.toast.success", tOptions),
        error: t("liquidity.createPool.toast.submitted", tOptions),
      }

      await createTransaction({ tx, toasts })
    },
  })
}
