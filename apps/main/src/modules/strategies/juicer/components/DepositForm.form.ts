import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import Big from "big.js"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { refine, z } from "zod/v4"

import { isExactAmount } from "@/modules/strategies/juicer/utils/amount"
import { positive, required, validateFieldMaxBalance } from "@/utils/validators"

type UseDepositFormParams = {
  maxBalance: string
  /** remaining vault capacity expressed in the asset paid with */
  maxCapacity?: string
  /** symbol of the asset paid with, for the capacity error */
  symbol?: string
  decimals: number
}

const useDepositSchema = ({
  maxBalance,
  maxCapacity,
  symbol,
  decimals,
}: UseDepositFormParams) => {
  const { t } = useTranslation(["juicer", "common"])

  return z.object({
    amount: required
      .pipe(positive)
      .check(
        refine<string>((value) => isExactAmount(value, decimals), {
          error: t("amount.precision", { decimals }),
        }),
      )
      .check(validateFieldMaxBalance(maxBalance))
      .check(
        refine<string>(
          (value) =>
            maxCapacity === undefined || Big(value || "0").lte(maxCapacity),
          {
            error: t("deposit.validation.maximum", {
              amount: t("common:currency", { value: maxCapacity, symbol }),
            }),
          },
        ),
      ),
  })
}

export type DepositFormValues = z.infer<ReturnType<typeof useDepositSchema>>

const defaultValues: DepositFormValues = {
  amount: "",
}

export const useDepositForm = (params: UseDepositFormParams) => {
  const { maxBalance, maxCapacity, decimals } = params
  const schema = useDepositSchema(params)

  const form = useForm<DepositFormValues>({
    defaultValues,
    resolver: standardSchemaResolver(schema),
    mode: "onChange",
  })
  const { getValues, trigger, clearErrors } = form
  useEffect(() => {
    if (!getValues("amount")) return
    // an account switch clears the amount while this check runs; its error
    // would outlive the amount it was about
    void trigger("amount").then(() => {
      if (!getValues("amount")) clearErrors("amount")
    })
  }, [maxBalance, maxCapacity, decimals, getValues, trigger, clearErrors])
  return form
}
