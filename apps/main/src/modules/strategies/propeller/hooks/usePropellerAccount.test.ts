import { describe, expect, it, vi } from "vitest"

import { buildWithdrawalRow } from "./usePropellerAccount"

vi.mock("@galacticcouncil/utils", () => ({
  GETH_ASSET_ID: "4200",
  GETH_ERC20_ID: "420",
  ETH_ASSET_ID: "34",
  WSTETH_ASSET_ID: "1000809",
}))
vi.mock("@/api/chain", () => ({}))
vi.mock("@/modules/strategies/propeller/hooks/usePropellerVaults", () => ({}))
vi.mock("@/modules/strategies/propeller/hooks/useRedemptionHistory", () => ({}))
vi.mock("@/modules/strategies/propeller/hooks/useRedemptionQueue", () => ({}))
vi.mock("@/modules/strategies/propeller/hooks/useVaultReads", () => ({}))
vi.mock("@/providers/assetsProvider", () => ({}))
vi.mock("@/providers/rpcProvider", () => ({}))

const vault = {
  assetId: "1000765",
  vaultAddress: "0x0000000000000000000000000000000000000001",
  shareAssetId: "5553",
  shareSymbol: "jBTC",
  shareName: "Juicer BTC",
} as const

const row = (
  blockTimeSeconds: number | null,
  entry: { active?: boolean; claimedCollateral?: number } = {},
) =>
  buildWithdrawalRow({
    vault,
    entry: {
      requestId: 1,
      owner: "0x0000000000000000000000000000000000000002",
      shares: 1,
      collateralOwed: 1,
      collateralSettled: 0.25,
      claimedCollateral: 0,
      settledProgress: 0.25,
      complete: false,
      active: true,
      isUser: true,
      started: true,
      eligibleAt: 0,
      observedAt: 1,
      mainDebt: "0x0000000000000000000000000000000000000003",
      surplusHollar: 0,
      sourcePending: false,
      ...entry,
    },
    settlement: {
      requestId: 1,
      collateralSettled: 0.25,
      firstSettledBlock: 100n,
      lastSettledBlock: 110n,
      recentRatePerBlock: 0.0625,
      typicalSettleBlocks: 120,
    },
    isSettlementLoading: false,
    exchangeRate: 1,
    price: 1,
    blockTimeSeconds,
  })

describe("Settle estimates", () => {
  it("convert blocks at the measured block time", () => {
    expect(row(2).etaSeconds).toBe(24)
    expect(row(8.5).etaSeconds).toBe(102)
    expect(row(8.5).typicalSettleSeconds).toBe(1020)
  })

  it("stay empty until the block time is known", () => {
    expect(row(null).etaSeconds).toBeNull()
    expect(row(null).typicalSettleSeconds).toBeNull()
  })
})

describe("Withdrawal amount", () => {
  it("excludes collateral already claimed from an open request", () => {
    expect(row(2, { claimedCollateral: 0.25 }).estEth).toBe(0.75)
  })

  it("keeps the full amount once the request is claimed", () => {
    expect(row(2, { claimedCollateral: 1, active: false }).estEth).toBe(1)
  })
})
