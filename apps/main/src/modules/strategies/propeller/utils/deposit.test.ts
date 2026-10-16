import {
  decodeFunctionData,
  erc20Abi,
  maxUint128,
  type PublicClient,
  zeroAddress,
} from "viem"
import { describe, expect, it, vi } from "vitest"

import { VAULT_ABI } from "@/modules/strategies/propeller/config/abi"
import { DEPOSIT_MIN_GAS } from "@/modules/strategies/propeller/constants"

import {
  assertDepositCapacity,
  encodeDeposit,
  prepareApproval,
  prepareFundedDeposit,
  prepareSwapDeposit,
  readDepositCapacity,
  readSellLimit,
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
    deficitStop: false,
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

  it("blocks bootstrap, missing ledger, deficit stop and pause states", async () => {
    for (const overrides of [
      { totalSupply: 0n },
      { mainDebt: zeroAddress },
      { paused: true },
      { depositsPaused: true },
      { deficitStop: true },
      { deleverTarget: 1n },
    ]) {
      const mock = mockClient(overrides)
      await expect(prepareFundedDeposit(mock.client, args)).rejects.toThrow(
        "availability changed",
      )
      expect(mock.simulateContract).not.toHaveBeenCalled()
    }
  })

  it("fails closed on a vault without the deficit stop view", async () => {
    const mock = mockClient()
    mock.readContract.mockImplementation(async (request) => {
      if (request.functionName === "deficitStop")
        throw new Error("Unknown selector deficitStop()")
      return request.functionName === "deferredDeployment" ? true : 0n
    })
    await expect(prepareFundedDeposit(mock.client, args)).rejects.toThrow(
      "deficitStop",
    )
    expect(mock.simulateContract).not.toHaveBeenCalled()
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

describe("Deposit approval", () => {
  it("returns an approval to the vault for the exact amount without simulating the deposit", async () => {
    const mock = mockClient()
    const call = await prepareApproval(mock.client, args)
    expect(call?.to).toBe(asset)
    expect(
      call && decodeFunctionData({ abi: erc20Abi, data: call.data }),
    ).toEqual({
      functionName: "approve",
      args: [vault, args.amount],
    })
    expect(mock.simulateContract).not.toHaveBeenCalled()
  })

  it("skips an already sufficient approval", async () => {
    const mock = mockClient({ allowance: args.amount })
    expect(await prepareApproval(mock.client, args)).toBeNull()
  })

  it("rejects unavailable capacity and a missing owner before reading the allowance", async () => {
    const mock = mockClient({ tvlCap: 4n * unit })
    await expect(prepareApproval(mock.client, args)).rejects.toThrow(
      "availability changed",
    )
    await expect(
      prepareApproval(mock.client, { ...args, owner: zeroAddress }),
    ).rejects.toThrow("Connect")
    expect(
      mock.readContract.mock.calls.map(([request]) => request.functionName),
    ).not.toContain("allowance")
  })

  it("never asks the asset precompile for an allowance above u128", async () => {
    const mock = mockClient({ tvlCap: maxUint128 * 2n, totalAssets: 0n })
    const call = await prepareApproval(mock.client, {
      ...args,
      amount: maxUint128,
    })
    expect(
      call && decodeFunctionData({ abi: erc20Abi, data: call.data }).args,
    ).toEqual([vault, maxUint128])
    await expect(
      prepareApproval(mock.client, { ...args, amount: maxUint128 + 1n }),
    ).rejects.toThrow("allowance limit")
  })
})

describe("Funded deposit transaction", () => {
  it("encodes a direct deposit and simulates minted shares without a swap envelope", async () => {
    const mock = mockClient()
    const tx = await prepareFundedDeposit(mock.client, args)
    expect(tx.to).toBe(vault)
    expect(tx.gas).toBe(DEPOSIT_MIN_GAS)
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

  it("adds 20% to the estimate and never goes below the deposit gas floor", async () => {
    const mock = mockClient()
    mock.estimateContractGas.mockResolvedValue(1_550_000n)
    expect((await prepareFundedDeposit(mock.client, args)).gas).toBe(1_860_000n)
    mock.estimateContractGas.mockResolvedValue(500_000n)
    expect((await prepareFundedDeposit(mock.client, args)).gas).toBe(1_700_000n)
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

const routerSell = (args: Record<string, unknown> = {}) => ({
  type: "Router",
  value: {
    type: "sell",
    value: {
      asset_in: 34,
      asset_out: 4200,
      amount_in: 3n * unit,
      min_amount_out: 2n * unit,
      route: [],
      ...args,
    },
  },
})
const withExtraGas = (call: unknown) => ({
  type: "Dispatcher",
  value: { type: "dispatch_with_extra_gas", value: { call, extra_gas: 1n } },
})

describe("Sell limit of a trade call", () => {
  it("reads the guaranteed output of a router sell", () => {
    expect(readSellLimit(routerSell())).toEqual({
      assetIn: 34,
      assetOut: 4200,
      minAmountOut: 2n * unit,
    })
  })

  it("unwraps the extra gas dispatch added for Aave legs", () => {
    expect(readSellLimit(withExtraGas(routerSell()))?.minAmountOut).toBe(
      2n * unit,
    )
  })

  it("reads sell-all and direct Omnipool sells", () => {
    const sellAll = routerSell()
    sellAll.value.type = "sell_all"
    expect(readSellLimit(sellAll)?.minAmountOut).toBe(2n * unit)
    expect(
      readSellLimit({
        type: "Omnipool",
        value: {
          type: "sell",
          value: {
            asset_in: 34,
            asset_out: 4200,
            amount: 1n,
            min_buy_amount: 5n,
          },
        },
      }),
    ).toEqual({ assetIn: 34, assetOut: 4200, minAmountOut: 5n })
  })

  it("does not read a limit from buys, other calls or malformed sells", () => {
    for (const call of [
      {
        type: "Router",
        value: {
          type: "buy",
          value: { asset_in: 34, asset_out: 4200, max_amount_in: 1n },
        },
      },
      { type: "EVM", value: { type: "call", value: {} } },
      routerSell({ min_amount_out: 2 }),
      routerSell({ asset_out: "4200" }),
      withExtraGas(undefined),
      undefined,
    ])
      expect(readSellLimit(call)).toBeNull()
  })
})

describe("Swap deposit", () => {
  const swapArgs = {
    vault,
    asset,
    owner,
    collateralId: "4200",
    assetIn: "34",
    tradeCall: routerSell(),
  } as const

  it("deposits the sell's guaranteed output and approves exactly that", async () => {
    const mock = mockClient()
    const { amount, approval } = await prepareSwapDeposit(mock.client, swapArgs)
    expect(amount).toBe(2n * unit)
    expect(
      approval && decodeFunctionData({ abi: erc20Abi, data: approval.data }),
    ).toEqual({ functionName: "approve", args: [vault, 2n * unit] })
    expect(mock.simulateContract).not.toHaveBeenCalled()
  })

  it("skips the approval when the allowance already covers the output", async () => {
    const mock = mockClient({ allowance: 2n * unit })
    expect((await prepareSwapDeposit(mock.client, swapArgs)).approval).toBe(
      null,
    )
  })

  it("rejects a trade that does not buy this vault's collateral before reading the vault", async () => {
    const mock = mockClient()
    for (const tradeCall of [
      routerSell({ asset_out: 1000765 }),
      routerSell({ asset_in: 5 }),
      { type: "Router", value: { type: "buy", value: {} } },
    ])
      await expect(
        prepareSwapDeposit(mock.client, { ...swapArgs, tradeCall }),
      ).rejects.toThrow("does not buy")
    expect(mock.readContract).not.toHaveBeenCalled()
  })

  it("checks the guaranteed output against the remaining capacity", async () => {
    await expect(
      prepareSwapDeposit(mockClient().client, {
        ...swapArgs,
        tradeCall: routerSell({ min_amount_out: 8n * unit }),
      }),
    ).rejects.toThrow("availability changed")
  })

  it("encodes the batched deposit for the swapped amount with a gas limit above the floor", () => {
    const call = encodeDeposit({ ...args, amount: 2n * unit })
    expect(call.to).toBe(vault)
    expect(call.gas).toBeGreaterThanOrEqual(DEPOSIT_MIN_GAS)
    expect(decodeFunctionData({ abi: VAULT_ABI, data: call.data })).toEqual({
      functionName: "deposit",
      args: [2n * unit, owner],
    })
  })
})
