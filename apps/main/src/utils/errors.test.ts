import { describe, expect, it, vi } from "vitest"

import { isWalletRejection } from "./errors"

vi.mock("@/states/provider", () => ({ useProviderRpcUrlStore: {} }))

describe("isWalletRejection", () => {
  it.each([
    "Cancelled",
    "Error.Cancelled",
    "Canceled",
    "Rejected",
    "Rejected by user",
    "User rejected the request.",
    "MetaMask Tx Signature: User denied transaction signature.",
    "Request rejected",
  ])("treats %s as the user declining", (message) => {
    expect(isWalletRejection(message)).toBe(true)
    expect(isWalletRejection(new Error(message))).toBe(true)
  })

  it("recognises the EIP-1193 rejection code", () => {
    expect(isWalletRejection({ code: 4001, message: "anything" })).toBe(true)
  })

  it.each([
    undefined,
    null,
    "",
    "Invalid Transaction: Custom error: 10",
    "1010: Invalid Transaction: Inability to pay some fees",
    "Transaction was cancelled by a newer one",
    "Error.Invalid transaction",
  ])("does not treat %s as a rejection", (error) => {
    expect(isWalletRejection(error)).toBe(false)
  })
})
