import { FieldValues, Path } from "react-hook-form"
import * as z from "zod/v4"

import { useAccountFeePaymentAssetId } from "@/api/payments"
import { useMaxBalanceWithFee } from "@/modules/transactions/hooks/useMaxBalanceWithFee"
import { AnyTransaction } from "@/modules/transactions/types"
import { TAsset } from "@/providers/assetsProvider"
import { useAccountBalances } from "@/states/account"
import { scaleHuman } from "@/utils/formatting"
import { maxBalanceError, validateMaxBalance } from "@/utils/validators"

export const useFormMaxBalanceWithFee = (
  tx: AnyTransaction | null,
  feePctBuffer?: number,
) => {
  const { data: accountFeePaymentAssetId } = useAccountFeePaymentAssetId()
  const { getTransferableBalance } = useAccountBalances()
  const maxBalanceWithFee = useMaxBalanceWithFee(tx, feePctBuffer)

  const getMaxBalance = (asset: TAsset | null) => {
    if (!asset) {
      return "0"
    }

    if (accountFeePaymentAssetId === Number(asset.id)) {
      return maxBalanceWithFee?.maxBalanceHuman ?? "0"
    }

    return scaleHuman(getTransferableBalance(asset.id), asset.decimals)
  }

  const validateBalance = <TFormValues extends FieldValues>(
    path: Path<NoInfer<TFormValues>>,
    selectData: (form: TFormValues) => [asset: TAsset | null, amount: string],
  ) =>
    z.refine<TFormValues>(
      (form) => {
        const [asset, amount] = selectData(form)

        if (!asset) {
          return true
        }

        return validateMaxBalance(getMaxBalance(asset), amount)
      },
      {
        error: maxBalanceError,
        path: [path],
      },
    )

  return { getMaxBalance, validateBalance }
}

export type ValidateFormMaxBalanceWithFee = ReturnType<
  typeof useFormMaxBalanceWithFee
>["validateBalance"]

export type GetMaxBalanceWithFee = ReturnType<
  typeof useFormMaxBalanceWithFee
>["getMaxBalance"]
