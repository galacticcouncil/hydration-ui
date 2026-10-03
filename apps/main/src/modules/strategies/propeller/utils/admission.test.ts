import { type PublicClient, zeroAddress } from "viem"
import { describe, expect, it, vi } from "vitest"

import { depositBounds, readDepositAdmission } from "./admission"

const defaults = {
  minimumHollar: 10n * 10n ** 18n,
  availableHollar: 8_000n * 10n ** 18n,
  price: 2_658_21456299n,
  ltvBps: 7_500n,
  decimals: 18,
  remainingAssets: 100n * 10n ** 18n,
}

describe("Shared deposit admission", () => {
  it("maps min/max HOLLAR trades to collateral-native amounts", () => {
    const { minimum, maximum } = depositBounds(defaults)
    const borrow = (amount: bigint) =>
      ((((amount * defaults.price) / 10n ** 18n) * defaults.ltvBps) / 10_000n) *
      10n ** 10n
    expect(borrow(minimum)).toBeGreaterThanOrEqual(defaults.minimumHollar)
    expect(borrow(minimum - 1n)).toBeLessThan(defaults.minimumHollar)
    expect(borrow(maximum)).toBeLessThanOrEqual(defaults.availableHollar)
    expect(maximum).toBeLessThan(5n * 10n ** 18n)
  })

  it("never borrows beyond shared credit across collateral scales and prices", () => {
    for (const decimals of [6, 8, 18]) {
      for (const price of [1n, 99_999_999n, 2658_21456299n, 84389_27019765n]) {
        for (const ltvBps of [1n, 7500n, 8000n, 10000n]) {
          const unit = 10n ** BigInt(decimals)
          const bounds = depositBounds({
            ...defaults,
            price,
            decimals,
            ltvBps,
          })
          if (!bounds.maximum) continue
          // Before/after reserve rounding can add one USD8 unit.
          const ceilValue = (bounds.maximum * price + unit - 1n) / unit
          const borrow = ((ceilValue * ltvBps) / 10_000n) * 10n ** 10n
          expect(borrow).toBeLessThanOrEqual(defaults.availableHollar)
          expect(bounds.maximum).toBeLessThanOrEqual(defaults.remainingAssets)
        }
      }
    }
  })

  it("treats exhausted, below-minimum, zero-cap and overfilled vaults as unavailable", () => {
    for (const override of [
      { availableHollar: 0n },
      { availableHollar: defaults.minimumHollar - 1n },
      { remainingAssets: 0n },
      { remainingAssets: -1n },
      { remainingAssets: 1n },
    ])
      expect(depositBounds({ ...defaults, ...override }).maximum).toBe(0n)
  })

  it("uses the remaining vault capacity when it is below the trade ceiling", () => {
    expect(
      depositBounds({ ...defaults, remainingAssets: 10n ** 18n }).maximum,
    ).toBe(10n ** 18n)
  })

  it("fails closed on missing price or invalid LTV/size data", () => {
    for (const override of [
      { price: 0n },
      { ltvBps: 0n },
      { ltvBps: 10001n },
      { minimumHollar: 0n },
    ])
      expect(() => depositBounds({ ...defaults, ...override })).toThrow()
  })
})

describe("Admission reads", () => {
  const address = "0x0000000000000000000000000000000000000001"
  const values: Record<string, unknown> = {
    executionController: address,
    yieldSource: address,
    pool: address,
    asset: address,
    tvlCap: defaults.remainingAssets,
    totalAssets: 0n,
    hollar: address,
    primeAToken: address,
    getConfiguration: 7500n,
    ADDRESSES_PROVIDER: address,
    actions: true,
    lane: `0x${"ab".repeat(32)}`,
    available: defaults.availableHollar,
    getPriceOracle: address,
    limits: [
      `0x${"cd".repeat(32)}`,
      defaults.minimumHollar,
      defaults.availableHollar,
    ],
    getAssetPrice: defaults.price,
    budgets: [address, 100n, 1n, 50n, 900n, 2000n],
  }
  const mockClient = (overrides: Record<string, unknown> = {}) => {
    const readContract = vi.fn(async (request) => {
      const data = { ...values, ...overrides }
      if (!(request.functionName in data)) throw new Error("Missing fixture")
      return data[request.functionName]
    })
    return {
      readContract,
      client: {
        readContract,
        getBlock: async () => ({ number: 100n, timestamp: 1000n }),
      } as unknown as PublicClient,
    }
  }

  it("discovers bindings and policy at one block", async () => {
    const { client, readContract } = mockClient()
    const result = await readDepositAdmission(client, address, address, 18)
    expect(result.maximum).toBe(depositBounds(defaults).maximum)
    expect(result.expired).toBe(false)
    expect(
      readContract.mock.calls.every(([call]) => call.blockNumber === 100n),
    ).toBe(true)
  })

  it("rejects disabled actions, absent bindings and wrong collateral", async () => {
    for (const override of [
      { actions: false },
      { executionController: zeroAddress },
      { asset: zeroAddress },
    ]) {
      const { client } = mockClient(override)
      await expect(
        readDepositAdmission(client, address, address, 18),
      ).rejects.toThrow()
    }
  })

  it("reports an expired policy and propagates RPC failure", async () => {
    const { client } = mockClient({
      budgets: [address, 100n, 1n, 50n, 900n, 999n],
      available: 0n,
    })
    expect(
      await readDepositAdmission(client, address, address, 18),
    ).toMatchObject({ expired: true, maximum: 0n })
    const failed = mockClient()
    failed.readContract.mockRejectedValueOnce(new Error("RPC offline"))
    await expect(
      readDepositAdmission(failed.client, address, address, 18),
    ).rejects.toThrow("RPC offline")
  })
})
