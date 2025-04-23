import { required, maxBalance } from "utils/validators"
import * as z from "zod"
import BigNumber from "bignumber.js"
import { useTranslation } from "react-i18next"

export const usePartialFillFormSchema = ({
  offeringAmount,
  assetInBalance,
  assetInDecimals,
}: {
  offeringAmount: BigNumber
  assetInBalance: BigNumber
  assetInDecimals: number
}) => {
  const { t } = useTranslation()
  return z.object({
    amountIn: required.pipe(maxBalance(assetInBalance, assetInDecimals)),
    amountOut: required.pipe(
      z
        .string()
        .refine(
          (value) => offeringAmount.gte(new BigNumber(value)),
          t("otc.order.fill.validation.orderTooBig"),
        ),
    ),
  })
}
