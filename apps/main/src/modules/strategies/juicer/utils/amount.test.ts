import { formatUnits } from "viem"
import { describe, expect, it } from "vitest"

import { parseExactAmount } from "./amount"

describe("Exact deposit and withdrawal amounts", () => {
  it("round-trips MAX including shares beyond Number precision", () => {
    const shares = 123_456_789_123_456_789_123_456_789n
    const exact = formatUnits(shares, 18)
    expect(parseExactAmount(exact, 18)).toBe(shares)
    expect(Number(exact).toString()).not.toBe(exact)
    expect(parseExactAmount("0.000000000000000001", 18)).toBe(1n)
    expect(parseExactAmount(".000000000000000001", 18)).toBe(1n)
    expect(parseExactAmount(".001", 18)).toBe(1_000_000_000_000_000n)
  })

  it("never rounds excess decimals or accepts a zero/negative amount", () => {
    for (const value of [
      "0.0000001",
      ".0000001",
      "1.0000005",
      "0",
      "-1",
      "1e3",
      "0x10",
      "Infinity",
      "NaN",
      ".",
      "",
    ])
      expect(() => parseExactAmount(value, 6)).toThrow()
    expect(parseExactAmount("1.000001", 6)).toBe(1_000_001n)
  })
})
