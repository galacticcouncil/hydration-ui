import { type PublicClient } from "viem"
import { describe, expect, it, vi } from "vitest"

import { readPendingYield } from "./pendingYield"

const vault = "0x0000000000000000000000000000000000000001"
const owner = "0x0000000000000000000000000000000000000002"
const accounting = "0x0000000000000000000000000000000000000003"
const unit = 10n ** 18n

const mockClient = (values: Record<string, unknown>) => {
  const readContract = vi.fn(async (request) => {
    if (!(request.functionName in values))
      throw new Error(`Unexpected read: ${request.functionName}`)
    const value = values[request.functionName]
    return typeof value === "function" ? value(request) : value
  })
  return { readContract, client: { readContract } as unknown as PublicClient }
}

describe("Pending yield", () => {
  it("subtracts funded earnings already in the balance, all at one block", async () => {
    const mock = mockClient({
      yieldAccounting: accounting,
      earnedAssets: 5n * unit,
      fundedOf: 3n * unit,
      // shares trade above par: 3 funded shares are worth 3.3 collateral
      convertToAssets: ({ args }: { args: [bigint] }) => (args[0] * 11n) / 10n,
    })
    expect(await readPendingYield(mock.client, vault, owner, 77n)).toBe(
      17n * 10n ** 17n,
    )
    expect(
      mock.readContract.mock.calls.every(
        ([request]) => request.blockNumber === 77n,
      ),
    ).toBe(true)
    expect(
      mock.readContract.mock.calls
        .filter(([request]) => request.address === accounting)
        .map(([request]) => request.args),
    ).toEqual([[owner], [owner]])
  })

  it("reports everything as pending before a harvest funds any of it", async () => {
    const mock = mockClient({
      yieldAccounting: accounting,
      earnedAssets: 4n,
      fundedOf: 0n,
    })
    expect(await readPendingYield(mock.client, vault, owner, 1n)).toBe(4n)
    expect(
      mock.readContract.mock.calls.map(([request]) => request.functionName),
    ).not.toContain("convertToAssets")
  })

  it("never goes negative when separate roundings overshoot", async () => {
    const mock = mockClient({
      yieldAccounting: accounting,
      earnedAssets: 10n,
      fundedOf: 10n,
      convertToAssets: 11n,
    })
    expect(await readPendingYield(mock.client, vault, owner, 1n)).toBe(0n)
  })

  it("propagates a missing view so callers can leave pending yield unknown", async () => {
    const mock = mockClient({ yieldAccounting: accounting, earnedAssets: 1n })
    await expect(
      readPendingYield(mock.client, vault, owner, 1n),
    ).rejects.toThrow("fundedOf")
  })
})
