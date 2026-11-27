import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useForm } from "react-hook-form"
import { z } from "zod/v4"

import i18n from "@/i18n"

// The request's own amount rule (rampRequestSchema; API doc 1, "Amounts"):
// a decimal string in USDC, at most 6 decimals, no leading zero, no sign.
const AMOUNT = /^(0|[1-9]\d*)(\.\d{1,6})?$/

export const bankCashOutFormSchema = z.object({
  bankAccountId: z.string().regex(/^[0-9a-f-]{36}$/, {
    error: () => i18n.t("onramp:bank.cashOut.form.error.account"),
  }),
  usdcAmount: z.preprocess(
    (v) => (typeof v === "string" ? v.trim() : ""),
    z
      .string()
      .regex(AMOUNT, {
        error: () => i18n.t("onramp:bank.cashOut.form.error.amount"),
      })
      .refine((v) => /[1-9]/.test(v), {
        error: () => i18n.t("onramp:bank.cashOut.form.error.amount"),
      }),
  ),
})

export type BankCashOutFormValues = z.infer<typeof bankCashOutFormSchema>

/** W01: the amount alone (the account is chosen on the next step). */
export const bankCashOutAmountSchema = bankCashOutFormSchema.pick({
  usdcAmount: true,
})

export type BankCashOutAmountValues = z.infer<typeof bankCashOutAmountSchema>

export const useBankCashOutAmountForm = (usdcAmount: string) =>
  useForm<
    z.input<typeof bankCashOutAmountSchema>,
    unknown,
    BankCashOutAmountValues
  >({
    defaultValues: { usdcAmount },
    resolver: standardSchemaResolver(bankCashOutAmountSchema),
  })
