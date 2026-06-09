import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import Big from "big.js"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { refine, z } from "zod/v4"

import { positive, required, validateFieldMaxBalance } from "@/utils/validators"

export type BilDepositFormValues = {
  amount: string
}

const defaultValues: BilDepositFormValues = {
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
          error: t("bil.deposit.cta.belowMin", {
            value: minDeposit,
            symbol,
          }),
        }),
      ),
  })
}

type UseBilDepositFormParams = {
  maxBalance: string
  minDeposit: number
  symbol: string
}

export const useBilDepositForm = ({
  maxBalance,
  minDeposit,
  symbol,
}: UseBilDepositFormParams) => {
  return useForm<BilDepositFormValues>({
    defaultValues,
    resolver: standardSchemaResolver(useSchema(maxBalance, minDeposit, symbol)),
    mode: "onChange",
  })
}
