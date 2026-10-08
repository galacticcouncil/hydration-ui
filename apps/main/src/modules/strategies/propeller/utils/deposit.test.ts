import {
  decodeFunctionData,
  erc20Abi,
  type PublicClient,
  zeroAddress,
} from "viem"
import { describe, expect, it, vi } from "vitest"

import { VAULT_ABI } from "@/modules/strategies/propeller/config/abi"

import {
  assertDepositCapacity,
  depositWithApproval,
  prepareFundedDeposit,
  readDepositCapacity,
} from "./deposit"

const vault = "0x0000000000000000000000000000000000000001"
const owner = "0x0000000000000000000000000000000000000002"
const asset = "0x0000000000000000000000000000000000000003"
const unit = 10n ** 18n
const args = { vault, owner, asset, amount: 2n * unit } as const
const mockClient = (overrides: Record<string, unknown> = {}) => {
  const values: Record<string, unknown> = {
    deferredDeployment: true,
    asset,
    tvlCap: 10n * unit,
    totalAssets: 3n * unit,
    totalSupply: 3n * unit,
    paused: false,
    depositsPaused: false,
    isUnderfunded: false,
    deleverTarget: 0n,
    mainDebt: vault,
    allowance: 0n,
    ...overrides,
  }
  const readContract = vi.fn(async (request) => {
    if (!(request.functionName in values))
      throw new Error(`Unexpected read: ${request.functionName}`)
    return values[request.functionName]
  })
  const calls = {
    readContract,
    getBlockNumber: vi.fn(async () => 100n),
    getBlock: vi.fn(async () => ({ gasLimit: 30_000_000n })),
    simulateContract: vi.fn(async () => ({ result: 2n * unit })),
    estimateContractGas: vi.fn(async () => 1_000_000n),
  }
  return { ...calls, client: calls as unknown as PublicClient }
}

describe("Collateral-only deposit capacity", () => {
  it("uses exact vault headroom at a single block without trade-budget or price reads", async () => {
    const mock = mockClient()
    expect(await readDepositCapacity(mock.client, vault, asset)).toEqual({
      blockNumber: 100n,
      maximum: 7n * unit,
      ready: true,
      paused: false,
    })
    expect(
      mock.readContract.mock.calls.every(
        ([request]) => request.blockNumber === 100n,
      ),
    ).toBe(true)
    expect(
      mock.readContract.mock.calls.map(([request]) => request.functionName),
    ).not.toContain("available")
  })

  it("rejects old synchronous deployments before preparing any transaction", async () => {
    const mock = mockClient({ deferredDeployment: false })
    await expect(prepareFundedDeposit(mock.client, args)).rejects.toThrow(
      "deferred deployment",
    )
    expect(mock.readContract).toHaveBeenCalledOnce()
    expect(mock.simulateContract).not.toHaveBeenCalled()
  })

  it("does not infer support when the capability probe reverts or the RPC fails", async () => {
    const mock = mockClient()
    mock.readContract.mockRejectedValue(
      new Error("Missing selector or RPC unavailable"),
    )
    await expect(prepareFundedDeposit(mock.client, args)).rejects.toThrow(
      "Missing selector",
    )
    expect(mock.simulateContract).not.toHaveBeenCalled()
  })

  it("blocks bootstrap, missing ledger, funding and pause states", async () => {
    for (const overrides of [
      { totalSupply: 0n },
      { mainDebt: zeroAddress },
      { paused: true },
      { depositsPaused: true },
      { isUnderfunded: true },
      { deleverTarget: 1n },
    ]) {
      const mock = mockClient(overrides)
      await expect(prepareFundedDeposit(mock.client, args)).rejects.toThrow(
        "availability changed",
      )
      expect(mock.simulateContract).not.toHaveBeenCalled()
    }
  })

  it("rejects mismatched collateral", async () => {
    await expect(
      readDepositCapacity(mockClient({ asset: owner }).client, vault, asset),
    ).rejects.toThrow("does not match")
  })

  it("keeps zero-cap and overfilled vaults closed without imposing a swap minimum", async () => {
    for (const overrides of [{ tvlCap: 0n }, { totalAssets: 11n * unit }]) {
      const capacity = await readDepositCapacity(
        mockClient(overrides).client,
        vault,
        asset,
      )
      expect(capacity.maximum).toBe(0n)
      expect(() => assertDepositCapacity(capacity, 1n)).toThrow()
    }
    const mock = mockClient()
    const capacity = await readDepositCapacity(mock.client, vault, asset)
    expect(() => assertDepositCapacity(capacity, 1n)).not.toThrow()
    expect(() => assertDepositCapacity(capacity, 0n)).toThrow()
  })

  it("preserves single-unit headroom beyond Number precision", async () => {
    const cap = 123456789123456789123456789n
    const capacity = await readDepositCapacity(
      mockClient({ tvlCap: cap, totalAssets: cap - 1n }).client,
      vault,
      asset,
    )
    expect(capacity.maximum).toBe(1n)
    expect(() => assertDepositCapacity(capacity, 1n)).not.toThrow()
    expect(() => assertDepositCapacity(capacity, 2n)).toThrow()
  })
})

