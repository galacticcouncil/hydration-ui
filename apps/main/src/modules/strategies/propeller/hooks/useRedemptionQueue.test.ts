import { describe, expect, it, vi } from "vitest"

import { type TProviderContext } from "@/providers/rpcProvider"

import { vaultQueueQuery } from "./useRedemptionQueue"

const vault = {
  assetId: "34",
  shareSymbol: "jETH",
  vaultAddress: "0x0000000000000000000000000000000000000001",
} as const
const owner = "0x0000000000000000000000000000000000000002"
const mainDebt = "0x00000000000000000000000000000000000000aa"
const accounting = "0x00000000000000000000000000000000000000bb"
const unit = 10n ** 18n

const redemption = (shares: bigint, collateralOwed = 0n) =>
  [owner, shares, collateralOwed, 0n, 0n, 0n, 0n, 0n, true] as const

const queue = async (requestUnits: bigint) => {
  const values: Record<string, (args: readonly unknown[]) => unknown> = {
    queueTail: () => 2n,
    totalQueuedShares: () => unit,
    // request 0 started its unwind, request 1 still waits
    queueUnwind: () => 1n,
    mainDebt: () => mainDebt,
    yieldAccounting: () => accounting,
    redemptions: ([id]) =>
      id === 0n ? redemption(unit, 2n * unit) : redemption(2n * unit),
    unwindEligibleAt: () => 0n,
    claimedCollateral: () => 0n,
    positions: () => [0n, 0n, 0n, 0n, owner],
    surplusOf: () => 0n,
    requestUnits: ([id]) => (id === 1n ? requestUnits : 0n),
    requestEpoch: () => 1n,
    requestScale: () => 0n,
    epoch: () => 1n,
    unitScale: () => 0n,
    totalUnits: () => 100n * unit,
    walletOf: ([account]) => (account === accounting ? 50n * unit : 0n),
  }
  const readContract = vi.fn(
    async ({
      functionName,
      args = [],
    }: {
      functionName: string
      args?: readonly unknown[]
    }) => {
      const value = values[functionName]
      if (!value) throw new Error(`Unexpected read: ${functionName}`)
      return value(args)
    },
  )
  const rpc = {
    isReady: true,
    evm: {
      getBlock: async () => ({ number: 9n, timestamp: 1n }),
      readContract,
    },
  } as unknown as TProviderContext
  const query = vaultQueueQuery(rpc, vault, 18, owner)
  if (typeof query.queryFn !== "function")
    throw new Error("Expected query function")
  return { result: await query.queryFn({} as never), readContract }
}

describe("Withdrawal queue shares", () => {
  it("counts the funded earnings a waiting request took beyond its wallet", async () => {
    const { result, readContract } = await queue(4n * unit)
    expect(result.queue.map(({ shares }) => shares)).toEqual([1, 4])
    expect(
      readContract.mock.calls
        .filter(([request]) => request.functionName === "requestUnits")
        .map(([request]) => request.args),
    ).toEqual([[1n]])
  })

  it("skips the fund reads when the wallet covered the request", async () => {
    const { result, readContract } = await queue(0n)
    expect(result.queue.map(({ shares }) => shares)).toEqual([1, 2])
    expect(
      readContract.mock.calls.map(([request]) => request.functionName),
    ).not.toContain("totalUnits")
  })
})
