import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useForm } from "react-hook-form"
import { z } from "zod/v4"

import { positive, required, validateFieldMaxBalance } from "@/utils/validators"

const getSchema = (balance: string) =>
  z.object({
    amount: required.pipe(positive).check(validateFieldMaxBalance(balance)),
  })

export type PerpsDepositHydrationFormValues = z.infer<
  ReturnType<typeof getSchema>
>

export const usePerpsDepositHydrationForm = (balance: string) =>
  useForm<PerpsDepositHydrationFormValues>({
    defaultValues: { amount: "" },
    mode: "onChange",
    resolver: standardSchemaResolver(getSchema(balance)),
  })
