import {
  getTimeFrameMillis,
  getTimeFrameSchema,
  TimeFrame,
  timeFrameTypes,
} from "@galacticcouncil/main/src/components/TimeFrame/TimeFrame.utils"
import { Account, useAccount } from "@galacticcouncil/web3-connect"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useQueryClient } from "@tanstack/react-query"
import Big from "big.js"
import { millisecondsInHour } from "date-fns/constants"
import { useEffect } from "react"
import { FieldPath, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { z } from "zod/v4"

import { minimumOrderBudgetQuery } from "@/api/trade"
import i18n from "@/i18n"
import { TAsset, useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useAccountBalances } from "@/states/account"
import { scaleHuman } from "@/utils/formatting"
import {
  positiveOptional,
  requiredObject,
  useValidateFormMaxBalance,
  validNumber,
} from "@/utils/validators"

export const MIN_DCA_ORDERS = 3
// once per block (600) and accounted for a buffer
const MAX_DCA_ORDERS_PER_HOUR = 540

export const getAbsoluteMaxDcaOrders = (duration: TimeFrame): number => {
  const hours = getTimeFrameMillis(duration) / millisecondsInHour

  return hours * MAX_DCA_ORDERS_PER_HOUR
}

export enum DcaOrdersMode {
  Custom = "Custom",
  Auto = "Auto",
}

const ordersSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal(DcaOrdersMode.Custom),
    value: validNumber
      .min(MIN_DCA_ORDERS, {
        error: i18n.t("trade:dca.errors.minOrders", { count: MIN_DCA_ORDERS }),
      })
      .nullable(),
  }),
  z.object({
    type: z.literal(DcaOrdersMode.Auto),
    value: z.never().optional(),
  }),
])

export type DcaOrders = z.infer<typeof ordersSchema>

export const dcaTimeFrameTypes = timeFrameTypes.filter(
  (type) => type !== "minute" && type !== "month",
)

const schemaBase = z.object({
  sellAsset: requiredObject<TAsset>(),
  sellAmount: positiveOptional,
  buyAsset: requiredObject<TAsset>(),
  duration: getTimeFrameSchema(dcaTimeFrameTypes),
  orders: ordersSchema,
})

export type DcaFormValues = z.infer<typeof schemaBase>

const schema = schemaBase.superRefine(({ duration, orders }, { addIssue }) => {
  if (orders.type === DcaOrdersMode.Auto) {
    return
  }

  const maxOrders = getAbsoluteMaxDcaOrders(duration)

  if (orders.value && orders.value > maxOrders) {
    addIssue({
      code: "custom",
      message: i18n.t("trade:dca.errors.maxOrders", { count: maxOrders }),
      path: ["orders.value" satisfies FieldPath<DcaFormValues>],
    })
  }
})

const useSchema = (account: Account | null) => {
  const { t } = useTranslation()
  const rpc = useRpcProvider()
  const queryClient = useQueryClient()

  const refineMaxBalance = useValidateFormMaxBalance()

  const minBudgetSchema = schema
    .check(
      account
        ? refineMaxBalance("sellAmount", (form) => [
            form.sellAsset,
            form.sellAmount,
          ])
        : z.refine(() => true),
    )
    .check(async (ctx) => {
      const { sellAsset, sellAmount } = ctx.value

      if (!sellAsset || !sellAmount) {
        return
      }

      const minAmount = await queryClient.ensureQueryData(
        minimumOrderBudgetQuery(rpc, sellAsset.id, sellAsset.decimals),
      )

      const minAmountHuman = scaleHuman(
        minAmount.toString(),
        sellAsset.decimals,
      )

      const isValid = Big(sellAmount).gte(minAmountHuman)

      if (isValid) {
        return
      }

      ctx.issues.push({
        code: "custom",
        input: sellAmount,
        path: ["sellAmount" satisfies keyof DcaFormValues],
        message: t("error.minBudgetTooLow", {
          value: t("currency", {
            value: minAmountHuman,
            symbol: sellAsset.symbol,
          }),
        }),
      })
    })

  return minBudgetSchema
}

type Args = {
  readonly assetIn: string
  readonly assetOut: string
}

export const useDcaForm = ({ assetIn, assetOut }: Args) => {
  const { account } = useAccount()
  const { getAsset } = useAssets()
  const { isBalanceLoaded } = useAccountBalances()

  const defaultValues: DcaFormValues = {
    sellAsset: getAsset(assetIn) ?? null,
    sellAmount: "",
    buyAsset: getAsset(assetOut) ?? null,
    duration: {
      type: "day",
      value: 1,
    },
    orders: {
      type: DcaOrdersMode.Auto,
    },
  }

  const form = useForm<DcaFormValues>({
    mode: "onChange",
    defaultValues,
    resolver: standardSchemaResolver(useSchema(account)),
  })

  const { trigger, getValues } = form

  useEffect(() => {
    const { sellAsset, buyAsset } = getValues()

    if (!account || !sellAsset || !buyAsset) {
      return
    }

    if (isBalanceLoaded(buyAsset.id) && isBalanceLoaded(sellAsset.id)) {
      trigger()
    }
  }, [account, trigger, getValues, isBalanceLoaded])

  return form
}
