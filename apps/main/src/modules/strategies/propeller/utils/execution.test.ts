import {
  decodeFunctionData,
  encodeFunctionResult,
  type Hex,
  type PublicClient,
  zeroAddress,
} from "viem"
import { describe, expect, it, vi } from "vitest"

import {
  EXECUTION_ABI,
  VAULT_ABI,
} from "@/modules/strategies/propeller/config/abi"

import { executionQuotes, prepareControlledDeposit } from "./execution"

const owner = "0x0000000000000000000000000000000000000001"
const vault = "0x0000000000000000000000000000000000000002"
const controller = "0x0000000000000000000000000000000000000003"
const asset = "0x0000000000000000000000000000000000000004"
const lane = `0x${"ab".repeat(32)}` as Hex
const hash = `0x${"cd".repeat(32)}` as Hex
const fill = { lane, amountIn: 50_000n, amountOut: 40_000n }
const args = { owner, vault, asset, amount: 100n } as const

const mockClient = () => {
  const block = {
    number: 100n,
    timestamp: 1_000n,
    hash,
    gasLimit: 30_000_000n,
  }
  const getBlock = vi.fn(async (request) =>
    request.blockNumber ? { ...block, number: request.blockNumber } : block,
  )
  const readContract = vi.fn(async (request): Promise<bigint | Hex> => {
    switch (request.functionName) {
      case "allowance":
        return 100n
      case "executionController":
        return controller
      case "maxQuoteAge":
        return 120n
      case "maxQuoteBlocks":
        return 50n
      default:
        throw new Error(`Unexpected read: ${request.functionName}`)
    }
  })
  const simulateContract = vi.fn(async () => ({
    result: [
      encodeFunctionResult({
        abi: VAULT_ABI,
        functionName: "deposit",
        result: 99n,
      }),
      [fill],
    ],
  }))
  const estimateContractGas = vi.fn(async () => 3_000_000n)
  const calls = {
    getBlock,
    readContract,
    simulateContract,
    estimateContractGas,
  }
  return { ...calls, client: calls as unknown as PublicClient }
}

describe("Controlled Propeller deposits", () => {
  it("bounds input and output without widening the oracle tolerance", () => {
    expect(executionQuotes([fill])).toEqual([
      { lane, amountIn: 50_000n, minOut: 39_992n },
    ])
  })

  it("rejects empty, duplicate, zero-output and invalid-slippage quotes", () => {
    for (const fills of [
      [],
      [fill, fill],
      [{ ...fill, amountIn: 0n }],
      [{ ...fill, amountOut: 1n }],
    ])
      expect(() => executionQuotes(fills)).toThrow()
    expect(() => executionQuotes([fill], 10_000n)).toThrow()
    expect(() => executionQuotes([fill], -1n)).toThrow()
  })

  it("quotes as the payer at one identified block and encodes controller execution", async () => {
    const mock = mockClient()
    const execution = await prepareControlledDeposit(mock.client, args)
    expect(execution.to).toBe(controller)
    expect(execution.gas).toBe(3_600_000n)
    expect(execution.shares).toBe(99n)
    const decoded = decodeFunctionData({
      abi: EXECUTION_ABI,
      data: execution.data,
    })
    expect(decoded.functionName).toBe("execute")
    if (decoded.functionName !== "execute") throw new Error("Wrong selector")
    expect(decoded.args.slice(2, 5)).toEqual([99n, hash, 1_090n])
    expect(
      decodeFunctionData({ abi: VAULT_ABI, data: decoded.args[1] }),
    ).toEqual({
      functionName: "deposit",
      args: [100n, owner],
    })
    expect(mock.simulateContract).toHaveBeenCalledWith(
      expect.objectContaining({
        account: owner,
        address: controller,
        functionName: "preview",
        blockNumber: 99n,
      }),
    )
    expect(
      mock.readContract.mock.calls.every(
        ([request]) => request.blockNumber === 99n,
      ),
    ).toBe(true)
  })

  it("waits for confirmed approval before running a transfer-based preview", async () => {
    const mock = mockClient()
    mock.readContract.mockResolvedValueOnce(0n)
    const wait = vi.fn(async () => {})
    await prepareControlledDeposit(mock.client, args, wait)
    expect(wait).toHaveBeenCalledOnce()
    expect(mock.simulateContract).toHaveBeenCalledOnce()
  })

  it("times out unconfirmed approval without previewing or sending a deposit", async () => {
    const mock = mockClient()
    mock.readContract.mockResolvedValue(0n)
    const wait = vi.fn(async () => {})
    await expect(
      prepareControlledDeposit(mock.client, args, wait),
    ).rejects.toThrow("not confirmed")
    expect(wait).toHaveBeenCalledTimes(15)
    expect(mock.simulateContract).not.toHaveBeenCalled()
  })

  it("respects shorter quote lifetimes and the inclusive block-age limit", async () => {
    const mock = mockClient()
    mock.readContract.mockImplementation(async (request) => {
      if (request.functionName === "allowance") return 100n
      if (request.functionName === "executionController") return controller
      if (request.functionName === "maxQuoteAge") return 10n
      if (request.functionName === "maxQuoteBlocks") return 1n
      throw new Error("Unexpected read")
    })
    const execution = await prepareControlledDeposit(mock.client, args)
    expect(execution.deadline).toBe(1010n)
  })

  it("rejects stale block references even while the timestamp deadline is valid", async () => {
    const mock = mockClient()
    mock.getBlock.mockResolvedValueOnce({
      number: 100n,
      timestamp: 1_000n,
      hash,
      gasLimit: 30_000_000n,
    })
    mock.getBlock.mockResolvedValueOnce({
      number: 1n,
      timestamp: 1_000n,
      hash,
      gasLimit: 30_000_000n,
    })
    await expect(prepareControlledDeposit(mock.client, args)).rejects.toThrow(
      "expired",
    )
    expect(mock.estimateContractGas).not.toHaveBeenCalled()
  })

  it("never falls back to a direct deposit when the controller is absent", async () => {
    const mock = mockClient()
    mock.readContract
      .mockResolvedValueOnce(100n)
      .mockResolvedValueOnce(zeroAddress)
    await expect(prepareControlledDeposit(mock.client, args)).rejects.toThrow(
      "not configured",
    )
    expect(mock.simulateContract).not.toHaveBeenCalled()
  })

  it("rejects an expired quote before proposing a transaction", async () => {
    const mock = mockClient()
    mock.getBlock.mockResolvedValueOnce({
      number: 100n,
      timestamp: 1_000n,
      hash,
      gasLimit: 30_000_000n,
    })
    mock.getBlock.mockResolvedValueOnce({
      number: 99n,
      timestamp: 800n,
      hash,
      gasLimit: 30_000_000n,
    })
    await expect(prepareControlledDeposit(mock.client, args)).rejects.toThrow(
      "expired",
    )
    expect(mock.estimateContractGas).not.toHaveBeenCalled()
  })

  it("propagates preview failures without weakening price or size guards", async () => {
    const mock = mockClient()
    mock.simulateContract.mockRejectedValueOnce(new Error("TradeSize"))
    await expect(prepareControlledDeposit(mock.client, args)).rejects.toThrow(
      "TradeSize",
    )
    expect(mock.estimateContractGas).not.toHaveBeenCalled()
  })

  it("rejects routes above the native transaction gas ceiling", async () => {
    const mock = mockClient()
    mock.estimateContractGas.mockResolvedValueOnce(16_000_000n)
    await expect(prepareControlledDeposit(mock.client, args)).rejects.toThrow(
      "gas limit",
    )
  })
})
