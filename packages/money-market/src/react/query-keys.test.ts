import { Address } from "viem"
import { describe, expect, it } from "vitest"

import { moneyMarketKeys } from "@/react"

const user = "0x0000000000000000000000000000000000000111" as Address

describe("moneyMarketKeys", () => {
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
})
