import { BigNumber } from "bignumber.js"
import { useTranslation } from "react-i18next"
import { required, validAddress } from "utils/validators"
import { z } from "zod"

export const useZodSchema = ({
  min,
  max,
  symbol,
  decimals,
}: {
  min: BigNumber
  max: BigNumber
  symbol: string
  decimals: number
}) => {
  const { t } = useTranslation()

  const maxBalance = z.string().refine(
    (value) =>
      Number.isFinite(decimals) &&
      BigNumber(value).lte(max.shiftedBy(-decimals)),
    t("xcm.transfer.error.maxTransferable", {
      value: max,
      fixedPointScale: decimals,
      symbol,
    }),
  )

  const minBalance = z.string().refine(
    (value) =>
      Number.isFinite(decimals) &&
      BigNumber(value).gte(min.shiftedBy(-decimals)),
    t("xcm.transfer.error.minTransferable", {
      value: min,
      fixedPointScale: decimals,
      symbol,
    }),
  )

  return z.object({
    amount: required.pipe(maxBalance).pipe(minBalance),
    address: validAddress,
  })
}
