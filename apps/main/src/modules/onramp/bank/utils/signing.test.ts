import { describe, expect, it, vi } from "vitest"

import {
  HbrApiError,
  HbrNetworkError,
  HbrResponseError,
} from "@/modules/onramp/bank/utils/hbrErrors"
import { classifySignError } from "@/modules/onramp/bank/utils/signing"

// Load the real EIP-1193 helper only, not the wallet package's app graph.
vi.mock("@galacticcouncil/web3-connect", async () => {
  const ethereum = await import(
    "@galacticcouncil/web3-connect/src/utils/ethereum"
  )
  return {
    EIP1193_USER_REJECTED: ethereum.EIP1193_USER_REJECTED,
    getEip1193ErrorCode: ethereum.getEip1193ErrorCode,
  }
})
vi.mock("@galacticcouncil/xc-cfg", () => ({}))

describe("sign error classification", () => {
  it("the provider's own 4001 is a decline", () => {
    expect(classifySignError({ code: 4001, message: "rejected" })).toBe(
      "declined",
    )
  })

  it("a wrapper that dropped the code is not a decline", () => {
    expect(classifySignError(new Error("User rejected (4001)"))).toBe(
      "walletFailed",
    )
    expect(classifySignError({ code: 4100 })).toBe("walletFailed")
  })

  it("server refusals and missing answers", () => {
    expect(classifySignError(new HbrApiError(401, "unauthorized"))).toBe(
      "refused",
    )
    expect(classifySignError(new HbrApiError(422, "bind_refused"))).toBe(
      "refused",
    )
    expect(classifySignError(new HbrApiError(409, "bind_refused"))).toBe(
      "bindTaken",
    )
    expect(classifySignError(new HbrApiError(429, "rate_limited"))).toBe(
      "rateLimited",
    )
    expect(classifySignError(new HbrNetworkError())).toBe("unconfirmed")
  })

  it("an unreadable server answer never reads as the wallet not signing", () => {
    expect(classifySignError(new HbrResponseError(200))).toBe("unknown")
  })
})
