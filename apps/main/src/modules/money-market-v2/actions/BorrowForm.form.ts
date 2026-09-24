import type { BorrowAssessment } from "@galacticcouncil/money-market-v2/core"
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

export type BorrowFormValues = z.infer<ReturnType<typeof createSchema>>

export const useBorrowForm = (
  assessment: BorrowAssessment | undefined,
  decimals: number,
) =>
  useForm<BorrowFormValues>({
    defaultValues: { amount: "", acknowledged: false },
    resolver: standardSchemaResolver(
      createSchema(assessment?.max ?? "0", decimals),
    ),
    mode: "onChange",
  })
