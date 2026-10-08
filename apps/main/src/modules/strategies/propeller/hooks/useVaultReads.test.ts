import { afterEach, describe, expect, it, vi } from "vitest"

import { type TProviderContext } from "@/providers/rpcProvider"

import { vaultStatsQuery } from "./useVaultReads"

vi.mock("@galacticcouncil/utils", () => ({
  getAddressFromAssetId: () => "0x0000000000000000000000000000000000000003",
}))
afterEach(() => vi.restoreAllMocks())

const vault = {
  assetId: "34",
  shareSymbol: "pETH",
  vaultAddress: "0x0000000000000000000000000000000000000001",
} as const

const stats = async (
  overrides: Record<string, unknown> = {},
  decimals = 18,
) => {
  const values: Record<string, unknown> = {
    totalAssets: 10n ** 19n,
    totalSupply: 10n ** 19n,
    exchangeRate: 10n ** 18n,
    tvlCap: 20n * 10n ** 18n,
    paused: false,
    depositsPaused: false,
    queueHead: 0n,
    queueTail: 0n,
    getConfiguration: 7500n,
    feeController: vault.vaultAddress,
    hollarDebtToken: vault.vaultAddress,
    withdrawalDelay: 43200,
    isUnderfunded: false,
    deferredDeployment: true,
    reinvestAssets: 2n * 10n ** 18n,
    protocolFeeBps: 500,
    getDiscountPercent: 0n,
    ...overrides,
  }
  const readContract = vi.fn(
    async ({ functionName }: { functionName: string }) => {
      const result = values[functionName]
      if (result instanceof Error) throw result
      return result
    },
  )
  const rpc = {
    isReady: true,
    evm: { getBlockNumber: async () => 123n, readContract },
  } as unknown as TProviderContext
  const query = vaultStatsQuery(rpc, vault, decimals)
  if (typeof query.queryFn !== "function")
    throw new Error("Expected query function")
  return { result: await query.queryFn({} as never), readContract }
}

describe("Pooled collateral awaiting deployment", () => {
  it("reads the pooled credit at the same block as funded vault assets", async () => {
    const { result, readContract } = await stats()
    expect(result.pendingDeployment).toBe("2")
    expect(result.totalAssets).toBe(10)
    expect(
      readContract.mock.calls.every(
        ([request]) => "blockNumber" in request && request.blockNumber === 123n,
      ),
    ).toBe(true)
  })

  it("keeps exact collateral units and distinguishes a zero credit from unavailable data", async () => {
    expect(
      (await stats({ reinvestAssets: 1n }, 6)).result.pendingDeployment,
    ).toBe("0.000001")
    expect((await stats({ reinvestAssets: 0n })).result.pendingDeployment).toBe(
      "0",
    )
  })

  it("never labels an older vault's existing reinvestAssets as the new deployment measure", async () => {
    expect(
      (await stats({ deferredDeployment: false })).result.pendingDeployment,
    ).toBeNull()
    vi.spyOn(console, "warn").mockImplementation(() => {})
    expect(
      (await stats({ deferredDeployment: new Error("unknown selector") }))
        .result.pendingDeployment,
    ).toBeNull()
  })

  it("leaves pending deployment unknown if its read fails while retaining funded collateral", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {})
    const { result } = await stats({ reinvestAssets: new Error("RPC timeout") })
    expect(result.pendingDeployment).toBeNull()
    expect(result.totalAssets).toBe(10)
  })
})
