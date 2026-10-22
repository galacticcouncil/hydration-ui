import { Address } from "viem"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { getMarket } from "@/core"
import { moneyMarketKeys } from "@/react/query-keys"

const config = {}
const provided = getMarket("hydration_v3")
const named = getMarket("gigahdx_v3")
const user = "0x0000000000000000000000000000000000000111" as Address

const read = vi.hoisted(() => ({
  readPositions: vi.fn(),
  readHollarFacilitator: vi.fn(),
  readUserIncentives: vi.fn(),
}))

vi.mock("@/core", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/core")>()),
  ...read,
}))

vi.mock("@/react/provider", () => ({
  useMoneyMarket: () => ({ config, market: provided, tickInterval: 60_000 }),
}))

vi.mock("@tanstack/react-query", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@tanstack/react-query")>()),
  useQuery: (options: unknown) => options,
}))

type Options = { queryKey: readonly unknown[]; queryFn: () => unknown }

const { useHollarFacilitator, useMarketPositions, useUserIncentives } =
  await import("@/react/hooks")

const run = (hook: () => unknown) => {
  const options = hook() as unknown as Options
  options.queryFn()
  return options
}

describe("hooks given a market", () => {
  beforeEach(() => vi.clearAllMocks())

  it("reads the named market, not the provider's", () => {
    expect(run(() => useMarketPositions(user, named)).queryKey).toEqual(
      moneyMarketKeys.positions("gigahdx_v3", user),
    )
    expect(read.readPositions).toHaveBeenCalledWith(config, named, user)

    expect(run(() => useHollarFacilitator(named)).queryKey).toEqual(
      moneyMarketKeys.hollar("gigahdx_v3"),
    )
    expect(read.readHollarFacilitator).toHaveBeenCalledWith(config, named)

    expect(run(() => useUserIncentives(user, named)).queryKey).toEqual(
      moneyMarketKeys.rewards("gigahdx_v3", user),
    )
    expect(read.readUserIncentives).toHaveBeenCalledWith(config, named, user)
  })

  it("defaults to the provider's market", () => {
    expect(run(() => useMarketPositions(user)).queryKey).toEqual(
      moneyMarketKeys.positions("hydration_v3", user),
    )
    expect(read.readPositions).toHaveBeenCalledWith(config, provided, user)

    expect(run(() => useHollarFacilitator()).queryKey).toEqual(
      moneyMarketKeys.hollar("hydration_v3"),
    )
    expect(read.readHollarFacilitator).toHaveBeenCalledWith(config, provided)

    expect(run(() => useUserIncentives(user)).queryKey).toEqual(
      moneyMarketKeys.rewards("hydration_v3", user),
    )
    expect(read.readUserIncentives).toHaveBeenCalledWith(config, provided, user)
  })
})
