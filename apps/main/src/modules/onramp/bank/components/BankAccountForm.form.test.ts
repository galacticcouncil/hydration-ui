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
