import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import * as z from "zod/v4"

import { otcExistentialDepositorMultiplierQuery } from "@/api/otc"
import { OtcOffer } from "@/modules/trade/otc/table/OtcTable.query"
import type { TAsset } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import {
  positiveOptional,
  requiredObject,
  useValidateFormMaxBalance,
  validateFormExistentialDeposit,
} from "@/utils/validators"

const getSelectedOrder = (orders: OtcOffer[], asset: TAsset | null) =>
  orders.find((order) => order.assetIn.id === asset?.id)

const useSchema = (orders: OtcOffer[]) => {
  const { t } = useTranslation(["trade"])
  const rpc = useRpcProvider()
  const { data: existentialDepositMultiplier } = useQuery(
    otcExistentialDepositorMultiplierQuery(rpc),
  )

  const refineFormMaxBalance = useValidateFormMaxBalance()

  return z
    .object({
      depositAsset: requiredObject<TAsset>(),
      depositAmount: positiveOptional,
    })
    .check(
      z.refine(
        (form) => {
          const order = getSelectedOrder(orders, form.depositAsset)

          return (
            !order || Big(order.assetAmountIn).gte(form.depositAmount || "0")
          )
        },
        {
          error: t("trade:otc.fillOrder.validation.orderTooBig"),
          path: ["depositAmount"],
        },
      ),
      validateFormExistentialDeposit("depositAmount", (form) => {
        const order = getSelectedOrder(orders, form.depositAsset)

        return [
          existentialDepositMultiplier,
          order?.assetIn ?? form.depositAsset,
          form.depositAmount,
        ]
      }),
      refineFormMaxBalance("depositAmount", (form) => [
        form.depositAsset,
        form.depositAmount,
      ]),
    )
}

export type StableBondsFormValues = z.infer<ReturnType<typeof useSchema>>

export const useStableBondsForm = (orders: OtcOffer[]) => {
  return useForm<StableBondsFormValues>({
    defaultValues: {
      depositAsset: orders[0]?.assetIn ?? null,
      depositAmount: "",
    },
    resolver: standardSchemaResolver(useSchema(orders)),
    mode: "onChange",
  })
}
