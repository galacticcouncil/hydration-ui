import { zodResolver } from "@hookform/resolvers/zod"
import Big from "big.js"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { type infer as Infer, object, string } from "zod"

import i18n from "@/i18n"
import { OtcOfferTabular } from "@/modules/trade/otc/table/OtcTable.columns"
import { useOtcExistentialDepositorMultiplier } from "@/modules/trade/otc/useOtcExistentialDepositorMultiplier"
import {
  maxBalance,
  required,
  validateExistentialDeposit,
} from "@/utils/validators"

const getSchema = (
  offer: OtcOfferTabular,
  assetInBalance: string,
  existentialDepositMultiplier: Promise<number> | undefined,
) =>
  object({
    sellAmount: required.pipe(maxBalance(assetInBalance)),
    buyAmount: required.pipe(
      string().refine(
        (value) => new Big(offer.assetAmountOut).gte(value),
        i18n.t("trade:otc.fillOrder.validation.orderTooBig"),
      ),
    ),
  })
    .superRefine(async ({ sellAmount }, ctx) => {
      const errorMessage = validateExistentialDeposit(
        offer.assetIn,
        sellAmount || "0",
        await existentialDepositMultiplier,
      )

      if (errorMessage) {
        ctx.addIssue({
          code: "custom",
          message: errorMessage,
          path: ["sellAmount" satisfies keyof FillOrderFormValues],
        })
      }
    })
    .superRefine(async ({ buyAmount }, ctx) => {
      const errorMessage = validateExistentialDeposit(
        offer.assetOut,
        buyAmount || "0",
        await existentialDepositMultiplier,
      )

      if (errorMessage) {
        ctx.addIssue({
          code: "custom",
          message: errorMessage,
          path: ["buyAmount" satisfies keyof FillOrderFormValues],
        })
      }
    })

export type FillOrderFormValues = Infer<ReturnType<typeof getSchema>>

export const useFillOrderForm = (
  otcOffer: OtcOfferTabular,
  assetInBalance: string,
) => {
  const existentialDepositMultiplier = useOtcExistentialDepositorMultiplier()

  const defaultValues: FillOrderFormValues = otcOffer.isPartiallyFillable
    ? {
        sellAmount: "",
        buyAmount: "",
      }
    : {
        sellAmount: otcOffer.assetAmountIn,
        buyAmount: otcOffer.assetAmountOut,
      }

  const form = useForm<FillOrderFormValues>({
    defaultValues,
    resolver: zodResolver(
      getSchema(otcOffer, assetInBalance, existentialDepositMultiplier),
    ),
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
