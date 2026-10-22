import { describe, expect, it } from "vitest"

import {
  computeDerived,
  getDerived,
  getMarketQuoteDirection,
  touchField,
} from "@/modules/trade/swap/sections/Limit/cascadeLogic"

const PRICE = "118.6879"

describe("limit cascade", () => {
  it("quotes the fixed side so a quote cannot change its own input", () => {
    expect(getMarketQuoteDirection(["buy", "price"])).toBe("buy")
    expect(getMarketQuoteDirection(["sell", "price"])).toBe("sell")
    expect(getMarketQuoteDirection(["sell", "buy"])).toBe("sell")
  })

  it("derives buy from the price when sell is typed after clearing buy", () => {
    const afterClearBuy = touchField(
      ["price", "sell"],
      "buy",
      { sell: "1", buy: "", price: PRICE },
      false,
    )
    const afterTypeSell = touchField(
      afterClearBuy,
      "sell",
      { sell: "2", buy: "", price: PRICE },
      false,
    )

    expect(getDerived(afterTypeSell)).toBe("buy")
  })

  it("never derives a locked sell amount", () => {
    const values = { sell: "1", buy: "", price: PRICE }
    const afterClearBuy = touchField(["price", "sell"], "buy", values, true)

    // Unlocked, this derives sell. Locked, price is derived instead and clears
    // (it cannot come from an empty buy), leaving both amounts as the user set
    // them.
    expect(getDerived(afterClearBuy)).toBe("price")
    expect(computeDerived("price", values)).toBe(null)
  })
})

describe("computeDerived", () => {
  it("computes buy = sell × price in either direction", () => {
    expect(computeDerived("buy", { sell: "2", buy: "", price: PRICE })).toBe(
      "237.3758",
    )
    expect(
      computeDerived("sell", { sell: "", buy: "1000", price: PRICE }),
    ).toBe("8.4255")
    expect(computeDerived("price", { sell: "4", buy: "1", price: "" })).toBe(
      "0.25",
    )
  })

  it("clears buy on an empty or zero price but leaves sell alone", () => {
    const amounts = { sell: "100", buy: "50" }

    expect(computeDerived("buy", { ...amounts, price: "" })).toBe("")
    expect(computeDerived("buy", { ...amounts, price: "0" })).toBe("")
    expect(computeDerived("sell", { ...amounts, price: "" })).toBe(null)
  })
})
