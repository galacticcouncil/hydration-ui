import { type Trade } from "@galacticcouncil/sdk-next/sor"
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
import { type Papi } from "@/providers/rpcProvider"

import {
  assertDepositCapacity,
  buildDepositBuy,
  encodeDeposit,
  isSwapDepositReady,
  prepareApproval,
  prepareFundedDeposit,
  readBuyLimit,
  readDepositCapacity,
  readSellLimit,
  readSwapDeposit,
  sizeSwapDeposit,
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
      blocker: null,
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
      amountIn: 3n * unit,
      route: [],
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

it("encodes the batched deposit for the swapped amount with a gas limit above the floor", () => {
  const call = encodeDeposit({ ...args, amount: 2n * unit })
  expect(call.to).toBe(vault)
  expect(call.gas).toBeGreaterThanOrEqual(DEPOSIT_MIN_GAS)
  expect(decodeFunctionData({ abi: VAULT_ABI, data: call.data })).toEqual({
    functionName: "deposit",
    args: [2n * unit, owner],
  })
})

const hop = (
  pool: { type: string; value?: number },
  inId: number,
  out: number,
) => ({ pool, asset_in: inId, asset_out: out })
const aaveSell = (args: Record<string, unknown> = {}) =>
  routerSell({
    asset_in: 420,
    route: [hop({ type: "Aave" }, 420, 4200)],
    ...args,
  })
const minOut = (call: unknown) => readSellLimit(call)?.minAmountOut
const geth = {
  assetIn: "420",
  collateralId: "4200",
  quotedAmountIn: 3n * unit,
}

describe("Deposit amount of a swap", () => {
  it("deposits the full input of a single Aave hop into the collateral, less 2 wei", () => {
    const { depositAmount, tradeCall } = readSwapDeposit(aaveSell(), geth)
    expect(depositAmount).toBe(3n * unit - 2n)
    expect(minOut(tradeCall)).toBe(3n * unit - 2n)
  })

  it("rewrites the minimum inside the extra gas dispatch", () => {
    const { depositAmount, tradeCall } = readSwapDeposit(
      withExtraGas(aaveSell()),
      geth,
    )
    expect(depositAmount).toBe(3n * unit - 2n)
    expect(tradeCall).toMatchObject({
      type: "Dispatcher",
      value: { value: { extra_gas: 1n } },
    })
    expect(minOut(tradeCall)).toBe(3n * unit - 2n)
  })

  it("uses the quoted amount in for sell_all", () => {
    const sellAll = aaveSell({ amount_in: undefined })
    sellAll.value.type = "sell_all"
    const { depositAmount, tradeCall } = readSwapDeposit(sellAll, {
      ...geth,
      quotedAmountIn: 5n * unit,
    })
    expect(depositAmount).toBe(5n * unit - 2n)
    expect(minOut(tradeCall)).toBe(5n * unit - 2n)
  })

  it("rejects a pool route, which is bought rather than sold", () => {
    const route = [
      hop({ type: "Aave" }, 34, 1007),
      hop({ type: "Stableswap", value: 4200 }, 1007, 4200),
    ]
    expect(() =>
      readSwapDeposit(routerSell({ route }), { ...geth, assetIn: "34" }),
    ).toThrow("not a 1:1 unwrap")
  })

  it("rejects an Aave hop that does not buy the collateral", () => {
    expect(() =>
      readSwapDeposit(
        aaveSell({
          asset_out: 1007,
          route: [hop({ type: "Aave" }, 420, 1007)],
        }),
        geth,
      ),
    ).toThrow("does not buy")
  })

  it("never deposits zero or less", () => {
    for (const amount_in of [1n, 2n])
      expect(() => readSwapDeposit(aaveSell({ amount_in }), geth)).toThrow(
        "too small",
      )
    expect(
      readSwapDeposit(aaveSell({ amount_in: 3n }), geth).depositAmount,
    ).toBe(1n)
  })
})

describe("Swap deposit sizing", () => {
  const decimals = 18
  const floorUnit = 10n ** 12n

  it("buys 0.3% under the sell quote when the vault has room", () => {
    expect(sizeSwapDeposit(unit, 10n * unit, decimals)).toBe(997n * 10n ** 15n)
  })

  it("caps at the room, floored to 6 decimals", () => {
    expect(sizeSwapDeposit(unit, unit / 2n + 7n, decimals)).toBe(unit / 2n)
  })

  it("keeps a room already on the 6-decimal boundary: the floor is only a mitigation", () => {
    expect(sizeSwapDeposit(unit, 5n * floorUnit, decimals)).toBe(5n * floorUnit)
  })

  it("buys nothing when the room is below one rounding unit, so the deposit isn't ready", () => {
    const depositAmount = sizeSwapDeposit(unit, floorUnit - 1n, decimals)
    expect(depositAmount).toBe(0n)
    expect(
      isSwapDepositReady({
        tx: "buy",
        isLoading: false,
        isError: false,
        depositAmount,
      }),
    ).toBe(false)
  })

  it("rejects at submit when the room shrank below the quoted deposit", async () => {
    await expect(
      prepareApproval(mockClient({ totalAssets: 10n * unit - 1n }).client, {
        ...args,
        amount: 2n,
      }),
    ).rejects.toThrow("availability changed")
  })
})

describe("Swap deposit spend limit", () => {
  const stable = { pool: "Stableswap" }
  const aave = { pool: "Aave" }

  it("adds the buffer to the quoted cost", () => {
    expect(
      readBuyLimit([stable], {
        amountIn: 100n * unit,
        typedAmount: 1000n * unit,
      }),
    ).toBe(1003n * 10n ** 17n)
  })

  it("follows the quoted cost, not the typed amount, when capacity shrinks the buy", () => {
    const limit = readBuyLimit([stable], {
      amountIn: unit,
      typedAmount: 50n * unit,
    })
    expect(limit).toBe(1003n * 10n ** 15n)
  })

  it("never exceeds the typed amount", () => {
    expect(readBuyLimit([stable], { amountIn: 999n, typedAmount: 1000n })).toBe(
      1000n,
    )
  })

  it("adds 2 wei per Aave hop to both the check and the limit", () => {
    expect(
      readBuyLimit([aave, aave, stable], { amountIn: 0n, typedAmount: 4n }),
    ).toBe(4n)
    expect(
      readBuyLimit([aave, aave, stable], { amountIn: 0n, typedAmount: 3n }),
    ).toBe(null)
    expect(
      readBuyLimit([aave], { amountIn: 10_000n, typedAmount: 20_000n }),
    ).toBe(10_032n)
  })

  it("rejects a buy that costs more than the typed amount", () => {
    expect(readBuyLimit([stable], { amountIn: 11n, typedAmount: 10n })).toBe(
      null,
    )
  })
})

describe("Swap deposit buy call", () => {
  const papi = {
    tx: {
      Router: {
        buy: (value: unknown) => ({
          decodedCall: { type: "Router", value: { type: "buy", value } },
        }),
      },
      Dispatcher: {
        dispatch_with_extra_gas: (value: unknown) => ({
          decodedCall: {
            type: "Dispatcher",
            value: { type: "dispatch_with_extra_gas", value },
          },
        }),
      },
    },
  } as unknown as Papi
  const input = {
    assetIn: 34,
    assetOut: 4200,
    amountOut: 2n * unit,
    maxAmountIn: 3n * unit,
    swaps: [
      { pool: "Aave", assetIn: 34, assetOut: 1007 },
      { pool: "Stableswap", poolId: 4200, assetIn: 1007, assetOut: 4200 },
    ] as unknown as Trade["swaps"],
  }

  it("buys the exact amount up to the limit through the router", () => {
    expect(buildDepositBuy(papi, input).decodedCall).toMatchObject({
      type: "Router",
      value: {
        type: "buy",
        value: {
          asset_in: 34,
          asset_out: 4200,
          amount_out: 2n * unit,
          max_amount_in: 3n * unit,
          route: [{ asset_in: 34 }, { asset_out: 4200 }],
        },
      },
    })
  })

  it("wraps only when extra gas is set", () => {
    expect(
      buildDepositBuy(papi, { ...input, extraGas: 9n }).decodedCall,
    ).toMatchObject({
      type: "Dispatcher",
      value: {
        type: "dispatch_with_extra_gas",
        value: { extra_gas: 9n, call: { type: "Router" } },
      },
    })
  })
})

describe("Swap deposit readiness", () => {
  const ready = {
    tx: "buy",
    isLoading: false,
    isError: false,
    depositAmount: 1n,
  }

  it("accepts a built buy", () => {
    expect(isSwapDepositReady(ready)).toBe(true)
  })

  it("waits for the call, the quote and an amount, and refuses a failed quote", () => {
    for (const change of [
      { tx: null },
      { isLoading: true },
      { isError: true },
      { depositAmount: 0n },
      { depositAmount: undefined },
    ])
      expect(isSwapDepositReady({ ...ready, ...change })).toBe(false)
  })
})
