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
vi.mock("@/modules/strategies/propeller/hooks/useSettlePace", () => ({}))
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

const PACE = { perSecond: 0.25 / 60, cycleSeconds: 60 }

const row = (
  pace: typeof PACE | null,
  entry: Partial<Parameters<typeof buildWithdrawalRow>[0]["entry"]> = {},
  extra: Partial<Parameters<typeof buildWithdrawalRow>[0]> = {},
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
    exchangeRate: 1,
    price: 1,
    pace,
    ...extra,
  })

describe("Claimable estimate", () => {
  it("settles what is left behind the queue ahead", () => {
    // 0.75 left + 0.5 ahead at 0.25 per min
    expect(row(PACE, {}, { ahead: 0.5 }).claimableInSeconds).toBe(300)
  })

  it("adds the cooldown and a start cycle before the unwind starts", () => {
    const waiting = row(PACE, {
      started: false,
      collateralSettled: 0,
      eligibleAt: 61_000,
      observedAt: 1_000,
    })
    // 60 s cooldown + 60 s start + 1 / 0.25 per min
    expect(waiting.claimableInSeconds).toBe(360)
  })

  it("counts cooldown from the later of the block and the wall clock", () => {
    const waiting = { started: false, collateralSettled: 0, eligibleAt: 61_000 }
    // the node's block is 60 s behind the clock, which already passed eligibility
    expect(
      row(PACE, { ...waiting, observedAt: 1_000 }, { now: 61_000 })
        .claimableInSeconds,
    ).toBe(300)
    expect(
      row(PACE, { ...waiting, observedAt: 1_000 }).claimableInSeconds,
    ).toBe(360)
  })

  it("stays empty without a pace, once stalled or when claimed", () => {
    expect(row(null).claimableInSeconds).toBeNull()
    expect(
      row(PACE, {}, { sinceLastSettleSeconds: 3600 }).claimableInSeconds,
    ).toBeNull()
    expect(row(PACE, { active: false }).claimableInSeconds).toBeNull()
  })

  it("trades the estimate for a warning when the reserve falls short", () => {
    const short = row(
      PACE,
      {},
      {
        shortfall: { carry: 0.01, reserveHollar: 1, debtPerCollateral: 2700 },
      },
    )
    expect(short.reserveShort).toBe(true)
    expect(short.claimableInSeconds).toBeNull()
  })
})

describe("Withdrawal amount", () => {
  it("excludes collateral already claimed from an open request", () => {
    expect(row(PACE, { claimedCollateral: 0.25 }).estEth).toBe(0.75)
  })

  it("keeps the full amount once the request is claimed", () => {
    expect(row(PACE, { claimedCollateral: 1, active: false }).estEth).toBe(1)
  })
})
