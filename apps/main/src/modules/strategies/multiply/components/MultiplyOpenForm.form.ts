import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useForm } from "react-hook-form"
import { z } from "zod/v4"

import { positive, required, validateFieldMaxBalance } from "@/utils/validators"

export type MultiplyOpenFormValues = {
  /** in the pay asset */
  amount: string
  leverage: number
  payAssetId: string
  /** pays with the pool's reserves instead of `amount` of the pay asset */
  proportional: boolean
  /** per reserve, in its own units; balances are checked by the form */
  reserveAmounts: { assetId: string; amount: string }[]
}

const useSchema = (maxBalance: string) => {
  const amountSchema = required
    .pipe(positive)
    .check(validateFieldMaxBalance(maxBalance))

  return z
    .object({
      amount: z.string(),
      leverage: z.number(),
      payAssetId: z.string(),
      proportional: z.boolean(),
      reserveAmounts: z.array(
        z.object({ assetId: z.string(), amount: z.string() }),
      ),
    })
    .superRefine((values, ctx) => {
      if (values.proportional) return
      const result = amountSchema.safeParse(values.amount)
      if (!result.success) {
        ctx.addIssue({
          code: "custom",
          path: ["amount"],
          message: result.error.issues[0]?.message,
        })
      }
    })
}

export const useMultiplyOpenForm = ({
  maxBalance,
  defaultLeverage,
  payAssetId,
  defaultAmount = "",
}: {
  maxBalance: string
  defaultAmount?: string
  defaultLeverage: number
  payAssetId: string
}) =>
  useForm<MultiplyOpenFormValues>({
    defaultValues: {
      amount: defaultAmount,
      leverage: defaultLeverage,
      payAssetId,
      proportional: false,
      reserveAmounts: [],
    },
    resolver: standardSchemaResolver(useSchema(maxBalance)),
    mode: "onChange",
  })
