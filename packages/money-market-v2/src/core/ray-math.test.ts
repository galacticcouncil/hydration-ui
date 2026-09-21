import Big from "big.js"
import { describe, expect, it } from "vitest"

import {
  binomialApproximatedRayPow,
  HALF_RAY,
  HALF_WAD,
  RAY,
  rayDiv,
  rayMul,
  rayPow,
  rayToWad,
  SECONDS_PER_YEAR,
  WAD,
  WAD_RAY_RATIO,
  wadToRay,
} from "@/core"

/** Upstream's `normalize(n, decimals)` — shift right, render as a decimal. */
const normalize = (n: bigint, decimals: number): string =>
  new Big(n.toString()).div(new Big(10).pow(decimals)).toFixed()

const percentageDiff = (a: bigint, b: bigint): number => {
  const diff = a > b ? a - b : b - a
  if (a === 0n) return 0
  return Math.abs(Number.parseFloat(normalize(rayDiv(diff, a * 100n), 24)))
}

const calculateCompoundedInterest = (
  rate: bigint,
  currentTimestamp: bigint,
  lastUpdateTimestamp: bigint,
): bigint =>
  binomialApproximatedRayPow(
    rate / SECONDS_PER_YEAR,
    currentTimestamp - lastUpdateTimestamp,
  )

/** The exact form the pool used before it switched to the binomial approximation. */
const legacyCalculateCompoundedInterest = (
  rate: bigint,
  currentTimestamp: bigint,
  lastUpdateTimestamp: bigint,
): bigint =>
  rayPow(rate / SECONDS_PER_YEAR + RAY, currentTimestamp - lastUpdateTimestamp)

describe("ray math", () => {
  describe("constants", () => {
    it("WAD should equal 1000000000000000000", () => {
      expect(WAD.toString()).toEqual("1000000000000000000")
    })

    it("HALF_WAD should equal 500000000000000000", () => {
      expect(HALF_WAD.toString()).toEqual("500000000000000000")
    })

    it("RAY should equal 1000000000000000000000000000", () => {
      expect(RAY.toString()).toEqual("1000000000000000000000000000")
    })

    it("HALF_RAY should equal 500000000000000000000000000", () => {
      expect(HALF_RAY.toString()).toEqual("500000000000000000000000000")
    })

    it("WAD_RAY_RATIO should equal 1000000000", () => {
      expect(WAD_RAY_RATIO.toString()).toEqual("1000000000")
    })
  })

  describe("rayMul", () => {
    it("should work correctly", () => {
      expect(rayMul(RAY, RAY)).toEqual(RAY)
    })

    // Upstream asserts `rayMul(0.1^30, RAY).decimalPlaces() === 0` and
    // `rayMul(0.5^27, RAY).toString() === '0'`. Both exist only to prove that
    // BigNumberZeroDecimal truncates on the way out; neither input is
    // expressible as a bigint. The property they check — a product smaller
    // than one ray divides down to zero — is asserted here instead, together
    // with the HALF_RAY bias that decides where that boundary sits.
    it("should truncate a sub-ray product to zero", () => {
      expect(rayMul(1n, 1n)).toEqual(0n)
      expect(rayMul(HALF_RAY - 1n, 1n)).toEqual(0n)
    })

    it("should round a half-ray product up, as the pool does", () => {
      expect(rayMul(HALF_RAY, 1n)).toEqual(1n)
    })
  })

  describe("rayPow and binomialApproximatedRayPow", () => {
    it("should be roughly equal", () => {
      const result = rayPow(
        323788616402133497883602337n / SECONDS_PER_YEAR + RAY,
        60n * 60n * 24n,
      ).toString()
      const approx = binomialApproximatedRayPow(
        323788616402133497883602337n / SECONDS_PER_YEAR,
        60n * 60n * 24n,
      ).toString()
      expect(result.substring(0, 8)).toEqual(approx.substring(0, 8))
    })

    it.each([
      { exponent: 0n, errorLte: 0 },
      { exponent: 60n, errorLte: 0.00001 },
      { exponent: 60n * 60n, errorLte: 0.00001 },
      { exponent: 60n * 60n * 24n, errorLte: 0.00001 },
      { exponent: 60n * 60n * 24n * 31n, errorLte: 0.00001 },
      { exponent: 60n * 60n * 24n * 365n, errorLte: 0.00001 },
      { exponent: 60n * 60n * 24n * 365n * 2n, errorLte: 0.00002 },
      { exponent: 60n * 60n * 24n * 365n * 5n, errorLte: 0.0003 },
    ])(
      "should have close results for exponent $exponent",
      ({ exponent, errorLte }) => {
        const ratePerSecond = 10000000000000000000000000n / SECONDS_PER_YEAR
        const result = rayPow(ratePerSecond + RAY, exponent)
        const approx = binomialApproximatedRayPow(ratePerSecond, exponent)

        expect(percentageDiff(result, approx)).toBeLessThanOrEqual(errorLte)
      },
    )

    /**
     * A balance is compounded from the user's last interaction with the
     * reserve. Most users touch a reserve several times a year, but the
     * approximation has to stay close for long holders too:
     * < 0.00005% error over one year, < 0.0005% over three, < 0.005% over five.
     */
    it.each([
      { years: 1n, interest: 3n, errorLte: 0.00001 },
      { years: 1n, interest: 5n, errorLte: 0.00001 },
      { years: 1n, interest: 10n, errorLte: 0.00001 },
      { years: 3n, interest: 3n, errorLte: 0.00001 },
      { years: 3n, interest: 5n, errorLte: 0.00001 },
      { years: 3n, interest: 10n, errorLte: 0.00005 },
      { years: 5n, interest: 3n, errorLte: 0.00001 },
      { years: 5n, interest: 5n, errorLte: 0.00003 },
      { years: 5n, interest: 10n, errorLte: 0.0003 },
    ])(
      "should not be far off over $years years at $interest",
      ({ years, interest, errorLte }) => {
        const timeSpan = 60n * 60n * 24n * 365n * years
        const rate = interest * 10n ** 24n
        const balance = 100000000000000000000000000n // 100M ETH

        const accurate =
          legacyCalculateCompoundedInterest(rate, timeSpan, 0n) * balance -
          balance
        const approximated =
          calculateCompoundedInterest(rate, timeSpan, 0n) * balance - balance

        expect(percentageDiff(accurate, approximated)).toBeLessThanOrEqual(
          errorLte,
        )
      },
    )

    it("should increase values over time", () => {
      const rate = 109284371694014197840985614n

      expect(
        legacyCalculateCompoundedInterest(rate, 2n, 0n) <
          legacyCalculateCompoundedInterest(rate, 3n, 0n),
      ).toBe(true)
      expect(
        calculateCompoundedInterest(rate, 2n, 0n) <
          calculateCompoundedInterest(rate, 3n, 0n),
      ).toBe(true)
    })
  })

  describe("wadToRay", () => {
    it("should convert wads to ray", () => {
      expect(wadToRay(100000000000000000000000000n).toString()).toBe(
        "100000000000000000000000000000000000",
      )
    })
  })

  describe("rayToWad", () => {
    it("should convert ray to wads", () => {
      expect(rayToWad(100000000000000000000000000000000000n).toString()).toBe(
        "100000000000000000000000000",
      )
    })
  })

  describe("rayDiv", () => {
    it("should divide ray", () => {
      expect(
        rayDiv(
          100000000000000000000000000000000000n,
          100000000000000000000000000n,
        ).toString(),
      ).toBe("1000000000000000000000000000000000000")
    })
  })
})
