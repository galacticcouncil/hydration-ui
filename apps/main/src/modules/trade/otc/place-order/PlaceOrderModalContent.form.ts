import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { otcExistentialDepositorMultiplierQuery } from "@/api/otc"
import i18n from "@/i18n"
import { TAsset } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useAccountData } from "@/states/account"
import { scaleHuman } from "@/utils/formatting"
import {
  existentialDepositError,
  maxBalanceError,
  required,
  requiredAny,
  validateExistentialDeposit,
  validateMaxBalance,
} from "@/utils/validators"

const useSchema = () => {
  const rpc = useRpcProvider()
  const { data: existentialDepositMultiplier } = useQuery(
    otcExistentialDepositorMultiplierQuery(rpc),
  )

  const balances = useAccountData((data) => data.balances)

  return z
    .object({
      offerAsset: z.custom<TAsset | null>().refine(...requiredAny),
      offerAmount: required,
      buyAsset: z.custom<TAsset | null>().refine(...requiredAny),
      buyAmount: required,
      price: z.string(),
      isPartiallyFillable: z.boolean(),
    })
    .check(
      z.refine(
        ({ offerAsset, buyAsset }) =>
          !offerAsset || !buyAsset || offerAsset.id !== buyAsset.id,
        {
          error: i18n.t("trade:otc.placeOrder.validation.sameAssets"),
          path: ["buyAsset"],
        },
      ),
      z.refine(
        ({ offerAsset, offerAmount }) =>
          validateExistentialDeposit(
            offerAsset,
            offerAmount || "0",
            existentialDepositMultiplier,
          ),
        {
          error: existentialDepositError,
          path: ["offerAmount"],
        },
      ),
      z.refine(
        ({ offerAsset, offerAmount }) => {
          const balance = scaleHuman(
            balances[offerAsset?.id ?? ""]?.total ?? 0n,
            offerAsset?.decimals ?? 12,
          )

          return validateMaxBalance(balance, offerAmount || "0")
        },
        {
          error: maxBalanceError,
          path: ["offerAmount"],
        },
      ),
      z.refine(
        ({ buyAsset, buyAmount }) =>
          validateExistentialDeposit(
            buyAsset,
            buyAmount || "0",
            existentialDepositMultiplier,
          ),
        {
          error: existentialDepositError,
          path: ["buyAmount"],
        },
      ),
    )
}

export type PlaceOrderFormValues = z.infer<ReturnType<typeof useSchema>>

export const usePlaceOrderForm = () => {
  const defaultValues: PlaceOrderFormValues = {
    offerAsset: null,
    offerAmount: "",
    buyAsset: null,
    buyAmount: "",
    price: "",
    isPartiallyFillable: true,
  }

  const form = useForm<PlaceOrderFormValues>({
    defaultValues,
    resolver: standardSchemaResolver(useSchema()),
    mode: "onChange",
  })

  const { watch, setValue } = form

  useEffect(() => {
    const subscription = watch(
      ({ offerAmount, buyAmount, price }, { type, name }) => {
        if (type !== "change") {
          return
        }

        const priceBn = new Big(price || "0")
        const offerAmountBn = new Big(offerAmount || "0")
        const buyAmountBn = new Big(buyAmount || "0")

        if (name === "price" && priceBn.gt(0)) {
          if (offerAmountBn.gt(0)) {
            const buyAmount = offerAmountBn.mul(priceBn)
            setValue("buyAmount", buyAmount.toString(), {
              shouldValidate: true,
            })
          } else if (buyAmountBn.gt(0)) {
            const offerAmount = buyAmountBn.div(priceBn)
            setValue("offerAmount", offerAmount.toString(), {
              shouldValidate: true,
            })
          }
        } else if (name === "offerAmount" || name === "buyAmount") {
          if (offerAmountBn.gt(0) && buyAmountBn.gt(0)) {
            const price = buyAmountBn.div(offerAmountBn)
            setValue("price", price.toString(), { shouldValidate: true })
          } else if (buyAmountBn.gt(0) && priceBn.gt(0)) {
            const offerAmount = buyAmountBn.div(priceBn)
            setValue("offerAmount", offerAmount.toString(), {
              shouldValidate: true,
            })
          } else if (offerAmountBn.gt(0) && priceBn.gt(0)) {
            const buyAmount = offerAmountBn.mul(priceBn)
            setValue("buyAmount", buyAmount.toString(), {
              shouldValidate: true,
            })
          }
        }
      },
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [watch, setValue])

  return form
}
