import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useQueryClient } from "@tanstack/react-query"
import Big from "big.js"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import * as z from "zod"

import { minimumOrderBudgetQuery } from "@/api/trade"
import { periodInputSchema } from "@/components/PeriodInput/PeriodInput"
import { TAsset, useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { scaleHuman } from "@/utils/formatting"
import {
  positive,
  required,
  requiredObject,
  useValidateFormMaxBalance,
} from "@/utils/validators"

const schema = z.object({
  sellAsset: requiredObject<TAsset>(),
  sellAmount: required.pipe(positive),
  buyAsset: requiredObject<TAsset>(),
  period: periodInputSchema,
})

export type DcaFormValues = z.infer<typeof schema>

const useSchema = () => {
  const { t } = useTranslation()
  const rpc = useRpcProvider()
  const queryClient = useQueryClient()

  const refineMaxBalance = useValidateFormMaxBalance()

  return schema
    .check(
      refineMaxBalance("sellAmount", (form) => [
        form.sellAsset,
        form.sellAmount,
      ]),
    )
    .check(async (ctx) => {
      const { sellAsset, sellAmount } = ctx.value

      if (!sellAsset || !sellAmount) {
        return
      }

      const minAmount = await queryClient.ensureQueryData(
        minimumOrderBudgetQuery(rpc, sellAsset.id),
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
}

type Args = {
  readonly assetIn: string
  readonly assetOut: string
}

export const useDcaForm = ({ assetIn, assetOut }: Args) => {
  const { getAsset } = useAssets()

  const defaultValues: DcaFormValues = {
    sellAsset: getAsset(assetIn) ?? null,
    sellAmount: "",
    buyAsset: getAsset(assetOut) ?? null,
    period: {
      type: "day",
      value: 1,
    },
  }

  return useForm<DcaFormValues>({
    mode: "onChange",
    defaultValues,
    resolver: standardSchemaResolver(useSchema()),
  })
}
