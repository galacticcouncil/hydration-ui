import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import * as z from "zod/v4"

import { otcExistentialDepositorMultiplierQuery } from "@/api/otc"
import {
  getOtcFillOrderTx,
  getOtcMaxPartialFill,
  isOtcFillAmountValid,
} from "@/modules/trade/otc/fill-order/FillOrder.utils"
import { OtcOffer } from "@/modules/trade/otc/table/OtcTable.query"
import { otcTradeFeeQuery } from "@/modules/trade/otc/TradeFee.query"
import {
  useFormMaxBalanceWithFee,
  ValidateFormMaxBalanceWithFee,
} from "@/modules/transactions/hooks/useFormMaxBalanceWithFee"
import type { TAsset } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import {
  positiveOptional,
  requiredObject,
  validateFormExistentialDeposit,
} from "@/utils/validators"

const getSelectedOrder = (orders: OtcOffer[], asset: TAsset | null) =>
  orders.find((order) => order.assetIn.id === asset?.id)

const isFillableOrder = (order: OtcOffer) =>
  !!order.id && Big(order.assetAmountIn).gt(0)

const getDefaultDepositAsset = (orders: OtcOffer[]) =>
  orders.find(isFillableOrder)?.assetIn ?? orders[0]?.assetIn ?? null

const useSchema = (
  orders: OtcOffer[],
  validateBalance: ValidateFormMaxBalanceWithFee,
) => {
  const { t } = useTranslation(["trade", "strategies"])
  const rpc = useRpcProvider()
  const { data: existentialDepositMultiplier } = useQuery(
    otcExistentialDepositorMultiplierQuery(rpc),
  )
  const { data: feePct = "0" } = useQuery(otcTradeFeeQuery(rpc))

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
      (ctx) => {
        const { depositAsset, depositAmount } = ctx.value
        const order = getSelectedOrder(orders, depositAsset)

        if (
          !order ||
          !depositAmount ||
          !existentialDepositMultiplier ||
          isOtcFillAmountValid(
            order,
            depositAmount,
            existentialDepositMultiplier,
            feePct,
          )
        ) {
          return
        }

        ctx.issues.push({
          code: "custom",
          input: depositAmount,
          path: ["depositAmount"],
          message: t("strategies:bonds.deposit.validation.max", {
            amount: getOtcMaxPartialFill(
              order,
              existentialDepositMultiplier,
              feePct,
            ).toFixed(),
            symbol: order.assetIn.symbol,
          }),
        })
      },
      validateFormExistentialDeposit("depositAmount", (form) => {
        const order = getSelectedOrder(orders, form.depositAsset)

        return [
          existentialDepositMultiplier,
          order?.assetIn ?? form.depositAsset,
          form.depositAmount,
        ]
      }),
      validateBalance("depositAmount", (form) => [
        form.depositAsset,
        form.depositAmount,
      ]),
    )
}

export type StableBondsFormValues = z.infer<ReturnType<typeof useSchema>>

export const useStableBondsForm = (orders: OtcOffer[]) => {
  const { papi } = useRpcProvider()
  const defaultOrder = getSelectedOrder(orders, getDefaultDepositAsset(orders))

  const { validateBalance, getMaxBalance } = useFormMaxBalanceWithFee(
    defaultOrder ? getOtcFillOrderTx(papi, defaultOrder, "1") : null,
  )

  const form = useForm<StableBondsFormValues>({
    defaultValues: {
      depositAsset: getDefaultDepositAsset(orders),
      depositAmount: "",
    },
    resolver: standardSchemaResolver(useSchema(orders, validateBalance)),
    mode: "onChange",
  })

  return { form, getMaxBalance }
}
