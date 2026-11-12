import { describe, expect, it } from "vitest"

import {
  safeConvertNearAddressToSS58,
  safeConvertSS58ToNearAddress,
} from "./near"

describe("near <-> ss58", () => {
  const implicit = "a".repeat(64)

  it("round-trips an implicit account", () => {
    const ss58 = safeConvertNearAddressToSS58(implicit)
    expect(ss58).not.toBe("")
    expect(safeConvertSS58ToNearAddress(ss58)).toBe(implicit)
  })

  it("has no ss58 form for a named account", () => {
    expect(safeConvertNearAddressToSS58("alice.near")).toBe("")
  })
})
