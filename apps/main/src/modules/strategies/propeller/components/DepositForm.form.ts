import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import Big from "big.js"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { refine, z } from "zod/v4"

import { isExactAmount } from "@/modules/strategies/propeller/utils/amount"
import { positive, required, validateFieldMaxBalance } from "@/utils/validators"

export type DepositFormValues = {
  amount: string
}

const defaultValues: DepositFormValues = {
  amount: "",
}

type UseDepositFormParams = {
  maxBalance: string
  maxCapacity: string
  minAmount: string
  decimals: number
}

export const useDepositForm = ({
  maxBalance,
  maxCapacity,
  minAmount,
  decimals,
}: UseDepositFormParams) => {
  const { t } = useTranslation("propeller")

  const schema = z.object({
    amount: required
      .pipe(positive)
      .check(
        refine<string>((value) => isExactAmount(value, decimals), {
          error: t("amount.precision", { decimals }),
        }),
      )
      .check(validateFieldMaxBalance(maxBalance))
      .check(
        refine<string>((value) => Big(value || "0").lte(maxCapacity), {
          error: t("deposit.validation.maximum", { amount: maxCapacity }),
        }),
      )
      .check(
        refine<string>((value) => Big(value || "0").gte(minAmount), {
          error: t("deposit.validation.minimum", { amount: minAmount }),
        }),
      ),
  })

  const form = useForm<DepositFormValues>({
    defaultValues,
    resolver: standardSchemaResolver(schema),
    mode: "onChange",
  })
  const { getValues, trigger } = form
  useEffect(() => {
    if (getValues("amount")) void trigger("amount")
  }, [maxBalance, maxCapacity, minAmount, decimals, getValues, trigger])
  return form
}
