import { timeFrameSchema } from "@galacticcouncil/main/src/components/TimeFrame/TimeFrame.utils"
import { Account, useAccount } from "@galacticcouncil/web3-connect"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useQueryClient } from "@tanstack/react-query"
import Big from "big.js"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
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

const schema = z.object({
  sellAsset: requiredObject<TAsset>(),
  sellAmount: positiveOptional,
  buyAsset: requiredObject<TAsset>(),
  duration: timeFrameSchema,
  orders: ordersSchema,
})

export type DcaFormValues = z.infer<typeof schema>

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
  const { isBalanceLoading } = useAccountBalances()

  const defaultValues: DcaFormValues = {
    sellAsset: getAsset(assetIn) ?? null,
    sellAmount: "",
    buyAsset: getAsset(assetOut) ?? null,
    duration: {
      type: "day",
      value: 1,
    },
    orders: {
      type: DcaOrdersMode.Custom,
      value: null,
    },
  }

  const form = useForm<DcaFormValues>({
    mode: "onChange",
    defaultValues,
    resolver: standardSchemaResolver(useSchema(account)),
  })

  const { trigger } = form
  useEffect(() => {
    if (account && !isBalanceLoading) {
      trigger()
    }
  }, [account, isBalanceLoading, trigger])

  return form
}
