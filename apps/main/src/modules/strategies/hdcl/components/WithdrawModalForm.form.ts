import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import Big from "big.js"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { refine, z } from "zod/v4"

import i18n from "@/i18n"
import { TAsset } from "@/providers/assetsProvider"
import { positive, required, validateFieldMaxBalance } from "@/utils/validators"

export type WithdrawFormValues = z.infer<ReturnType<typeof useSchema>>

type UseWithdrawFormParams = {
  asset: TAsset
  maxWithdrawable: string
  minRedeem: number
}

const WITHDRAW_FORM_DEFAULT_VALUES: WithdrawFormValues = {
  amount: "",
  method: "queue",
  acknowledged: false,
}

const useSchema = (
  asset: TAsset,
  maxWithdrawable: string,
  minRedeem: number,
) => {
  const { t } = useTranslation(["strategies"])

  return z.object({
    amount: required
      .pipe(positive)
      .check(validateFieldMaxBalance(maxWithdrawable))
      .check(
        refine<string>((value) => Big(value || "0").gte(minRedeem), {
          error: t("hdcl.withdraw.cta.belowMin", {
            min: minRedeem,
            symbol: asset.symbol,
          }),
        }),
      ),
    method: z.enum(["queue", "instant"]),
    acknowledged: z.boolean().refine((value) => value, {
      error: i18n.t("error.required"),
    }),
  })
}

export const useWithdrawForm = ({
  asset,
  maxWithdrawable,
  minRedeem,
}: UseWithdrawFormParams) => {
  return useForm({
    defaultValues: WITHDRAW_FORM_DEFAULT_VALUES,
    resolver: standardSchemaResolver(
      useSchema(asset, maxWithdrawable, minRedeem),
    ),
    mode: "onChange",
  })
}
