import { describe, expect, it } from "vitest"

import { getMarket, markets } from "@/core"
import { CustomMarket } from "@/types"

const keys: ReadonlyArray<CustomMarket> = [
  "hydration_v3",
  "bil_v3",
  "gigahdx_v3",
]

describe("market registry", () => {
  it("describes exactly the three markets", () => {
    expect(Object.keys(markets).sort()).toEqual([...keys].sort())
  })

  it("resolves a key to a descriptor that agrees with its own key", () => {
    keys.forEach((key) => expect(getMarket(key).market).toBe(key))
  })

  it("gives every market the same six addresses", () => {
    keys.forEach((key) => {
      expect(Object.keys(getMarket(key).addresses).sort()).toEqual([
        "HOLLAR_TOKEN",
        "POOL",
        "POOL_ADDRESSES_PROVIDER",
        "UI_INCENTIVE_DATA_PROVIDER",
        "UI_POOL_DATA_PROVIDER",
        "WALLET_BALANCE_PROVIDER",
      ])
    })
  })
})
