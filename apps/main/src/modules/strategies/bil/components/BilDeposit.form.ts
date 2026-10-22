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

const useSchema = (
  maxBalance: string,
  minDeposit: number,
  symbol: string,
  maxCapacity: number,
) => {
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
      )
      // Deposits must clear the lower of the vault tvlCap and the pool
      // supplyCap (the zap does deposit + supply atomically). Reject anything
      // above the remaining capacity so the user sees a clear message instead
      // of an on-chain revert. Skipped while capacity is unknown (Infinity),
      // both to allow input during load and because Big() rejects Infinity.
      .check(
        refine<string>(
          (value) =>
            !Number.isFinite(maxCapacity) || Big(value || "0").lte(maxCapacity),
          {
            error: t("bil.deposit.cta.exceedsCap", {
              value: maxCapacity,
              symbol,
            }),
          },
        ),
      ),
  })
}

type UseBilDepositFormParams = {
  maxBalance: string
  minDeposit: number
  symbol: string
  maxCapacity: number
}

export const useBilDepositForm = ({
  maxBalance,
  minDeposit,
  symbol,
  maxCapacity,
}: UseBilDepositFormParams) => {
  return useForm<BilDepositFormValues>({
    defaultValues,
    resolver: standardSchemaResolver(
      useSchema(maxBalance, minDeposit, symbol, maxCapacity),
    ),
    mode: "onChange",
  })
}
