import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import Big from "big.js"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { refine, z } from "zod/v4"

import i18n from "@/i18n"
import type { WithdrawMethod } from "@/modules/strategies/bil/components/WithdrawMethodPicker"
import { positive, required, validateFieldMaxBalance } from "@/utils/validators"

export type WithdrawFormValues = {
  amount: string
  method: WithdrawMethod
  acknowledged: boolean
}

const withdrawFormDefaultValues: WithdrawFormValues = {
  amount: "",
  method: "queue",
  acknowledged: false,
}

const useSchema = (maxWithdrawable: string, minRedeem: number) => {
  const { t } = useTranslation(["strategies"])

  return z.object({
    amount: required
      .pipe(positive)
      .check(validateFieldMaxBalance(maxWithdrawable))
      .check(
        refine<string>((value) => Big(value || "0").gte(minRedeem), {
          error: t("bil.withdraw.cta.belowMin", { min: minRedeem }),
        }),
      ),
    method: z.enum(["queue", "instant"]),
    acknowledged: z.boolean().refine((value) => value, {
      error: i18n.t("error.required"),
    }),
  })
}

type UseWithdrawFormParams = {
  maxWithdrawable: string
  minRedeem: number
}

export const useWithdrawForm = ({
  maxWithdrawable,
  minRedeem,
}: UseWithdrawFormParams) => {
  return useForm<WithdrawFormValues>({
    defaultValues: withdrawFormDefaultValues,
    resolver: standardSchemaResolver(useSchema(maxWithdrawable, minRedeem)),
    mode: "onChange",
  })
}
