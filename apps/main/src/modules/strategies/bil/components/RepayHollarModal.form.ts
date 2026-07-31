import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { refine, z } from "zod/v4"

import { positive, required, validateMaxBalance } from "@/utils/validators"

export type RepayHollarFormValues = z.infer<ReturnType<typeof useSchema>>

type UseRepayHollarFormParams = {
  totalDebt: string
  walletBalance: string
}

const useSchema = (totalDebt: string, walletBalance: string) => {
  const { t } = useTranslation(["strategies"])

  return z.object({
    amount: required.pipe(positive).check(
      refine<string>((value) => validateMaxBalance(totalDebt, value), {
        error: t("bil.repay.cta.exceeds"),
      }),
      refine<string>((value) => validateMaxBalance(walletBalance, value), {
        error: t("bil.repay.cta.insufficient"),
      }),
    ),
  })
}

export const useRepayHollarForm = ({
  totalDebt,
  walletBalance,
}: UseRepayHollarFormParams) => {
  return useForm({
    defaultValues: {
      amount: "",
    },
    resolver: standardSchemaResolver(useSchema(totalDebt, walletBalance)),
    mode: "onChange",
  })
}
