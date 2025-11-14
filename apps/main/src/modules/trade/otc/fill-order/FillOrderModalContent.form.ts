import { formatAssetAmount } from "@galacticcouncil/utils"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { useForm } from "react-hook-form"
import { type infer as Infer, object, refine } from "zod/v4"

import { otcExistentialDepositorMultiplierQuery } from "@/api/otc"
import i18n from "@/i18n"
import { OtcOfferTabular } from "@/modules/trade/otc/table/OtcTable.columns"
import { useRpcProvider } from "@/providers/rpcProvider"
import {
  positiveOptional,
  useValidateFormMaxBalance,
  validateFieldExistentialDeposit,
} from "@/utils/validators"

const useSchema = (offer: OtcOfferTabular) => {
  const rpc = useRpcProvider()
  const { data: existentialDepositMultiplier } = useQuery(
    otcExistentialDepositorMultiplierQuery(rpc),
  )

  const refineMaxBalance = useValidateFormMaxBalance()

  return object({
    sellAmount: positiveOptional.check(
      validateFieldExistentialDeposit(
        offer.assetIn,
        existentialDepositMultiplier,
      ),
    ),
    buyAmount: positiveOptional.check(
      refine(
        (value) => new Big(offer.assetAmountOut).gte(value || "0"),
        i18n.t("trade:otc.fillOrder.validation.orderTooBig"),
      ),
      validateFieldExistentialDeposit(
        offer.assetOut,
        existentialDepositMultiplier,
      ),
    ),
  }).check(
    refineMaxBalance("sellAmount", (form) => [offer.assetIn, form.sellAmount]),
  )
}

export type FillOrderFormValues = Infer<ReturnType<typeof useSchema>>

export const useFillOrderForm = (
  otcOffer: OtcOfferTabular,
  isUsersOffer: boolean,
  feePrice: string,
) => {
  const defaultValues: FillOrderFormValues =
    !isUsersOffer && otcOffer.isPartiallyFillable
      ? {
          sellAmount: "",
          buyAmount: "",
        }
      : {
          sellAmount: otcOffer.assetAmountIn,
          buyAmount: formatAssetAmount(
            Big(otcOffer.assetAmountOut)
              .minus(Big(otcOffer.assetAmountOut).times(feePrice))
              .toString(),
            otcOffer.assetOut.decimals,
          ),
        }

  const schema = useSchema(otcOffer)

  return useForm<FillOrderFormValues>({
    defaultValues,
    resolver: isUsersOffer ? undefined : standardSchemaResolver(schema),
    mode: "onChange",
  })
}
