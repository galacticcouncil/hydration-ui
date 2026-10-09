import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import Big from "big.js"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { refine, z } from "zod/v4"

import i18n from "@/i18n"
import { isExactAmount } from "@/modules/strategies/propeller/utils/amount"
import { positive, required, validateFieldMaxBalance } from "@/utils/validators"

export type WithdrawFormValues = {
  amount: string
  acknowledged: boolean
}

const defaultValues: WithdrawFormValues = {
  amount: "",
  acknowledged: false,
}

type UseWithdrawFormParams = {
  maxBalance: string
  minRedeem: number
  shareSymbol: string
  decimals: number
}

export const useWithdrawForm = ({
  maxBalance,
  minRedeem,
  shareSymbol,
  decimals,
}: UseWithdrawFormParams) => {
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
        refine<string>((value) => Big(value || "0").gte(minRedeem), {
          error: t("withdraw.validation.belowMin", {
            min: minRedeem,
            shareSymbol,
          }),
        }),
      ),
    acknowledged: z.boolean().refine((value) => value, {
      error: i18n.t("error.required"),
    }),
  })

  const form = useForm<WithdrawFormValues>({
    defaultValues,
    resolver: standardSchemaResolver(schema),
    mode: "onChange",
  })
  const { getValues, trigger } = form
  useEffect(() => {
    if (getValues("amount")) void trigger("amount")
  }, [maxBalance, minRedeem, decimals, getValues, trigger])
  return form
}
