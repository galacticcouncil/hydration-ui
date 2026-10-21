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
  /** remaining vault capacity expressed in the asset paid with */
  maxCapacity?: string
  /** symbol of the asset paid with, for the capacity error */
  symbol?: string
  decimals: number
}

export const useDepositForm = ({
  maxBalance,
  maxCapacity,
  symbol,
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
        refine<string>(
          (value) =>
            maxCapacity === undefined || Big(value || "0").lte(maxCapacity),
          {
            error: t("deposit.validation.maximum", {
              amount: symbol ? `${maxCapacity} ${symbol}` : maxCapacity,
            }),
          },
        ),
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
  }, [maxBalance, maxCapacity, decimals, getValues, trigger])
  return form
}
