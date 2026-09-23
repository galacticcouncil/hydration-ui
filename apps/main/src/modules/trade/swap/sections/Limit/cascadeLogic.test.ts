import { describe, expect, it } from "vitest"

import {
  computeDerived,
  getDerived,
  getMarketQuoteDirection,
  repairLastTwo,
  updateLastTwoOnTouch,
} from "@/modules/trade/swap/sections/Limit/cascadeLogic"

describe("limit cascade", () => {
  it("quotes the fixed side so a quote cannot change its own input", () => {
    expect(getMarketQuoteDirection(["buy", "price"])).toBe("buy")
    expect(getMarketQuoteDirection(["sell", "price"])).toBe("sell")
    expect(getMarketQuoteDirection(["sell", "buy"])).toBe("sell")
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

  it("clears buy when price is empty or zero", () => {
    const afterPriceTouch = updateLastTwoOnTouch(
      ["price", "sell"],
      "price",
      false,
    )
    expect(getDerived(afterPriceTouch)).toBe("buy")
    expect(computeDerived("buy", { sell: "100", buy: "50", price: "" })).toBe(
      "",
    )
    expect(computeDerived("buy", { sell: "100", buy: "50", price: "0" })).toBe(
      "",
    )
  })

  it("does not derive sell when price is cleared and sell would be derived", () => {
    const afterPriceTouch = updateLastTwoOnTouch(
      ["buy", "sell"],
      "price",
      false,
    )
    expect(getDerived(afterPriceTouch)).toBe("sell")
    expect(computeDerived("sell", { sell: "100", buy: "50", price: "" })).toBe(
      null,
    )
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
