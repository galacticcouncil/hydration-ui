import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { type infer as Infer, object, string } from "zod"

import { otcExistentialDepositorMultiplierQuery } from "@/api/otc"
import i18n from "@/i18n"
import { OtcOfferTabular } from "@/modules/trade/otc/table/OtcTable.columns"
import { useRpcProvider } from "@/providers/rpcProvider"
import { existentialDeposit, maxBalance, required } from "@/utils/validators"

const useSchema = (offer: OtcOfferTabular, assetInBalance: string) => {
  const rpc = useRpcProvider()
  const { data: existentialDepositMultiplier } = useQuery(
    otcExistentialDepositorMultiplierQuery(rpc),
  )

  return object({
    sellAmount: required
      .pipe(maxBalance(assetInBalance))
      .pipe(existentialDeposit(offer.assetIn, existentialDepositMultiplier)),
    buyAmount: required
      .pipe(
        string().refine(
          (value) => new Big(offer.assetAmountOut).gte(value),
          i18n.t("trade:otc.fillOrder.validation.orderTooBig"),
        ),
      )
      .pipe(existentialDeposit(offer.assetOut, existentialDepositMultiplier)),
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
  const form = useForm<FillOrderFormValues>({
    defaultValues,
    resolver: isUsersOffer ? undefined : standardSchemaResolver(schema),
    mode: "onChange",
  })

  const { watch, setValue } = form

  useEffect(() => {
    const subscription = watch(({ buyAmount, sellAmount }, { name, type }) => {
      if (type === "change" && name === "buyAmount") {
        const percentage = new Big(buyAmount || "0").div(
          otcOffer.assetAmountOut,
        )
        const newSellAmount = percentage
          .times(otcOffer.assetAmountIn)
          .toString()

        setValue("sellAmount", newSellAmount, { shouldValidate: true })
      } else if (type === "change" && name === "sellAmount") {
        const percentage = new Big(sellAmount || "0").div(
          otcOffer.assetAmountIn,
        )
        const newBuyAmount = percentage
          .times(otcOffer.assetAmountOut)
          .toString()

        setValue("buyAmount", newBuyAmount, { shouldValidate: true })
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [otcOffer, watch, setValue])

  return form
}
