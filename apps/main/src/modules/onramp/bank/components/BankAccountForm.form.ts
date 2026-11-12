import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useForm } from "react-hook-form"
import { z } from "zod/v4"

import i18n from "@/i18n"
import type { BankAccountBody } from "@/modules/onramp/bank/utils/bankAccounts"

export type BankRail = "ach" | "sepa"

const text = (v: string) => v.trim()
const compact = (v: string) => v.replace(/\s+/g, "").toUpperCase()

// The field rules of `POST /v1/bank-accounts` (API doc 4: USD `rail: "ach"`,
// EUR `rail: "sepa"`). The server validates again; nothing else is accepted.
const RULES = {
  accountNumber: /^\d{4,17}$/,
  routingNumber: /^\d{9}$/,
  state: /^[A-Z]{2}$/,
  country: /^[A-Z]{3}$/,
  bic: /^[A-Z0-9]{8}([A-Z0-9]{3})?$/,
  iban: /^[A-Z]{2}\d{2}[A-Z0-9]{8,30}$/,
}

export const bankAccountFormSchema = z
  .object({
    rail: z.enum(["ach", "sepa"]),
    bankName: z.string(),
    accountNumber: z.string(),
    routingNumber: z.string(),
    checkingOrSavings: z.enum(["checking", "savings"]),
    iban: z.string(),
    bic: z.string(),
    streetLine1: z.string(),
    streetLine2: z.string(),
    city: z.string(),
    state: z.string(),
    postalCode: z.string(),
    country: z.string(),
  })
  .superRefine((v, ctx) => {
    const fail = (
      path: string,
      key:
        | "required"
        | "country"
        | "accountNumber"
        | "routingNumber"
        | "state"
        | "iban"
        | "bic",
    ) =>
      ctx.addIssue({
        code: "custom",
        path: [path],
        message: i18n.t(`onramp:bank.accounts.form.error.${key}`),
      })
    if (!text(v.streetLine1)) fail("streetLine1", "required")
    if (!text(v.city)) fail("city", "required")
    if (!text(v.postalCode)) fail("postalCode", "required")
    if (!RULES.country.test(compact(v.country))) fail("country", "country")
    if (v.rail === "ach") {
      if (!text(v.bankName)) fail("bankName", "required")
      if (!RULES.accountNumber.test(text(v.accountNumber)))
        fail("accountNumber", "accountNumber")
      if (!RULES.routingNumber.test(text(v.routingNumber)))
        fail("routingNumber", "routingNumber")
      if (!RULES.state.test(compact(v.state))) fail("state", "state")
    } else {
      if (!RULES.iban.test(compact(v.iban))) fail("iban", "iban")
      if (!RULES.bic.test(compact(v.bic))) fail("bic", "bic")
    }
  })

export type BankAccountFormValues = z.infer<typeof bankAccountFormSchema>

export const emptyBankAccountForm = (
  rail: BankRail,
): BankAccountFormValues => ({
  rail,
  bankName: "",
  accountNumber: "",
  routingNumber: "",
  checkingOrSavings: "checking",
  iban: "",
  bic: "",
  streetLine1: "",
  streetLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: rail === "ach" ? "USA" : "",
})

/**
 * The request body of ONE rail, built from the form: exactly the keys the API
 * accepts for that rail, never the other rail's fields and never a holder
 * name (HBR takes the owner from Bridge).
 */
export const toBankAccountBody = (
  v: BankAccountFormValues,
): BankAccountBody => {
  const streetLine2 = text(v.streetLine2)
  const street = {
    streetLine1: text(v.streetLine1),
    ...(streetLine2 ? { streetLine2 } : {}),
    city: text(v.city),
    postalCode: text(v.postalCode),
    country: compact(v.country),
  }
  if (v.rail === "ach") {
    return {
      rail: "ach",
      bankName: text(v.bankName),
      accountNumber: text(v.accountNumber),
      routingNumber: text(v.routingNumber),
      checkingOrSavings: v.checkingOrSavings,
      address: { ...street, state: compact(v.state) },
    }
  }
  const bankName = text(v.bankName)
  return {
    rail: "sepa",
    iban: compact(v.iban),
    bic: compact(v.bic),
    ...(bankName ? { bankName } : {}),
    address: street,
  }
}

export const useBankAccountForm = (rail: BankRail) =>
  useForm<BankAccountFormValues>({
    resolver: standardSchemaResolver(bankAccountFormSchema),
    defaultValues: emptyBankAccountForm(rail),
    mode: "onSubmit",
  })
