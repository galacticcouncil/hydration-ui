import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import Big from "big.js"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { refine, z } from "zod/v4"

import { positive, required, validateFieldMaxBalance } from "@/utils/validators"

export type HdclDepositFormValues = {
  amount: string
}

const defaultValues: HdclDepositFormValues = {
  amount: "",
}

const useSchema = (maxBalance: string, minDeposit: number, symbol: string) => {
  const { t } = useTranslation(["strategies"])

  return z.object({
    amount: required
      .pipe(positive)
      .check(validateFieldMaxBalance(maxBalance))
      .check(
        refine<string>((value) => Big(value || "0").gte(minDeposit), {
          error: t("hdcl.deposit.cta.belowMin", {
            value: minDeposit,
            symbol,
          }),
        }),
      ),
  })
}

type UseHdclDepositFormParams = {
  maxBalance: string
  minDeposit: number
  symbol: string
}

export const useHdclDepositForm = ({
  maxBalance,
  minDeposit,
  symbol,
}: UseHdclDepositFormParams) => {
  return useForm<HdclDepositFormValues>({
    defaultValues,
    resolver: standardSchemaResolver(useSchema(maxBalance, minDeposit, symbol)),
    mode: "onChange",
  })
}
