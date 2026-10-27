import { beforeEach, describe, expect, it } from "vitest"

import { resetStableRates, stabilizeRate } from "./stableRate"

const GLITCH = "1.016260162601626" // exactly 1 / 0.984

describe("stabilizeRate", () => {
  beforeEach(resetStableRates)

  it("ignores a one-fetch outlier", () => {
    expect(stabilizeRate("v", "1.0173", 1)).toBe("1.0173")
    expect(stabilizeRate("v", GLITCH, 2)).toBe("1.0173")
    // every consumer re-reads the same fetch; that is not a confirmation
    expect(stabilizeRate("v", GLITCH, 2)).toBe("1.0173")
    expect(stabilizeRate("v", "1.01731", 3)).toBe("1.01731")
  })

  it("follows ordinary drift at once", () => {
    stabilizeRate("v", "1.0173", 1)
    expect(stabilizeRate("v", "1.0175", 2)).toBe("1.0175")
  })

  it("accepts a real move once a second fetch confirms it", () => {
    stabilizeRate("v", "1.0173", 1)
    expect(stabilizeRate("v", "1.0300", 2)).toBe("1.0173")
    expect(stabilizeRate("v", "1.0301", 3)).toBe("1.0301")
  })
})
