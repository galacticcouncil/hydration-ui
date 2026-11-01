import { describe, expect, it, vi } from "vitest"

import {
  type PropellerVaultStats,
  vaultDepositState,
} from "./usePropellerVaults"

vi.mock("@galacticcouncil/utils", () => ({
  PRIME_ASSET_ID: "43",
  GETH_ASSET_ID: "4200",
  GETH_ERC20_ID: "420",
  ETH_ASSET_ID: "34",
  WSTETH_ASSET_ID: "1000809",
}))
vi.mock("@/api/borrow", () => ({}))
vi.mock(
  "@/modules/strategies/propeller/hooks/useCollateralEquivalent",
  () => ({}),
)
vi.mock("@/modules/strategies/propeller/hooks/useVaultReads", () => ({}))
vi.mock("@/providers/assetsProvider", () => ({}))
vi.mock("@/providers/rpcProvider", () => ({}))
vi.mock("@/states/displayAsset", () => ({}))

const stats = (
  overrides: Partial<PropellerVaultStats> = {},
): PropellerVaultStats => ({
  tvl: 1,
  cap: 2,
  remaining: 1,
  remainingPct: 50,
  paused: false,
  depositsPaused: false,
  mainCollUsd: null,
  mainDebtUsd: null,
  protocolReserveHollar: null,
  deficitStop: false,
  deleverPending: false,
  deploying: false,
  exchangeRate: 1,
  maxLtv: 0.8,
  targetLtv: 0.75,
  pendingDeployment: "0",
  ...overrides,
})

describe("Vault deposit state", () => {
  it("is open below the cap with no pause or stop", () => {
    expect(vaultDepositState(stats())).toBe("open")
  })

  it("blocks exactly what deposit() rejects: a due de-lever and a borrowing round in flight", () => {
    expect(vaultDepositState(stats({ deleverPending: true }))).toBe("paused")
    expect(vaultDepositState(stats({ deploying: true }))).toBe("paused")
  })

  it("does not block on an unreadable borrowing-round state", () => {
    expect(vaultDepositState(stats({ deploying: null }))).toBe("open")
  })

  it("shows the keeper deficit stop as paused, like a governance pause", () => {
    expect(vaultDepositState(stats({ deficitStop: true }))).toBe("paused")
    expect(vaultDepositState(stats({ depositsPaused: true }))).toBe("paused")
    expect(vaultDepositState(stats({ paused: true, deficitStop: null }))).toBe(
      "paused",
    )
  })

  it("fails closed when the stop or the stats cannot be read", () => {
    expect(vaultDepositState(stats({ deficitStop: null }))).toBe("unavailable")
    expect(vaultDepositState(undefined)).toBe("unavailable")
  })

  it("reports a full vault only when deposits are otherwise open", () => {
    expect(vaultDepositState(stats({ remaining: 0 }))).toBe("full")
    expect(vaultDepositState(stats({ remaining: 0, deficitStop: true }))).toBe(
      "paused",
    )
  })
})
