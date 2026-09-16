import { describe, expect, it } from "vitest"

import {
  computeDerived,
  getDerived,
  updateLastTwoOnTouch,
} from "@/modules/trade/swap/sections/Limit/cascadeLogic"

describe("limit cascade", () => {
  it("clearing the buy amount empties the price and keeps the sell amount", () => {
    const afterSell = updateLastTwoOnTouch(["price", "sell"], "sell", false)
    expect(getDerived(afterSell)).toBe("buy")
    expect(computeDerived("buy", { sell: "100", buy: "", price: "0.5" })).toBe(
      "50",
    )

    // Touching buy makes price the derived field, so an empty buy amount
    // clears the price too and leaves the form with a sell amount alone.
    const afterClearBuy = updateLastTwoOnTouch(afterSell, "buy", false)
    expect(getDerived(afterClearBuy)).toBe("price")
    expect(
      computeDerived("price", { sell: "100", buy: "", price: "0.5" }),
    ).toBe(null)
  })
})
