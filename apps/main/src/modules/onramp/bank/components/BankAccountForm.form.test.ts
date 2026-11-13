import { describe, expect, it, vi } from "vitest"

import {
  bankAccountFormSchema,
  emptyBankAccountForm,
  toBankAccountBody,
} from "@/modules/onramp/bank/components/BankAccountForm.form"
import { createBankAccountRequestSchema } from "@/modules/onramp/bank/config/schemas"

vi.mock("@/i18n", () => ({ default: { t: (key: string) => key } }))

const ID = "00000000-0000-4000-8000-0000000000a1"
const address = {
  streetLine1: " <placeholder> ",
  streetLine2: "",
  city: "<placeholder>",
  postalCode: "<placeholder>",
}

describe("bank account form body", () => {
  it("an ACH form sends exactly the ACH keys the API accepts", () => {
    const body = toBankAccountBody({
      ...emptyBankAccountForm("ach"),
      ...address,
      bankName: "<placeholder bank>",
      accountNumber: "1234567890",
      routingNumber: "123456789",
      state: "ny",
      iban: "DE89 3704 0044 0532 0130 00",
      bic: "COBADEFFXXX",
    })
    expect(
      createBankAccountRequestSchema.safeParse({ clientRequestId: ID, ...body })
        .success,
    ).toBe(true)
    expect(Object.keys(body).sort()).toEqual([
      "accountNumber",
      "address",
      "bankName",
      "checkingOrSavings",
      "rail",
      "routingNumber",
    ])
    expect(body.address).not.toHaveProperty("streetLine2")
  })

  it("a SEPA form sends no ACH field and no state", () => {
    const body = toBankAccountBody({
      ...emptyBankAccountForm("sepa"),
      ...address,
      country: "deu",
      iban: "DE89 3704 0044 0532 0130 00",
      bic: "cobadeffxxx",
      accountNumber: "1234567890",
      routingNumber: "123456789",
      state: "NY",
    })
    expect(
      createBankAccountRequestSchema.safeParse({ clientRequestId: ID, ...body })
        .success,
    ).toBe(true)
    expect(Object.keys(body).sort()).toEqual(["address", "bic", "iban", "rail"])
    expect(body.address).not.toHaveProperty("state")
  })

  it("validation follows the selected rail", () => {
    const ach = bankAccountFormSchema.safeParse({
      ...emptyBankAccountForm("ach"),
      ...address,
      accountNumber: "12",
    })
    const paths = ach.error?.issues.map((i) => i.path[0])
    expect(paths).toContain("accountNumber")
    expect(paths).toContain("routingNumber")
    expect(paths).not.toContain("iban")
  })
})

// The server's body parser, copied verbatim in behaviour from hydration-ramp
// server/routes/bankAccountRoutes.mjs:371-414 (parseBankAccountBody and its
// field tables) and ibanCountryAlpha3.mjs:16-53. Kept apart from the form's
// own rules so a drift in either goes red here.
const SERVER = (() => {
  // eslint-disable-next-line no-control-regex -- the server's own control-character rule
  const CONTROL = /[\u0000-\u001f\u007f-\u009f\u2028\u2029]/
  const text = (max: number) => (v: unknown) =>
    typeof v === "string" &&
    v.length >= 1 &&
    v.length <= max &&
    v === v.trim() &&
    !CONTROL.test(v)
  const re = (p: RegExp) => (v: unknown) => typeof v === "string" && p.test(v)
  const SEPA = new Set(
    "AT BE BG HR CY CZ DK EE FI FR DE GR HU IE IT LV LT LU MT NL PL PT RO SK SI ES SE IS LI NO CH GB MC SM AD VA".split(
      " ",
    ),
  )
  const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
  type Check = (v: unknown) => boolean
  const ADDRESS: Record<string, Record<string, Check>> = {
    ach: {
      streetLine1: text(100),
      streetLine2: text(100),
      city: text(64),
      state: re(/^[A-Z]{2}$/),
      postalCode: text(16),
      country: re(/^[A-Z]{3}$/),
    },
    sepa: {
      streetLine1: text(100),
      streetLine2: text(100),
      city: text(64),
      postalCode: text(16),
      country: re(/^[A-Z]{3}$/),
    },
  }
  const IBAN = /^[A-Z]{2}[0-9]{2}[A-Z0-9]{11,30}$/
  const BODY: Record<string, Record<string, Check>> = {
    ach: {
      clientRequestId: re(UUID),
      rail: (v) => v === "ach",
      bankName: text(100),
      accountNumber: re(/^[0-9]{4,17}$/),
      routingNumber: re(/^[0-9]{9}$/),
      checkingOrSavings: (v) => v === "checking" || v === "savings",
    },
    sepa: {
      clientRequestId: re(UUID),
      rail: (v) => v === "sepa",
      bankName: text(100),
      iban: (v) => re(IBAN)(v) && SEPA.has(String(v).slice(0, 2)),
      bic: re(/^[A-Z]{6}[A-Z0-9]{2}(?:[A-Z0-9]{3})?$/),
    },
  }
  const OPTIONAL: Record<string, Set<string>> = {
    ach: new Set(),
    sepa: new Set(["bankName"]),
  }
  const exactly = (
    obj: unknown,
    fields: Record<string, Check>,
    optional: Set<string>,
  ) => {
    if (obj === null || typeof obj !== "object" || Array.isArray(obj))
      return false
    const o = obj as Record<string, unknown>
    if (Object.keys(o).some((k) => !Object.hasOwn(fields, k))) return false
    return Object.entries(fields).every(([k, ok]) =>
      Object.hasOwn(o, k) ? ok(o[k]) : optional.has(k),
    )
  }
  return (body: Record<string, unknown>) => {
    const rail = String(body.rail)
    const fields = BODY[rail]
    const address = ADDRESS[rail]
    if (!fields || !address) return false
    const { address: addr, ...rest } = body
    return (
      exactly(rest, fields, OPTIONAL[rail] ?? new Set()) &&
      exactly(addr, address, new Set(["streetLine2"]))
    )
  }
})()

