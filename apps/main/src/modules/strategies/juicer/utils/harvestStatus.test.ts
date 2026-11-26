import { type PublicClient } from "viem"
import { describe, expect, it, vi } from "vitest"

import { readHarvestStatus } from "./harvestStatus"
import { readPendingYield } from "./pendingYield"

const vault = "0x0000000000000000000000000000000000000001"
const source = "0x0000000000000000000000000000000000000002"
const ledger = "0x0000000000000000000000000000000000000003"
const wad = 10n ** 18n
const usd = 10n ** 8n

const fixture = (overrides: Record<string, unknown> = {}) => {
  const values: Record<string, unknown> = {
    yieldSource: source,
    mainDebt: ledger,
    yieldAccounting: ledger,
    totalEquity: 1000n * usd,
    principalEquity: 1000n * wad,
    unwindTargetEquity: 0n,
    executionCostReserve: 10n * wad,
    harvestCapacity: 0n,
    harvestThreshold: wad / 1000n,
    paused: false,
    emergencyPaused: false,
    pendingSourceAccounting: false,
    serviceBlocked: false,
    earnedAssets: 301888684848612n,
    fundedOf: 0n,
    ...overrides,
  }
  const readContract = vi.fn(
    async ({ functionName }: { functionName: string }) => {
      const value = values[functionName]
      if (value instanceof Error) throw value
      return value
    },
  )
  return { client: { readContract } as unknown as PublicClient, readContract }
}

describe("Pending yield harvest conditions", () => {
  it("keeps Alice's pending yield visible while source backing and reserves prevent harvest", async () => {
    const { client, readContract } = fixture({
      totalEquity: 8876566107052n,
      principalEquity: 88840358041651300000000n,
      executionCostReserve: 294797980300000000000n,
      harvestThreshold: 200000000000000n,
    })
    const status = await readHarvestStatus(client, vault, 44888n)
    expect(status.state).toBe("reserve")
    expect(status.reserveGap).toBe(369494951431300000000n)
    expect(status.minimumSurplus).toBe(17768071608330260000n)
    expect(await readPendingYield(client, vault, vault, 44888n)).toBe(
      301888684848612n,
    )
    expect(
      readContract.mock.calls.every(
        ([request]) =>
          "blockNumber" in request && request.blockNumber === 44888n,
      ),
    ).toBe(true)
  })

  it("includes withdrawals in the reserve gap and distinguishes minimum from safety capacity", async () => {
    const read = async (values: Record<string, unknown>) =>
      readHarvestStatus(fixture(values).client, vault, 1n)
    expect((await read({ unwindTargetEquity: 5n * wad })).reserveGap).toBe(
      15n * wad,
    )
    expect((await read({ totalEquity: 1010n * usd })).state).toBe("reserve")
    expect((await read({ totalEquity: 1011n * usd - 1n })).state).toBe(
      "minimum",
    )
    expect((await read({ totalEquity: 1011n * usd })).state).toBe("capacity")
    expect(
      (await read({ totalEquity: 1011n * usd, harvestCapacity: 1n })).state,
    ).toBe("awaiting")
    expect(
      (await read({ principalEquity: 1000n * wad + 1n })).minimumSurplus,
    ).toBe(wad + 1n)
    expect((await read({ principalEquity: 0n })).minimumSurplus).toBe(0n)
  })

  it("never reports awaiting harvest across a pause or unsettled debt gate", async () => {
    for (const [gate, state] of [
      ["paused", "paused"],
      ["emergencyPaused", "paused"],
      ["pendingSourceAccounting", "accounting"],
      ["serviceBlocked", "service"],
    ]) {
      const { client } = fixture({
        totalEquity: 2000n * usd,
        harvestCapacity: 1n,
        [gate!]: true,
      })
      expect((await readHarvestStatus(client, vault, 1n)).state).toBe(state)
    }
  })

  it("does not infer availability when a required read fails", async () => {
    const { client } = fixture({
      harvestCapacity: new Error("RPC unavailable"),
    })
    await expect(readHarvestStatus(client, vault, 1n)).rejects.toThrow(
      "RPC unavailable",
    )
    expect(await readPendingYield(client, vault, vault, 1n)).toBe(
      301888684848612n,
    )
  })
})
