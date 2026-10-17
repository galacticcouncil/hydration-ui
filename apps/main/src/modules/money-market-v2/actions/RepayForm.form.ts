import type { RepayAssessment } from "@galacticcouncil/money-market-v2/core"
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
    isMax: z.boolean(),
  })

export type RepayFormValues = z.infer<ReturnType<typeof createSchema>>

export const useRepayForm = (
  assessment: RepayAssessment | undefined,
  decimals: number,
) =>
  useForm<RepayFormValues>({
    defaultValues: { amount: "", isMax: false },
    resolver: standardSchemaResolver(
      createSchema(assessment?.max ?? "0", decimals),
    ),
    mode: "onChange",
  })
