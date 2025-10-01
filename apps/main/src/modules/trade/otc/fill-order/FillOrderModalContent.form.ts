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
  validateFieldExistentialDeposit,
  validateFieldMaxBalance,
} from "@/utils/validators"

const useSchema = (offer: OtcOfferTabular, assetInBalance: string) => {
  const rpc = useRpcProvider()
  const { data: existentialDepositMultiplier } = useQuery(
    otcExistentialDepositorMultiplierQuery(rpc),
  )

  return object({
    sellAmount: positiveOptional.check(
      validateFieldMaxBalance(assetInBalance),
      validateFieldExistentialDeposit(
        offer.assetIn,
        existentialDepositMultiplier,
      ),
    ),
    buyAmount: positiveOptional.check(
      refine(
        (value) => new Big(offer.assetAmountOut).gte(value),
        i18n.t("trade:otc.fillOrder.validation.orderTooBig"),
      ),
      validateFieldExistentialDeposit(
        offer.assetOut,
        existentialDepositMultiplier,
      ),
    ),
  })
}

export type FillOrderFormValues = Infer<ReturnType<typeof useSchema>>

export const useFillOrderForm = (
  otcOffer: OtcOfferTabular,
  assetInBalance: string,
  isUsersOffer: boolean,
) => {
  const defaultValues: FillOrderFormValues =
    !isUsersOffer && otcOffer.isPartiallyFillable
      ? {
          sellAmount: "",
          buyAmount: "",
        }
      : {
          sellAmount: otcOffer.assetAmountIn,
          buyAmount: otcOffer.assetAmountOut,
        }

  const schema = useSchema(otcOffer, assetInBalance)

  return useForm<FillOrderFormValues>({
    defaultValues,
    resolver: isUsersOffer ? undefined : standardSchemaResolver(schema),
    mode: "onChange",
  })
}
