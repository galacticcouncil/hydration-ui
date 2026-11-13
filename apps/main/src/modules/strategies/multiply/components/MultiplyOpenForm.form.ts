import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useForm } from "react-hook-form"
import { z } from "zod/v4"

import { positive, required, validateFieldMaxBalance } from "@/utils/validators"

export type MultiplyOpenFormValues = {
  amount: string
  leverage: number
}

const useSchema = (maxBalance: string) =>
  z.object({
    amount: required.pipe(positive).check(validateFieldMaxBalance(maxBalance)),
    leverage: z.number(),
  })

export const useMultiplyOpenForm = ({
  maxBalance,
  defaultLeverage,
}: {
  maxBalance: string
  defaultLeverage: number
}) =>
  useForm<MultiplyOpenFormValues>({
    defaultValues: { amount: "", leverage: defaultLeverage },
    resolver: standardSchemaResolver(useSchema(maxBalance)),
    mode: "onChange",
  })
