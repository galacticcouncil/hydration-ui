import { useAccount } from "@galacticcouncil/web3-connect"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useQueryClient } from "@tanstack/react-query"
import Big from "big.js"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { z } from "zod/v4"

import { minimumOrderBudgetQuery } from "@/api/trade"
import { periodInputSchema } from "@/components/PeriodInput/PeriodInput"
import { TAsset, useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { scaleHuman } from "@/utils/formatting"
import {
  positiveOptional,
  requiredObject,
  useValidateFormMaxBalance,
} from "@/utils/validators"

const schema = z.object({
  sellAsset: requiredObject<TAsset>(),
  sellAmount: positiveOptional,
  buyAsset: requiredObject<TAsset>(),
  period: periodInputSchema,
})

export type DcaFormValues = z.infer<typeof schema>

const useSchema = () => {
  const { t } = useTranslation()
  const rpc = useRpcProvider()
  const queryClient = useQueryClient()
  const { account } = useAccount()

  const refineMaxBalance = useValidateFormMaxBalance()

  const minBudgetSchema = schema.check(async (ctx) => {
    const { sellAsset, sellAmount } = ctx.value

    if (!sellAsset || !sellAmount) {
      return
    }

    const minAmount = await queryClient.ensureQueryData(
      minimumOrderBudgetQuery(rpc, sellAsset.id),
    )

    const minAmountHuman = scaleHuman(minAmount.toString(), sellAsset.decimals)

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

  if (!account) {
    return minBudgetSchema
  }

  return minBudgetSchema.check(
    refineMaxBalance("sellAmount", (form) => [form.sellAsset, form.sellAmount]),
  )
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
