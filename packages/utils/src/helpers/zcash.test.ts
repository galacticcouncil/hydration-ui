import { AccountId } from "polkadot-api"
import { describe, expect, it } from "vitest"

import {
  safeConvertSS58ToZecAddress,
  safeConvertZecAddressToSS58,
} from "./zcash"

describe("zcash <-> ss58", () => {
  it.each([
    "t1aeEaUKb9mmnzfkf5hwb8iBD8yntpa9i62",
    "t1WSLtd8GKhPHk62fcwfqaexAmE9TE1CSQe",
  ])("round-trips %s", (address) => {
    const ss58 = safeConvertZecAddressToSS58(address)
    expect(ss58).not.toBe("")
    expect(safeConvertSS58ToZecAddress(ss58)).toBe(address)
  })

  it("rejects an ss58 that is not a packed zcash address", () => {
    const ss58 = AccountId(0).dec(new Uint8Array(32).fill(7))
    expect(safeConvertSS58ToZecAddress(ss58)).toBe("")
  })
})
