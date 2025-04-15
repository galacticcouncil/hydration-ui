import { required, maxBalance, otcExistentialDeposit } from "utils/validators"
import { useExistentialDepositMultiplier } from "sections/trade/sections/otc/useExistentialDepositorMultiplier"
import * as z from "zod"
import BigNumber from "bignumber.js"
import { useTranslation } from "react-i18next"
import { TAsset } from "providers/assets"

export const usePartialFillFormSchema = ({
  offeringAmount,
  assetInBalance,
  assetInMeta,
  assetOutMeta,
}: {
  offeringAmount: BigNumber
  assetInBalance: string
  assetInMeta: TAsset
  assetOutMeta: TAsset
}) => {
  const { t } = useTranslation()
  const { data: existentialDepositMultiplier } =
    useExistentialDepositMultiplier()

  return z.object({
    amountIn: required
      .pipe(maxBalance(assetInBalance, assetInMeta.decimals))
      .pipe(otcExistentialDeposit(assetInMeta, existentialDepositMultiplier)),
    amountOut: required
      .pipe(
        z
          .string()
          .refine(
            (value) => offeringAmount.gte(new BigNumber(value)),
            t("otc.order.fill.validation.orderTooBig"),
          ),
      )
      .pipe(otcExistentialDeposit(assetOutMeta, existentialDepositMultiplier)),
  })
}
