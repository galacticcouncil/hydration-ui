import { describe, expect, it } from "vitest"

import {
  getLooperEntry,
  type LooperEntryInput,
} from "@/modules/strategies/multiply/utils/entry"

const HUSDT = "111"
const USDT = "10"

const e18 = 10n ** 18n

// HUSDT (18 dec) / USDC (6 dec), price 1, 100 HDX fee budget.
const base: LooperEntryInput = {
  account: "7KATdGakyhfBGnAt3XVgXTL7cYjzRXeSZHezKNtENcbwWibb",
  payAssetId: USDT,
  collateralAssetId: HUSDT,
  step1: { variant: "sell", events: { routerExecuted: [] } },
  minAmount: 0n,
  maxDeposit: null,
  feeBudget: 100n * 10n ** 12n,
  floors: {
    collateralDecimals: 18,
    debtDecimals: 6,
    collateralPriceInDebt: 1,
    debtEd: 10_000n,
    aCollateralEd: 10n ** 16n,
  },
}

const executed = (assetIn: string, assetOut: string, amountOut: bigint) => ({
  asset_in: Number(assetIn),
  asset_out: Number(assetOut),
  amount_in: 1000n * 10n ** 6n,
  amount_out: amountOut,
  event_id: 7,
})

describe("getLooperEntry", () => {
  it("opens with the amount_out of the pay → collateral router sell", () => {
    const entry = getLooperEntry({
      ...base,
      step1: {
        variant: "sell",
        events: { routerExecuted: [executed(USDT, HUSDT, 998n * e18)] },
      },
    })

    expect(entry).toEqual({
      ok: true,
      received: 998n * e18,
      open: {
        amount: 998n * e18,
        minIntentDebt: 9_980_000n,
        minIntentAToken: 998n * 10n ** 16n,
        feeBudget: 100n * 10n ** 12n,
      },
    })
  })

  it("ignores router events for other assets in the same result", () => {
    const entry = getLooperEntry({
      ...base,
      step1: {
        variant: "sell",
        events: {
          routerExecuted: [
            executed("0", USDT, 5n * 10n ** 6n),
            executed(USDT, HUSDT, 998n * e18),
          ],
        },
      },
    })

    expect(entry.ok && entry.received).toBe(998n * e18)
  })

  it("opens with the shares LiquidityAdded credits to the account in the collateral pool", () => {
    const liquidityAdded = (who: string, poolId: number, shares: bigint) => ({
      pool_id: poolId,
      who,
      shares,
    })

    const entry = getLooperEntry({
      ...base,
      payAssetId: "222",
      step1: {
        variant: "proportional",
        events: {
          liquidityAdded: [
            liquidityAdded("someoneElse", 111, 50n * e18),
            liquidityAdded(base.account, 110, 40n * e18),
            liquidityAdded(base.account, 111, 300n * e18),
          ],
        },
      },
    })

    expect(entry.ok && entry.received).toBe(300n * e18)
  })

  it("falls back to the collateral balance diff when the result has no events (EVM, WETH fee)", () => {
    const entry = getLooperEntry({
      ...base,
      step1: {
        variant: "sell",
        events: { routerExecuted: [] },
        // 500 HUSDT pre-held stays out of the loop
        balances: { before: 500n * e18, after: 1497n * e18 },
      },
    })

    expect(entry.ok && entry.open.amount).toBe(997n * e18)
  })

  it("prefers the event over the balance diff (EVM permit result carries events)", () => {
    const entry = getLooperEntry({
      ...base,
      step1: {
        variant: "sell",
        events: { routerExecuted: [executed(USDT, HUSDT, 998n * e18)] },
        balances: { before: 500n * e18, after: 2000n * e18 },
      },
    })

    expect(entry.ok && entry.received).toBe(998n * e18)
  })

  it("floors a small deposit's intents at 2 × ED", () => {
    const entry = getLooperEntry({
      ...base,
      step1: {
        variant: "sell",
        events: { routerExecuted: [executed(USDT, HUSDT, e18)] },
      },
    })

    // 1% of 1 HUSDT = 0.01, under 2 × ED on both legs
    expect(entry.ok && entry.open).toMatchObject({
      minIntentDebt: 20_000n,
      minIntentAToken: 2n * 10n ** 16n,
    })
  })

  it("keeps the full HDX fee budget when paying with HDX", () => {
    const entry = getLooperEntry({
      ...base,
      payAssetId: "0",
      step1: {
        variant: "sell",
        events: { routerExecuted: [executed("0", HUSDT, 40n * e18)] },
      },
    })

    expect(entry.ok && entry.open).toMatchObject({
      amount: 40n * e18,
      feeBudget: 100n * 10n ** 12n,
    })
  })

  it("errors with nothingReceived when step 1 delivered nothing", () => {
    expect(
      getLooperEntry({
        ...base,
        step1: {
          variant: "sell",
          events: { routerExecuted: [] },
          balances: { before: 500n * e18, after: 500n * e18 },
        },
      }),
    ).toEqual({ ok: false, error: "nothingReceived", received: 0n })
  })

  it("errors with belowMinimum when the received amount is under the minimum", () => {
    expect(
      getLooperEntry({
        ...base,
        minAmount: 1000n * e18,
        step1: {
          variant: "sell",
          events: { routerExecuted: [executed(USDT, HUSDT, 998n * e18)] },
        },
      }),
    ).toEqual({ ok: false, error: "belowMinimum", received: 998n * e18 })
  })

  it("errors with aboveMarketRoom when the received amount exceeds the max deposit", () => {
    expect(
      getLooperEntry({
        ...base,
        maxDeposit: 900n * e18,
        step1: {
          variant: "sell",
          events: { routerExecuted: [executed(USDT, HUSDT, 998n * e18)] },
        },
      }),
    ).toEqual({ ok: false, error: "aboveMarketRoom", received: 998n * e18 })
  })
})
