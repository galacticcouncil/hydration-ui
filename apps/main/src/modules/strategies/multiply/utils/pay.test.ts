import { describe, expect, it } from "vitest"

import {
  getPayAssetId,
  getPayMaxBalance,
  getPayQuoteState,
  withCollateralFirst,
} from "@/modules/strategies/multiply/utils/pay"

const HUSDT_USDC = { collateralAssetId: "111", debtAssetId: "22" }
const HDX = "0"

describe("getPayAssetId", () => {
  it("defaults to the collateral when no pay asset is in the URL", () => {
    expect(getPayAssetId(HUSDT_USDC, undefined)).toBe("111")
  })

  it("keeps the pay asset from the URL", () => {
    expect(getPayAssetId(HUSDT_USDC, "10")).toBe("10")
  })
})

describe("getPayMaxBalance", () => {
  it("is the fee-adjusted balance when the pay asset isn't the fee-budget asset", () => {
    expect(
      getPayMaxBalance({
        spendable: "250.5",
        payAssetId: "10",
        feeAssetId: HDX,
        feeBudget: "100",
      }),
    ).toBe("250.5")
  })

  it("keeps the fee budget back when paying with the fee-budget asset", () => {
    expect(
      getPayMaxBalance({
        spendable: "1234.56",
        payAssetId: HDX,
        feeAssetId: HDX,
        feeBudget: "100",
      }),
    ).toBe("1134.56")
  })

  it("is zero when the balance can't cover the fee budget", () => {
    expect(
      getPayMaxBalance({
        spendable: "60",
        payAssetId: HDX,
        feeAssetId: HDX,
        feeBudget: "100",
      }),
    ).toBe("0")
  })
})

describe("withCollateralFirst", () => {
  const husdt = { id: "111", symbol: "HUSDT" }
  const usdt = { id: "10", symbol: "USDT", balance: "5" }

  it("adds the collateral at the top when the wallet holds none", () => {
    expect(withCollateralFirst([usdt], husdt)).toEqual([
      { id: "111", symbol: "HUSDT", balance: "0", balanceDisplay: "0" },
      usdt,
    ])
  })

  it("keeps the list as it is when the collateral is already in it", () => {
    const list = [{ ...husdt, balance: "3" }, usdt]
    expect(withCollateralFirst(list, husdt)).toBe(list)
  })

  it("leaves an empty list empty so the picker falls back to every asset", () => {
    expect(withCollateralFirst([], husdt)).toEqual([])
  })
})

describe("getPayQuoteState", () => {
  const routed = (errors: string[] = [], amountOut = 990_000n) => ({
    amountOut,
    swaps: [{ errors }],
  })

  it("is loading until a quote for the typed amount arrives", () => {
    expect(getPayQuoteState({ isLoading: true, isError: false })).toBe(
      "loading",
    )
  })

  it("has no route when the router can't find one", () => {
    expect(getPayQuoteState({ isLoading: false, isError: true })).toBe(
      "noRoute",
    )
  })

  it("has no route when the quote delivers nothing", () => {
    expect(
      getPayQuoteState({
        isLoading: false,
        isError: false,
        swap: routed([], 0n),
      }),
    ).toBe("noRoute")
  })

  it("is too small when a hop rejects the trading amount", () => {
    expect(
      getPayQuoteState({
        isLoading: false,
        isError: false,
        swap: routed(["InsufficientTradingAmount"]),
      }),
    ).toBe("tooSmall")
  })

  it("has no route when a hop rejects the trade for another reason", () => {
    expect(
      getPayQuoteState({
        isLoading: false,
        isError: false,
        swap: routed(["TradeNotAllowed"]),
      }),
    ).toBe("noRoute")
  })

  it("is ready with an executable quote", () => {
    expect(
      getPayQuoteState({ isLoading: false, isError: false, swap: routed() }),
    ).toBe("ready")
  })
})
