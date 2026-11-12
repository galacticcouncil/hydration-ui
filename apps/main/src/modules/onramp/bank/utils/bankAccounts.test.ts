import { describe, expect, it } from "vitest"

import {
  BankAccountBody,
  classifyCreateBankAccountError,
  classifyRemoveBankAccount,
  isBankAccountSubmissionDone,
  nextBankAccountSubmission,
} from "@/modules/onramp/bank/utils/bankAccounts"
import {
  HbrApiError,
  HbrNetworkError,
} from "@/modules/onramp/bank/utils/hbrErrors"

const ACH: BankAccountBody = {
  rail: "ach",
  bankName: "<placeholder bank>",
  accountNumber: "1234567890",
  routingNumber: "123456789",
  checkingOrSavings: "checking",
  address: {
    streetLine1: "<placeholder>",
    city: "<placeholder>",
    state: "NY",
    postalCode: "<placeholder>",
    country: "USA",
  },
}

const ids = () => {
  let n = 0
  return () => `id-${++n}`
}

describe("clientRequestId: one per submission, reused on its retries", () => {
  it("a retry of the same body reuses the id, whatever the key order", () => {
    const newId = ids()
    const first = nextBankAccountSubmission(null, ACH, newId)
    const reordered = {
      address: { ...ACH.address },
      checkingOrSavings: "checking",
      routingNumber: "123456789",
      accountNumber: "1234567890",
      bankName: "<placeholder bank>",
      rail: "ach",
    } as BankAccountBody
    expect(nextBankAccountSubmission(first, reordered, newId)).toBe(first)
    expect(first.clientRequestId).toBe("id-1")
  })

  it("a changed body is a new submission with a new id", () => {
    const newId = ids()
    const first = nextBankAccountSubmission(null, ACH, newId)
    const changed = { ...ACH, accountNumber: "1234567891" }
    expect(
      nextBankAccountSubmission(first, changed, newId).clientRequestId,
    ).toBe("id-2")
  })

  it("the submission ends on success and on client_request_id_reused only", () => {
    expect(isBankAccountSubmissionDone("success")).toBe(true)
    expect(
      isBankAccountSubmissionDone(
        new HbrApiError(409, "client_request_id_reused"),
      ),
    ).toBe(true)
    for (const outcome of [
      new HbrApiError(502, "outcome_unknown"),
      new HbrApiError(503, "bridge_unavailable"),
      new HbrApiError(422, "bank_account_rejected"),
      new HbrNetworkError(),
    ])
      expect(isBankAccountSubmissionDone(outcome)).toBe(false)
  })
})

describe("bank account create refusals", () => {
  it("rail_unavailable shows its gate", () => {
    expect(
      classifyCreateBankAccountError(
        new HbrApiError(409, "rail_unavailable", {
          error: "rail_unavailable",
          gate: "endorsement_absent",
        }),
      ),
    ).toEqual({ kind: "railUnavailable", gate: "endorsement_absent" })
  })

  it("an unknown refusal code is an unknown failure, never success", () => {
    expect(
      classifyCreateBankAccountError(new HbrApiError(409, "brand_new_code")),
    ).toEqual({ kind: "unknown" })
  })

  it("an unobserved outcome reads uncertain", () => {
    expect(
      classifyCreateBankAccountError(new HbrApiError(502, "outcome_unknown")),
    ).toEqual({ kind: "uncertain" })
    expect(classifyCreateBankAccountError(new HbrNetworkError())).toEqual({
      kind: "uncertain",
    })
  })

  it("the server's fixed detail is shown as sent", () => {
    const detail =
      "This bank account was removed. Add a different account or contact support."
    expect(
      classifyCreateBankAccountError(
        new HbrApiError(409, "bank_account_revoked", {
          error: "bank_account_revoked",
          detail,
        }),
      ),
    ).toEqual({ kind: "serverDetail", detail })
  })
})

describe("bank account remove", () => {
  it("reads the server's answer, never a local removal", () => {
    expect(classifyRemoveBankAccount({ status: "deactivated" })).toBe("removed")
    expect(classifyRemoveBankAccount({ status: "deactivation_pending" })).toBe(
      "removing",
    )
    expect(classifyRemoveBankAccount({ status: "unknown" })).toBe("unknown")
    expect(
      classifyRemoveBankAccount({
        error: new HbrApiError(409, "ramp_in_flight"),
      }),
    ).toBe("inFlight")
  })
})
