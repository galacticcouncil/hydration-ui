import { EvmAddr, Ss58Addr } from "@galacticcouncil/utils"
import Big from "big.js"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { z } from "zod/v4"

import { toDecimal } from "@/utils/formatting"
import { required } from "@/utils/validators"

export const useTransferSchema = ({
  min,
  max,
  symbol,
  decimals,
}: {
  min: bigint
  max: bigint
  symbol: string
  decimals: number
}) => {
  const { t } = useTranslation(["common", "xcm", "wallet"])

  return useMemo(() => {
    const maxBalance = z.string().refine(
      (value) => Big(value).lte(toDecimal(max, decimals)),
      t("xcm:error.maxAmount", {
        amount: toDecimal(max, decimals),
        symbol,
      }),
    )

    const minBalance = z.string().refine(
      (value) => Big(value).gte(toDecimal(min, decimals)),
      t("xcm:error.minAmount", {
        amount: toDecimal(min, decimals),
        symbol,
      }),
    )

    const validAddress = z
      .string()
      .min(1, t("error.required"))
      .refine(
        (value) => EvmAddr.isValid(value) || Ss58Addr.isValid(value),
        t("xcm:error.invalidAddress"),
      )

    return z.object({
      amount: required.pipe(maxBalance).pipe(minBalance),
      address: validAddress,
    })
  }, [min, max, symbol, decimals, t])
}
