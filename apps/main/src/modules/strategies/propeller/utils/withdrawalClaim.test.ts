import { decodeFunctionData, type PublicClient, zeroAddress } from "viem"
import { describe, expect, it, vi } from "vitest"

import {
  MAIN_DEBT_ABI,
  VAULT_ABI,
} from "@/modules/strategies/propeller/config/abi"

import { prepareWithdrawalClaim } from "./withdrawalClaim"

const vault = "0x0000000000000000000000000000000000000001"
const owner = "0x0000000000000000000000000000000000000002"
const debt = "0x0000000000000000000000000000000000000003"
const requestId = 7
const mockClient = (
  collateral: bigint,
  surplus: bigint,
  active = true,
  mainDebt = debt,
  receiver = owner,
) => {
  const readContract = vi.fn(
    async ({ functionName }: { functionName: string }) => {
      if (functionName === "redemptions")
        return [receiver, 1n, 10n, 0n, 0n, 0n, collateral, 0n, active]
      if (functionName === "mainDebt") return mainDebt
      if (functionName === "surplusOf") return surplus
      throw new Error(`Unexpected read: ${functionName}`)
    },
  )
  return { readContract, getBlockNumber: vi.fn(async () => 100n) }
}
const prepare = (client: ReturnType<typeof mockClient>) =>
  prepareWithdrawalClaim(
    client as unknown as PublicClient,
    vault,
    requestId,
    owner,
  )

describe("Withdrawal claim batch", () => {
  it("combines collateral and HOLLAR into ordered calls for the same request", async () => {
    const client = mockClient(10n, 2n)
    const result = await prepare(client)
    expect(result.collateral).toBe(10n)
    expect(result.surplusHollar).toBe(2n)
    expect(result.calls.map((call) => call.to)).toEqual([vault, debt])
    expect(
      decodeFunctionData({ abi: VAULT_ABI, data: result.calls[0]!.data }),
    ).toEqual({ functionName: "claim", args: [7n, owner] })
    expect(
      decodeFunctionData({ abi: MAIN_DEBT_ABI, data: result.calls[1]!.data }),
    ).toEqual({ functionName: "claimSurplus", args: [7n] })
    expect(
      client.readContract.mock.calls.every(
        ([read]) => "blockNumber" in read && read.blockNumber === 100n,
      ),
    ).toBe(true)
  })
  it("only includes collateral when no HOLLAR is available", async () => {
    const result = await prepare(mockClient(10n, 0n))
    expect(result.calls.map((call) => call.to)).toEqual([vault])
  })
  it("only includes later HOLLAR after collateral has been claimed", async () => {
    const result = await prepare(mockClient(0n, 2n, false))
    expect(result.calls.map((call) => call.to)).toEqual([debt])
  })
  it("does not reclaim inactive collateral", async () => {
    const result = await prepare(mockClient(10n, 2n, false))
    expect(result.collateral).toBe(0n)
    expect(result.calls.map((call) => call.to)).toEqual([debt])
  })
  it("returns no calls when nothing is currently claimable", async () => {
    expect((await prepare(mockClient(0n, 0n))).calls).toEqual([])
  })
  it("skips the recovery read if the debt ledger is not configured", async () => {
    const client = mockClient(10n, 2n, true, zeroAddress)
    expect((await prepare(client)).calls.map((call) => call.to)).toEqual([
      vault,
    ])
    expect(client.readContract).toHaveBeenCalledTimes(2)
  })
  it("rejects a withdrawal belonging to another account", async () => {
    await expect(
      prepare(mockClient(10n, 2n, true, debt, debt)),
    ).rejects.toThrow("does not belong")
  })
  it("does not prepare a partial batch when a payout read fails", async () => {
    const client = mockClient(10n, 2n)
    client.readContract.mockRejectedValueOnce(new Error("RPC unavailable"))
    await expect(prepare(client)).rejects.toThrow("RPC unavailable")
  })
})
