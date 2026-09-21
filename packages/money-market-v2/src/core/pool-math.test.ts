import { describe, expect, it } from "vitest"

import {
  calculateAvailableBorrowsMarketReferenceCurrency,
  calculateCompoundedInterest,
  calculateHealthFactorFromBalances,
  calculateHealthFactorFromBalancesBigUnits,
  calculateLinearInterest,
  getCompoundedBalance,
  getLinearBalance,
  getMarketReferenceCurrencyAndUsdBalance,
  getReserveNormalizedIncome,
} from "@/core"

describe("pool math", () => {
  it("computes a collateral balance from chain data", () => {
    // Exported from user 0xa5a69107816c5e3dfa5561e6b621dfe6294f6e5b at block
    // 11581421, reserve YFI. Expected balance computed with hardhat.
    const underlyingBalance = getLinearBalance({
      balance: 161316503206059870n,
      index: 1001723339432542553527150680n,
      rate: 22461916953455574582370088n,
      lastUpdateTimestamp: 1609673617,
      currentTimestamp: 1609675535,
    })

    expect(underlyingBalance).toBe(161594727054623229n)
  })

  it("calculates compounded interest", () => {
    const interest = calculateCompoundedInterest({
      rate: 500000000000000000n,
      currentTimestamp: 1729942300,
      lastUpdateTimestamp: 1629942200,
    })

    expect(interest).toBe(1000000001585491184589599100n)
  })

  it("calculates a compounded balance", () => {
    const balance = getCompoundedBalance({
      principalBalance: 10000n,
      reserveIndex: 1048540642417873765200833079n,
      reserveRate: 500000000000000000n,
      currentTimestamp: 1729942300,
      lastUpdateTimestamp: 1629942200,
    })

    expect(balance).toBe(10485n)
  })

  it("returns a zero compounded balance untouched", () => {
    const balance = getCompoundedBalance({
      principalBalance: 0n,
      reserveIndex: 1048540642417873765200833079n,
      reserveRate: 500000000000000000n,
      currentTimestamp: 1729942300,
      lastUpdateTimestamp: 1629942200,
    })

    expect(balance).toBe(0n)
  })

  it("calculates linear interest", () => {
    const linearInterest = calculateLinearInterest({
      rate: 500000000000000000n,
      currentTimestamp: 1729942300,
      lastUpdateTimestamp: 1629942200,
    })

    expect(linearInterest).toBe(1000000001585491184677828513n)
  })

  it("calculates reserve normalized income", () => {
    const income = getReserveNormalizedIncome({
      rate: 500000000000000000n,
      index: 1048540642417873765200833079n,
      currentTimestamp: 1729942300,
      lastUpdateTimestamp: 1629942200,
    })

    expect(income).toBe(1048540644080325710530799122n)
  })

  it("returns the index when the rate is 0", () => {
    const income = getReserveNormalizedIncome({
      rate: 0n,
      index: 1048540642417873800000000000n,
      currentTimestamp: 1729942300,
      lastUpdateTimestamp: 1629942200,
    })

    expect(income).toBe(1048540642417873800000000000n)
  })

  it("calculates a health factor", () => {
    const atLiquidation = calculateHealthFactorFromBalances({
      collateralBalanceMarketReferenceCurrency: "100000000000000000",
      borrowBalanceMarketReferenceCurrency: "50000000000000000",
      currentLiquidationThreshold: 5000,
    })
    expect(atLiquidation.toFixed()).toBe("1")

    const healthy = calculateHealthFactorFromBalances({
      collateralBalanceMarketReferenceCurrency: "100000000000000000",
      borrowBalanceMarketReferenceCurrency: "30000000000000000",
      currentLiquidationThreshold: 5000,
    })
    expect(healthy.toFixed()).toBe("1.66666666666666666667")
  })

  it("returns a health factor of -1 when there is no debt", () => {
    const healthFactor = calculateHealthFactorFromBalances({
      collateralBalanceMarketReferenceCurrency: "100000000000000000",
      borrowBalanceMarketReferenceCurrency: 0,
      currentLiquidationThreshold: 5000,
    })

    expect(healthFactor.toFixed()).toBe("-1")
  })

  it("returns a health factor of -1 when there is neither collateral nor debt", () => {
    // -1 means "no debt" and nothing else (ADR-0006). An empty position is
    // still an unliquidatable one, not a missing user.
    const healthFactor = calculateHealthFactorFromBalances({
      collateralBalanceMarketReferenceCurrency: 0,
      borrowBalanceMarketReferenceCurrency: 0,
      currentLiquidationThreshold: 0,
    })

    expect(healthFactor.toFixed()).toBe("-1")
  })

  it("calculates a health factor from a big-unit threshold", () => {
    const atLiquidation = calculateHealthFactorFromBalancesBigUnits({
      collateralBalanceMarketReferenceCurrency: "100000000000000000",
      borrowBalanceMarketReferenceCurrency: "50000000000000000",
      currentLiquidationThreshold: 5000,
    })
    expect(atLiquidation.toFixed()).toBe("10000")

    const healthy = calculateHealthFactorFromBalancesBigUnits({
      collateralBalanceMarketReferenceCurrency: "100000000000000000",
      borrowBalanceMarketReferenceCurrency: "30000000000000000",
      currentLiquidationThreshold: 5000,
    })
    expect(healthy.toFixed()).toBe("16666.66666666666666666667")
  })

  it("truncates a fractional big-unit threshold to whole basis points", () => {
    const healthFactor = calculateHealthFactorFromBalancesBigUnits({
      collateralBalanceMarketReferenceCurrency: "100000000000000000",
      borrowBalanceMarketReferenceCurrency: "50000000000000000",
      // 0.50009 is 5000.9 bps; the contracts hold 5000.
      currentLiquidationThreshold: "0.50009",
    })

    expect(healthFactor.toFixed()).toBe("1")
  })

  it("calculates available borrows", () => {
    const maxedOut = calculateAvailableBorrowsMarketReferenceCurrency({
      collateralBalanceMarketReferenceCurrency: "1000000000000000000",
      borrowBalanceMarketReferenceCurrency: "50000000000000000",
      currentLtv: 0.5,
    })
    expect(maxedOut.toFixed()).toBe("0")

    const stillMaxedOut = calculateAvailableBorrowsMarketReferenceCurrency({
      collateralBalanceMarketReferenceCurrency: "1000000000000000000",
      borrowBalanceMarketReferenceCurrency: "30000000000000000",
      currentLtv: 0.5,
    })
    expect(stillMaxedOut.toFixed()).toBe("0")
  })

  it("calculates available borrows against a basis-point LTV", () => {
    const available = calculateAvailableBorrowsMarketReferenceCurrency({
      collateralBalanceMarketReferenceCurrency: "1000000000000000000",
      borrowBalanceMarketReferenceCurrency: "30000000000000000",
      currentLtv: 5000,
    })

    expect(available.toFixed()).toBe("470000000000000000")
  })

  it("returns no available borrows when the LTV is 0", () => {
    const available = calculateAvailableBorrowsMarketReferenceCurrency({
      collateralBalanceMarketReferenceCurrency: "1000000000000000000",
      borrowBalanceMarketReferenceCurrency: "50000000000000000",
      currentLtv: 0,
    })

    expect(available.toFixed()).toBe("0")
  })

  it("converts a balance to market reference currency and USD", () => {
    const { marketReferenceCurrencyBalance, usdBalance } =
      getMarketReferenceCurrencyAndUsdBalance({
        balance: "10000000000000000000", // 10
        priceInMarketReferenceCurrency: "1000000000000000000", // 1
        marketReferenceCurrencyDecimals: 18,
        decimals: 18,
        marketReferencePriceInUsdNormalized: 2.5,
      })

    expect(marketReferenceCurrencyBalance.toFixed()).toBe(
      "10000000000000000000",
    )
    expect(usdBalance.toFixed()).toBe("25")
  })
})
