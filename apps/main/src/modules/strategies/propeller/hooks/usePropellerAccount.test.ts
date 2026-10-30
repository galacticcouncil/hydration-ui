import { describe, expect, it, vi } from "vitest"

import { buildWithdrawalRow, sortWithdrawalRows } from "./usePropellerAccount"

vi.mock("@galacticcouncil/utils", () => ({
  GETH_ASSET_ID: "4200",
  GETH_ERC20_ID: "420",
  ETH_ASSET_ID: "34",
  WSTETH_ASSET_ID: "1000809",
}))
vi.mock("@/api/chain", () => ({}))
vi.mock("@/modules/strategies/propeller/hooks/usePropellerVaults", () => ({}))
vi.mock("@/modules/strategies/propeller/hooks/useSettlePace", () => ({}))
vi.mock("@/modules/strategies/propeller/hooks/useExitBacklog", () => ({}))
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

// one slice frees 600 HOLLAR every 60 s
const BACKLOG = {
  backlogHollar: 1200,
  freedPerSlice: 600,
  sliceSeconds: 60,
  stalled: false,
}

const row = (
  backlog: typeof BACKLOG | null,
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
      waitsOnUnwind: true,
      ...entry,
    },
    exchangeRate: 1,
    price: 1,
    backlog,
    ...extra,
  })

describe("Claimable estimate", () => {
  it("drains the shared backlog and the requests not started yet", () => {
    // (1200 + 600) / 600 = 3 slices x 60 s + 30 s settle
    expect(row(BACKLOG, {}, { notStartedHollar: 600 }).claimableInSeconds).toBe(
      210,
    )
  })

  it("adds the cooldown and a keeper turn before the unwind starts", () => {
    const waiting = row(BACKLOG, {
      started: false,
      collateralSettled: 0,
      eligibleAt: 61_000,
      observedAt: 1_000,
    })
    // 60 s cooldown + 30 s start + 2 slices + 30 s settle
    expect(waiting.claimableInSeconds).toBe(240)
  })

  it("counts cooldown from the later of the block and the wall clock", () => {
    const waiting = { started: false, collateralSettled: 0, eligibleAt: 61_000 }
    // the node's block is 60 s behind the clock, which already passed eligibility
    expect(
      row(BACKLOG, { ...waiting, observedAt: 1_000 }, { now: 61_000 })
        .claimableInSeconds,
    ).toBe(180)
    expect(
      row(BACKLOG, { ...waiting, observedAt: 1_000 }).claimableInSeconds,
    ).toBe(240)
  })

  it("pays a headroom exit on the next keeper turn, past the backlog", () => {
    const headroom = { complete: true, collateralSettled: 0 }
    expect(
      row(BACKLOG, { ...headroom, waitsOnUnwind: false }).claimableInSeconds,
    ).toBe(30)
    expect(
      row({ ...BACKLOG, freedPerSlice: 0 }, { waitsOnUnwind: false })
        .claimableInSeconds,
    ).toBe(30)
    expect(
      row({ ...BACKLOG, stalled: true }, { waitsOnUnwind: false })
        .claimableInSeconds,
    ).toBeNull()
  })

  it("stays empty while unknown, stalled or when claimed", () => {
    expect(row(null).claimableInSeconds).toBeNull()
    expect(row({ ...BACKLOG, stalled: true }).claimableInSeconds).toBeNull()
    expect(row(BACKLOG, { active: false }).claimableInSeconds).toBeNull()
  })

  it("trades the estimate for a warning when the reserve falls short", () => {
    const short = row(
      BACKLOG,
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
    expect(row(BACKLOG, { claimedCollateral: 0.25 }).estEth).toBe(0.75)
  })

  it("keeps the full amount once the request is claimed", () => {
    expect(row(BACKLOG, { claimedCollateral: 1, active: false }).estEth).toBe(1)
  })

  it("shows the whole withdrawal and what was claimed from it", () => {
    const open = row(BACKLOG, { claimedCollateral: 0.25 })
    expect(open.totalEth).toBe(1)
    expect(open.claimedEth).toBe(0.25)
    const closed = row(BACKLOG, { claimedCollateral: 1, active: false })
    expect(closed.totalEth).toBe(1)
    expect(closed.claimedEth).toBe(0)
  })
})

describe("Withdrawal order", () => {
  it("puts the latest request first across vaults, whose ids count apart", () => {
    const ethOld = { requestId: 42, eligibleAt: 1_000 }
    const btcNew = { requestId: 1, eligibleAt: 2_000 }
    expect(sortWithdrawalRows([ethOld, btcNew])).toEqual([btcNew, ethOld])
  })
})
