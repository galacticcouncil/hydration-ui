import { describe, expect, it, vi } from "vitest"

import {
  createStrategyPreviewBond,
  isStrategyPreviewEnabled,
  STRATEGY_PREVIEW_POSITIONS,
} from "./MyStrategies.preview"

// The fixtures need only the enum, not the API module's browser workers.
vi.mock("@/api/assets", () => ({ AssetType: { BOND: "Bond" } }))

describe("local strategy fixtures", () => {
  it.each(["localhost", "127.0.0.1", "[::1]", "::1"])(
    "allows opt-in on %s",
    (hostname) => {
      expect(isStrategyPreviewEnabled(hostname, true, false)).toBe(true)
    },
  )

  it.each(["app.hydration.net", "localhost.example.com", "192.168.1.1"])(
    "never enables fixtures on %s, even with a flag or build default",
    (hostname) => {
      expect(isStrategyPreviewEnabled(hostname, true, true)).toBe(false)
    },
  )

  it("can switch off the local build default", () => {
    expect(isStrategyPreviewEnabled("localhost", undefined, true)).toBe(true)
    expect(isStrategyPreviewEnabled("localhost", false, true)).toBe(false)
    expect(isStrategyPreviewEnabled("localhost", undefined, false)).toBe(false)
  })

  it("marks every sample and never supplies a real transfer asset", () => {
    expect(STRATEGY_PREVIEW_POSITIONS).toHaveLength(3)
    expect(STRATEGY_PREVIEW_POSITIONS.every((row) => row.isPreview)).toBe(true)
    expect(
      STRATEGY_PREVIEW_POSITIONS.every((row) => row.transferAssetId === null),
    ).toBe(true)
    const bond = createStrategyPreviewBond(undefined, undefined)
    expect(bond.isPreview).toBe(true)
    expect(Number(bond.total)).toBeGreaterThan(0)
  })
})
