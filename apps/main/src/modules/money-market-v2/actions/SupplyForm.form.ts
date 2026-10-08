import type { SupplyAssessment } from "@galacticcouncil/money-market-v2/core"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useForm } from "react-hook-form"
import * as z from "zod/v4"

import {
  maxDecimals,
  positive,
  required,
  validateFieldMaxBalance,
} from "@/utils/validators"

const createSchema = (max: string, decimals: number) =>
  z.object({
    amount: required
      .pipe(positive)
      .check(validateFieldMaxBalance(max), maxDecimals(decimals)),
    acknowledged: z.boolean(),
  })

export type SupplyFormValues = z.infer<ReturnType<typeof createSchema>>

export const useSupplyForm = (
  assessment: SupplyAssessment | undefined,
  decimals: number,
) =>
  useForm<SupplyFormValues>({
    defaultValues: { amount: "", acknowledged: false },
    resolver: standardSchemaResolver(
      createSchema(assessment?.max ?? "0", decimals),
    ),
    mode: "onChange",
  })