describe("the form refuses exactly what the server parser refuses", () => {
  const ach = {
    ...emptyBankAccountForm("ach"),
    ...address,
    bankName: "<placeholder bank>",
    accountNumber: "1234567890",
    routingNumber: "123456789",
    state: "NY",
  }
  const sepa = {
    ...emptyBankAccountForm("sepa"),
    ...address,
    country: "DEU",
    iban: "DE89370400440532013000",
    bic: "COBADEFFXXX",
  }
  const verdicts = (values: typeof ach) => {
    const form = bankAccountFormSchema.safeParse(values).success
    const server = SERVER({ clientRequestId: ID, ...toBankAccountBody(values) })
    return { form, server }
  }

  it.each([
    ["ach", ach],
    [
      "ach + line 2 + savings",
      {
        ...ach,
        streetLine2: "<placeholder>",
        checkingOrSavings: "savings" as const,
      },
    ],
    ["sepa", sepa],
    [
      "sepa + bank name + 8-char BIC",
      { ...sepa, bankName: "<placeholder>", bic: "COBADEFF" },
    ],
  ])("accepted by both: %s", (_name, values) => {
    expect(verdicts(values)).toEqual({ form: true, server: true })
  })

  it.each([
    [
      "IBAN with 8 characters after the check digits",
      { ...sepa, iban: "DE8912345678" },
    ],
    ["IBAN of a non-SEPA country", { ...sepa, iban: "US89370400440532013000" }],
    ["BIC whose first 6 are not all letters", { ...sepa, bic: "COBA1EFFXXX" }],
    ["bank name over 100", { ...ach, bankName: "b".repeat(101) }],
    ["postal code over 16", { ...ach, postalCode: "1".repeat(17) }],
    ["a control character", { ...ach, city: "New\u0007York" }],
  ])("refused by both: %s", (_name, values) => {
    expect(verdicts(values)).toEqual({ form: false, server: false })
  })
})

describe("no raw zod message can reach the user", () => {
  const fields = Object.keys(emptyBankAccountForm("ach"))
  const junk: unknown[] = [undefined, null, 42, {}, [], true, "", " "]

  it.each(["ach", "sepa", "other", undefined])(
    "rail %s: every issue for any junk in any field is one of our translations",
    (rail) => {
      for (const field of fields)
        for (const value of junk) {
          const values = {
            ...emptyBankAccountForm("ach"),
            rail,
            [field]: value,
          }
          const result = bankAccountFormSchema.safeParse(values)
          for (const issue of result.error?.issues ?? [])
            expect(issue.message).toMatch(
              /^onramp:bank\.accounts\.form\.error\./,
            )
        }
    },
  )

  it("fields of the other rail never fail: an all-undefined SEPA form fails only on visible SEPA fields", () => {
    const result = bankAccountFormSchema.safeParse({ rail: "sepa" })
    const paths = (result.error?.issues ?? []).map((i) => String(i.path[0]))
    expect(paths.sort()).toEqual(
      ["bic", "city", "country", "iban", "postalCode", "streetLine1"].sort(),
    )
  })
})

describe("country and state come from the offered lists", () => {
  const ach = {
    ...emptyBankAccountForm("ach"),
    ...address,
    bankName: "<placeholder bank>",
    accountNumber: "1234567890",
    routingNumber: "123456789",
  }
  const paths = (values: object) =>
    (bankAccountFormSchema.safeParse(values).error?.issues ?? []).map((i) =>
      String(i.path[0]),
    )

  it("refuses a country code that is not ISO 3166-1", () => {
    expect(paths({ ...ach, state: "NY", country: "XYZ" })).toContain("country")
    expect(paths({ ...ach, state: "NY", country: "USA" })).toEqual([])
  })

  it("a US address takes a USPS code only; another country two letters", () => {
    expect(paths({ ...ach, state: "ZZ" })).toContain("state")
    expect(paths({ ...ach, state: "DC" })).toEqual([])
    expect(paths({ ...ach, country: "CAN", state: "ON" })).toEqual([])
  })
})
