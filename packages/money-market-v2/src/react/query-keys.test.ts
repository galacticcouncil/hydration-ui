import { Address } from "viem"
import { describe, expect, it } from "vitest"

import { moneyMarketKeys } from "@/react"

const user = "0x0000000000000000000000000000000000000111" as Address

describe("moneyMarketKeys", () => {
  it("roots every key under 'mm'", () => {
    expect(moneyMarketKeys.all).toEqual(["mm"])
    expect(moneyMarketKeys.market("hydration_v3")[0]).toBe("mm")
    expect(moneyMarketKeys.reserves("hydration_v3")[0]).toBe("mm")
    expect(moneyMarketKeys.positions("hydration_v3", user)[0]).toBe("mm")
    expect(moneyMarketKeys.balances("hydration_v3", user)[0]).toBe("mm")
  })

  it("makes every level a valid prefix of the level below it", () => {
    const market = moneyMarketKeys.market("bil_v3")

    for (const key of [
      moneyMarketKeys.reserves("bil_v3"),
      moneyMarketKeys.positions("bil_v3", user),
      moneyMarketKeys.balances("bil_v3", user),
      moneyMarketKeys.rewards("bil_v3", user),
    ]) {
      expect(key.slice(0, moneyMarketKeys.all.length)).toEqual([
        ...moneyMarketKeys.all,
      ])
      expect(key.slice(0, market.length)).toEqual([...market])
    }
  })

  it("puts the market before the discriminator", () => {
    expect(moneyMarketKeys.reserves("gigahdx_v3")).toEqual([
      "mm",
      "gigahdx_v3",
      "reserves",
    ])
    expect(moneyMarketKeys.positions("gigahdx_v3", user)).toEqual([
      "mm",
      "gigahdx_v3",
      "positions",
      user,
    ])
    expect(moneyMarketKeys.balances("gigahdx_v3", user)).toEqual([
      "mm",
      "gigahdx_v3",
      "balances",
      user,
    ])
    expect(moneyMarketKeys.rewards("gigahdx_v3", user)).toEqual([
      "mm",
      "gigahdx_v3",
      "rewards",
      user,
    ])
  })

  it("keeps markets and users apart", () => {
    const other = "0x0000000000000000000000000000000000000222" as Address

    expect(moneyMarketKeys.reserves("hydration_v3")).not.toEqual(
      moneyMarketKeys.reserves("bil_v3"),
    )
    expect(moneyMarketKeys.positions("hydration_v3", user)).not.toEqual(
      moneyMarketKeys.positions("hydration_v3", other),
    )
    expect(moneyMarketKeys.positions("hydration_v3", user)).not.toEqual(
      moneyMarketKeys.balances("hydration_v3", user),
    )
  })

  it("carries no timestamp anywhere in a key", () => {
    const keys = [
      moneyMarketKeys.all,
      moneyMarketKeys.market("hydration_v3"),
      moneyMarketKeys.reserves("hydration_v3"),
      moneyMarketKeys.positions("hydration_v3", user),
      moneyMarketKeys.balances("hydration_v3", user),
      moneyMarketKeys.rewards("hydration_v3", user),
    ]

    for (const key of keys) {
      for (const segment of key) {
        expect(typeof segment).toBe("string")
      }
    }
  })
})
