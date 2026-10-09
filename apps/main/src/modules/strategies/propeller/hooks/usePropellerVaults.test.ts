import { describe, expect, it, vi } from "vitest"

import {
  type PropellerVaultStats,
  vaultDepositState,
} from "./usePropellerVaults"

vi.mock("@galacticcouncil/utils", () => ({ PRIME_ASSET_ID: "43" }))
vi.mock("@/api/borrow", () => ({}))
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
  deficitStop: false,
  exchangeRate: 1,
  maxLtv: 0.8,
  pendingDeployment: "0",
  ...overrides,
})

describe("Vault deposit state", () => {
  it("is open below the cap with no pause or stop", () => {
    expect(vaultDepositState(stats())).toBe("open")
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
