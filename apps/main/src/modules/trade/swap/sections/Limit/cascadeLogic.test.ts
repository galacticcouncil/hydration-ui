import { describe, expect, it } from "vitest"

import {
  computeDerived,
  getDerived,
  repairLastTwo,
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

  it("repairs last-two after clearing buy so editing sell derives buy from price", () => {
    const afterClearBuy = updateLastTwoOnTouch(
      updateLastTwoOnTouch(["price", "sell"], "sell", false),
      "buy",
      false,
    )
    expect(getDerived(afterClearBuy)).toBe("price")

    const afterSellTouch = updateLastTwoOnTouch(afterClearBuy, "sell", false)
    expect(getDerived(afterSellTouch)).toBe("price")

    const values = { sell: "1", buy: "", price: "118.6879" }
    const repaired = repairLastTwo(afterSellTouch, values, "sell")
    expect(repaired).toEqual(["sell", "price"])
    expect(getDerived(repaired)).toBe("buy")
    expect(computeDerived("buy", values)).toBe("118.6879")
  })

  it("repairs last-two after clearing sell so editing buy derives sell from price", () => {
    const afterClearSell = updateLastTwoOnTouch(
      updateLastTwoOnTouch(["price", "buy"], "buy", false),
      "sell",
      false,
    )
    const afterBuyTouch = updateLastTwoOnTouch(afterClearSell, "buy", false)
    const values = { sell: "", buy: "1000", price: "118.6879" }
    const repaired = repairLastTwo(afterBuyTouch, values, "buy")
    expect(repaired).toEqual(["buy", "price"])
    expect(getDerived(repaired)).toBe("sell")
    expect(computeDerived("sell", values)).toBe("8.4255")
  })

  it("never derives a locked sell amount when the buy amount is cleared", () => {
    const afterClearBuy = updateLastTwoOnTouch(["price", "sell"], "buy", true)
    expect(getDerived(afterClearBuy)).toBe("price")

    const values = { sell: "1", buy: "", price: "118.6879" }
    const repaired = repairLastTwo(afterClearBuy, values, "buy", true)

    // Without the lock this repairs to ["buy", "price"], which would recompute
    // the sell amount the user pinned.
    expect(getDerived(repaired)).toBe("price")
    expect(repairLastTwo(afterClearBuy, values, "buy", false)).toEqual([
      "buy",
      "price",
    ])

    // Price is the derived field and cannot be computed from an empty buy
    // amount, so the price input clears and both amounts stay as the user
    // left them.
    expect(computeDerived(getDerived(repaired), values)).toBe(null)
  })
})
