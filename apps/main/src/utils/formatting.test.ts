import { describe, expect, it } from "vitest"

import { getProportionalAmount } from "./formatting"

describe("getProportionalAmount", () => {
  it("scales by reserve ratio and rounds down to target decimals", () => {
    expect(getProportionalAmount("100", "200000", "50000", 6)).toBe("25")
    expect(getProportionalAmount("1", "3", "1", 6)).toBe("0.333333")
  })

  it("returns empty for empty or zero input", () => {
    expect(getProportionalAmount("", "1", "1", 6)).toBe("")
    expect(getProportionalAmount("0", "1", "1", 6)).toBe("")
  })
})