describe("Deposit approval lifecycle", () => {
  it("waits for approval to the vault, then submits only the funded deposit", async () => {
    const mock = mockClient()
    const order: string[] = []
    const approve = vi.fn(async (call) => {
      order.push("approval confirmed")
      expect(call.to).toBe(asset)
      expect(decodeFunctionData({ abi: erc20Abi, data: call.data })).toEqual({
        functionName: "approve",
        args: [vault, args.amount],
      })
      expect(mock.simulateContract).not.toHaveBeenCalled()
    })
    const submit = vi.fn(async (call) => {
      order.push("deposit submitted")
      expect(call.to).toBe(vault)
      return "funded"
    })
    expect(await depositWithApproval(mock.client, args, approve, submit)).toBe(
      "funded",
    )
    expect(order).toEqual(["approval confirmed", "deposit submitted"])
    expect(submit).toHaveBeenCalledOnce()
  })

  it("skips an already sufficient approval", async () => {
    const mock = mockClient({ allowance: args.amount })
    const approve = vi.fn(async () => {})
    const submit = vi.fn(async () => {})
    await depositWithApproval(mock.client, args, approve, submit)
    expect(approve).not.toHaveBeenCalled()
    expect(submit).toHaveBeenCalledOnce()
  })

  it("does not continue after approval rejection or emit a success callback", async () => {
    const mock = mockClient()
    const submit = vi.fn(async () => {})
    await expect(
      depositWithApproval(
        mock.client,
        args,
        async () => {
          throw new Error("Cancelled")
        },
        submit,
      ),
    ).rejects.toThrow("Cancelled")
    expect(mock.simulateContract).not.toHaveBeenCalled()
    expect(submit).not.toHaveBeenCalled()
  })

  it("rechecks the deposit state after approval before proposing a deposit", async () => {
    const mock = mockClient()
    const submit = vi.fn(async () => {})
    const approve = async () => {
      mock.readContract.mockRejectedValueOnce(new Error("Vault changed"))
    }
    await expect(
      depositWithApproval(mock.client, args, approve, submit),
    ).rejects.toThrow("Vault changed")
    expect(submit).not.toHaveBeenCalled()
  })
})

describe("Funded deposit transaction", () => {
  it("encodes a direct deposit and simulates minted shares without a swap envelope", async () => {
    const mock = mockClient()
    const tx = await prepareFundedDeposit(mock.client, args)
    expect(tx.to).toBe(vault)
    expect(tx.gas).toBe(1_200_000n)
    expect(tx.shares).toBe(2n * unit)
    expect(decodeFunctionData({ abi: VAULT_ABI, data: tx.data })).toEqual({
      functionName: "deposit",
      args: [2n * unit, owner],
    })
    expect(mock.simulateContract).toHaveBeenCalledWith(
      expect.objectContaining({
        account: owner,
        address: vault,
        functionName: "deposit",
        args: [2n * unit, owner],
      }),
    )
    expect(tx).not.toHaveProperty("deadline")
    expect(tx).not.toHaveProperty("quotedBlock")
  })

  it("requires successful simulation and nonzero funded shares", async () => {
    const failed = mockClient()
    failed.simulateContract.mockRejectedValue(
      new Error("Allowance not confirmed"),
    )
    await expect(prepareFundedDeposit(failed.client, args)).rejects.toThrow(
      "Allowance",
    )
    expect(failed.estimateContractGas).not.toHaveBeenCalled()
    const empty = mockClient()
    empty.simulateContract.mockResolvedValue({ result: 0n })
    await expect(prepareFundedDeposit(empty.client, args)).rejects.toThrow(
      "no funded shares",
    )
  })

  it("rejects unavailable capacity before simulation and checks current state again", async () => {
    const mock = mockClient({ tvlCap: 4n * unit })
    await expect(prepareFundedDeposit(mock.client, args)).rejects.toThrow(
      "availability changed",
    )
    expect(mock.simulateContract).not.toHaveBeenCalled()
  })

  it("rejects excess gas and a missing owner", async () => {
    const mock = mockClient()
    mock.estimateContractGas.mockResolvedValue(16_000_000n)
    await expect(prepareFundedDeposit(mock.client, args)).rejects.toThrow(
      "gas limit",
    )
    await expect(
      prepareFundedDeposit(mock.client, { ...args, owner: zeroAddress }),
    ).rejects.toThrow("Connect")
  })
})
