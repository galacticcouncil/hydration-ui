import { describe, expect, it } from "vitest"

import type { NetApyPosition, NetApySummary } from "@/core"
import { summarizeNetApy } from "@/core"

/** A rate on a side that is not held: it must not reach the result. */
const UNUSED = "0.99"

const position = (
  suppliedUsd: string,
  borrowedUsd: string,
  supplyRate: string | null,
  borrowRate: string | null,
  borrowRewardRate?: string,
): NetApyPosition => ({
  suppliedUsd,
  borrowedUsd,
  supplyRate,
  borrowRate,
  borrowRewardRate,
})

type Expected = {
  earned: number | null
  debt: number | null
  net: number | null
  reason?: NetApySummary["reason"]
}

/**
 * Rows 1 to 12 are legacy `getUserApyValues` output; 13 and 14 are the
 * corrected values, where legacy divided by zero and special-cased Hollar.
 */
const cases: [string, NetApyPosition[], Expected][] = [
  ["no positions", [], { earned: 0, debt: 0, net: 0 }],
  [
    "supply only",
    [position("1000", "0", "0.05", UNUSED)],
    { earned: 0.05, debt: 0, net: 0.05 },
  ],
  [
    "supply and borrow",
    [
      position("1000", "0", "0.05", UNUSED),
      position("0", "400", UNUSED, "0.08"),
    ],
    { earned: 0.05, debt: 0.08, net: 0.03 },
  ],
  [
    "both sides of one reserve",
    [
      position("1000", "100", "0.05", "0.07"),
      position("3000", "400", "0.02", "0.08"),
    ],
    { earned: 0.0275, debt: 0.078, net: 0.0202857142857 },
  ],
  [
    "supply rate including incentives",
    [position("1000", "0", "0.08", UNUSED)],
    { earned: 0.08, debt: 0, net: 0.08 },
  ],
  [
    "borrow reward",
    [
      position("1000", "0", "0.05", UNUSED),
      position("0", "400", UNUSED, "0.08", "0.03"),
    ],
    { earned: 0.062, debt: 0.08, net: 0.05 },
  ],
  [
    "two supplies, one also borrowed",
    [
      position("1000", "200", "0.12", "0.13"),
      position("1000", "0", "0.07", UNUSED),
    ],
    { earned: 0.095, debt: 0.13, net: 0.0911111111111 },
  ],
  [
    "unavailable supply rate, held",
    [
      position("1000", "0", null, UNUSED),
      position("1000", "0", "0.05", UNUSED),
      position("0", "400", UNUSED, "0.08"),
    ],
    { earned: null, debt: 0.08, net: null, reason: "unavailable" },
  ],
  [
    "unavailable rates, nothing held",
    [
      position("0", "0", null, null),
      position("1000", "0", "0.05", UNUSED),
      position("0", "400", UNUSED, "0.08"),
    ],
    { earned: 0.05, debt: 0.08, net: 0.03 },
  ],
  [
    "unavailable borrow rate, held borrow",
    [position("0", "400", "0.12", null), position("1000", "0", "0.05", UNUSED)],
    { earned: 0.05, debt: null, net: null, reason: "unavailable" },
  ],
  [
    "unavailable borrow rate, supply held only",
    [position("1000", "0", "0.12", null), position("0", "400", UNUSED, "0.08")],
    { earned: 0.12, debt: 0.08, net: 0.146666666667 },
  ],
  [
    "negative net",
    [
      position("1000", "0", "0.01", UNUSED),
      position("0", "800", UNUSED, "0.10"),
    ],
    { earned: 0.01, debt: 0.1, net: -0.35 },
  ],
  [
    "zero net worth",
    [
      position("1000", "0", "0.05", UNUSED),
      position("0", "1000", UNUSED, "0.08"),
    ],
    { earned: 0.05, debt: 0.08, net: null, reason: "noNetWorth" },
  ],
  [
    "Hollar borrow with reward",
    [
      position("1000", "0", "0.05", UNUSED),
      position("0", "500", UNUSED, "0.06", "0.01"),
    ],
    { earned: 0.055, debt: 0.06, net: 0.05 },
  ],
]

const expectRate = (actual: string | null, expected: number | null) => {
  if (expected === null) return expect(actual).toBeNull()

  expect(actual).not.toBeNull()
  expect(actual).not.toMatch(/e/i)
  expect(Number(actual)).toBeCloseTo(expected, 10)
}

describe("summarizeNetApy", () => {
  it.each(cases)("%s", (_name, positions, expected) => {
    const summary = summarizeNetApy(positions)

    expectRate(summary.earnedApy, expected.earned)
    expectRate(summary.debtApy, expected.debt)
    expectRate(summary.netApy, expected.net)
    expect(summary.reason).toBe(expected.reason)
  })

  it("reports no positions as plain zeros", () => {
    expect(summarizeNetApy([])).toEqual({
      earnedApy: "0",
      debtApy: "0",
      netApy: "0",
    })
  })

  it("has no net APY when borrows exceed supplies", () => {
    expect(
      summarizeNetApy([
        position("1000", "0", "0.05", UNUSED),
        position("0", "1200", UNUSED, "0.08"),
      ]),
    ).toMatchObject({ netApy: null, reason: "noNetWorth" })
  })

  it("prefers unavailable over no net worth", () => {
    expect(
      summarizeNetApy([
        position("1000", "0", null, UNUSED),
        position("0", "1000", UNUSED, "0.08"),
      ]),
    ).toMatchObject({ netApy: null, reason: "unavailable" })
  })

  it("never writes a small rate in exponent notation", () => {
    const { netApy } = summarizeNetApy([
      position("1000000000", "0", "0.0000000001", UNUSED),
      position("1", "0", "0", UNUSED),
    ])

    expect(netApy).toMatch(/^0\.0+\d+$/)
  })
})
