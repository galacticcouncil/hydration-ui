import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { Resolver, useForm } from "react-hook-form"
import { z } from "zod/v4"

import i18n from "@/i18n"
import {
  COUNTRY_CODES,
  US_STATE_CODES,
} from "@/modules/onramp/bank/utils/addressOptions"
import type { BankAccountBody } from "@/modules/onramp/bank/utils/bankAccounts"

export type BankRail = "ach" | "sepa"

const text = (v: string) => v.trim()
const compact = (v: string) => v.replace(/\s+/g, "").toUpperCase()

// The server's own field rules, copied from hydration-ramp
// server/routes/bankAccountRoutes.mjs:371-389 (B1: `text(max)`, ADDRESS_FIELDS,
// IBAN, BODY_FIELDS) and server/lib/bridge/ibanCountryAlpha3.mjs:16-53 (the
// SEPA IBAN countries). The form refuses what the server would refuse with 400.
// eslint-disable-next-line no-control-regex -- the server's own control-character rule
const CONTROL = /[\u0000-\u001f\u007f-\u009f\u2028\u2029]/
const RULES = {
  accountNumber: /^[0-9]{4,17}$/,
  routingNumber: /^[0-9]{9}$/,
  state: /^[A-Z]{2}$/,
  country: /^[A-Z]{3}$/,
  bic: /^[A-Z]{6}[A-Z0-9]{2}(?:[A-Z0-9]{3})?$/,
  iban: /^[A-Z]{2}[0-9]{2}[A-Z0-9]{11,30}$/,
}
export const SEPA_IBAN_COUNTRIES: ReadonlySet<string> = new Set(
  "AT BE BG HR CY CZ DK EE FI FR DE GR HU IE IT LV LT LU MT NL PL PT RO SK SI ES SE IS LI NO CH GB MC SM AD VA".split(
    " ",
  ),
)
const MAX = { bankName: 100, street: 100, city: 64, postalCode: 16 }

/** The server's `text(max)`, after our trim: 1..max characters, no control character. */
const isText = (v: string, max: number) =>
  v.length >= 1 && v.length <= max && !CONTROL.test(v)

// Every field parses whatever the form holds: a field of the other rail (or
// one never rendered) can be undefined after a rail switch, and must neither
// fail nor show zod's own message. A missing or non-string value reads as ""
// and is then judged only by the selected rail's rules below.
const formText = z.preprocess(
  (v) => (typeof v === "string" ? v : ""),
  z.string(),
)

export const bankAccountFormSchema = z
  .object({
    rail: z.enum(["ach", "sepa"], {
      error: () => i18n.t("onramp:bank.accounts.form.error.rail"),
    }),
    bankName: formText,
    accountNumber: formText,
    routingNumber: formText,
    checkingOrSavings: z.preprocess(
      (v) => (v === "savings" ? "savings" : "checking"),
      z.enum(["checking", "savings"]),
    ),
    iban: formText,
    bic: formText,
    streetLine1: formText,
    streetLine2: formText,
    city: formText,
    state: formText,
    postalCode: formText,
    country: formText,
  })
  .superRefine((v, ctx) => {
    const fail = (
      path: string,
      key:
        | "text"
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
    const streetLine2 = text(v.streetLine2)
    if (!isText(text(v.streetLine1), MAX.street)) fail("streetLine1", "text")
    if (streetLine2 && !isText(streetLine2, MAX.street))
      fail("streetLine2", "text")
    if (!isText(text(v.city), MAX.city)) fail("city", "text")
    if (!isText(text(v.postalCode), MAX.postalCode)) fail("postalCode", "text")
    // The server takes any three capitals (bankAccountRoutes.mjs:377-378); the
    // form offers and accepts only ISO 3166-1 alpha-3 codes, a subset.
    const country = compact(v.country)
    if (!RULES.country.test(country) || !COUNTRY_CODES.has(country))
      fail("country", "country")
    const bankName = text(v.bankName)
    if (v.rail === "ach") {
      if (!isText(bankName, MAX.bankName)) fail("bankName", "text")
      if (!RULES.accountNumber.test(text(v.accountNumber)))
        fail("accountNumber", "accountNumber")
      if (!RULES.routingNumber.test(text(v.routingNumber)))
        fail("routingNumber", "routingNumber")
      // Any two capitals for the server (bankAccountRoutes.mjs:377); for a US
      // address, one of the USPS codes the dropdown offers.
      const state = compact(v.state)
      if (
        !RULES.state.test(state) ||
        (country === "USA" && !US_STATE_CODES.has(state))
      )
        fail("state", "state")
    } else {
      const iban = compact(v.iban)
      if (!RULES.iban.test(iban) || !SEPA_IBAN_COUNTRIES.has(iban.slice(0, 2)))
        fail("iban", "iban")
      if (!RULES.bic.test(compact(v.bic))) fail("bic", "bic")
      if (bankName && !isText(bankName, MAX.bankName)) fail("bankName", "text")
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
    // The schema's input is looser than its output (fields of the other rail
    // may be undefined); the form holds the output shape.
    resolver: standardSchemaResolver(
      bankAccountFormSchema,
    ) as unknown as Resolver<BankAccountFormValues>,
    defaultValues: emptyBankAccountForm(rail),
    mode: "onSubmit",
  })
