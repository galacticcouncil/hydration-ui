import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useForm } from "react-hook-form"
import { z } from "zod/v4"

import { positive, required, validateFieldMaxBalance } from "@/utils/validators"

export type MultiplyOpenFormValues = {
  /** in the pay asset */
  amount: string
  leverage: number
  payAssetId: string
}

const useSchema = (maxBalance: string) =>
  z.object({
    amount: required.pipe(positive).check(validateFieldMaxBalance(maxBalance)),
    leverage: z.number(),
    payAssetId: z.string(),
  })

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
    },
    resolver: standardSchemaResolver(useSchema(maxBalance)),
    mode: "onChange",
  })
