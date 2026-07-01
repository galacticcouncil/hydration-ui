import { formatAssetAmount } from "@galacticcouncil/utils"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { useForm } from "react-hook-form"
import { type infer as Infer, object, refine } from "zod/v4"

import { otcExistentialDepositorMultiplierQuery } from "@/api/otc"
import i18n from "@/i18n"
import { getOtcBuyAmountAfterFee } from "@/modules/trade/otc/fill-order/FillOrder.utils"
import { getOtcFillOrderTx } from "@/modules/trade/otc/fill-order/FillOrder.utils"
import { OtcOfferTabular } from "@/modules/trade/otc/table/OtcTable.columns"
import {
  useFormMaxBalanceWithFee,
  ValidateFormMaxBalanceWithFee,
} from "@/modules/transactions/hooks/useFormMaxBalanceWithFee"
import { useRpcProvider } from "@/providers/rpcProvider"
import {
  positiveOptional,
  validateFieldExistentialDeposit,
} from "@/utils/validators"

const useSchema = (
  offer: OtcOfferTabular,
  validateBalance: ValidateFormMaxBalanceWithFee,
) => {
  const rpc = useRpcProvider()
  const { data: existentialDepositMultiplier } = useQuery(
    otcExistentialDepositorMultiplierQuery(rpc),
  )

  return object({
    sellAmount: positiveOptional.check(
      refine(
        (value) => new Big(offer.assetAmountIn).gte(value || "0"),
        i18n.t("trade:otc.fillOrder.validation.orderTooBig"),
      ),
      validateFieldExistentialDeposit(
        offer.assetIn,
        existentialDepositMultiplier,
      ),
    ),
    buyAmount: positiveOptional.check(
      validateFieldExistentialDeposit(
        offer.assetOut,
        existentialDepositMultiplier,
      ),
    ),
  }).check(
    validateBalance("sellAmount", (form) => [offer.assetIn, form.sellAmount]),
  )
}

export type FillOrderFormValues = Infer<ReturnType<typeof useSchema>>

export const useFillOrderForm = (
  otcOffer: OtcOfferTabular,
  isUsersOffer: boolean,
  feePrice: string,
) => {
  const { papi } = useRpcProvider()

  const defaultValues: FillOrderFormValues =
    !isUsersOffer && otcOffer.isPartiallyFillable
      ? {
          sellAmount: "",
          buyAmount: "",
        }
      : {
          sellAmount: otcOffer.assetAmountIn,
          buyAmount: formatAssetAmount(
            getOtcBuyAmountAfterFee(
              otcOffer.assetAmountOut,
              feePrice,
            ).toString(),
            otcOffer.assetOut.decimals,
          ),
        }

  const { validateBalance, getMaxBalance } = useFormMaxBalanceWithFee(
    getOtcFillOrderTx(papi, otcOffer, "1"),
  )

  const schema = useSchema(otcOffer, validateBalance)

  const form = useForm<FillOrderFormValues>({
    defaultValues,
    resolver: isUsersOffer ? undefined : standardSchemaResolver(schema),
    mode: "onChange",
  })

  return {
    form,
    getMaxBalance,
  }
}
