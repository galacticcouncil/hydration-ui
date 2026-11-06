import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import Big from "big.js"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { refine, z } from "zod/v4"

import i18n from "@/i18n"
import { isExactAmount } from "@/modules/strategies/propeller/utils/amount"
import { positive, required } from "@/utils/validators"

export type WithdrawFormValues = {
  amount: string
  acknowledged: boolean
}

const defaultValues: WithdrawFormValues = {
  amount: "",
  acknowledged: false,
}

type UseWithdrawFormParams = {
  /** withdrawable balance in the UNDERLYING asset (shares x exchange rate) */
  maxBalance: string
  minRedeem: number
  symbol: string
  decimals: number
}

export const useWithdrawForm = ({
  maxBalance,
  minRedeem,
  symbol,
  decimals,
}: UseWithdrawFormParams) => {
  const { t } = useTranslation(["propeller", "common"])

  const schema = z.object({
    amount: required
      .pipe(positive)
      .check(
        refine<string>((value) => isExactAmount(value, decimals), {
          error: t("amount.precision", { decimals }),
        }),
      )
      // a position, not a wallet balance: "insufficient balance" misleads
      .check(
        refine<string>((value) => Big(value || "0").lte(maxBalance || "0"), {
          error: t("withdraw.validation.overPosition", {
            amount: t("common:currency", { value: maxBalance, symbol }),
          }),
        }),
      )
      .check(
        refine<string>((value) => Big(value || "0").gte(minRedeem), {
          error: t("withdraw.validation.belowMin", {
            min: minRedeem,
            symbol,
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
