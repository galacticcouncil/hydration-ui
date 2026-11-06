import { describe, test } from "@e2e-dev/web"
import type { App, Locator, Screen } from "e2e"
import { expect } from "e2e"

import {
  ASSET,
  expectDataRows,
  expectReviewThenClose,
  openPage,
  PAGE_LOAD_TIMEOUT,
  skipIfBalanceBelow,
  skipUnlessRowHas,
  swapUrl,
} from "../support/app"

// Inputs show thousands with spaces ("10 000"); the limit price ends in its unit ("0.0065 DOT").
const amountOf = async (input: Locator) =>
  parseFloat((await input.inputValue()).replace(/\s/g, ""))

// Opens Place order and picks both assets; amounts stay read-only until then.
const openOtcOrder = async (screen: Screen, offer: string, get: string) => {
  await screen.getByRole("button", "Place order").tap()
  const dialog = screen.getByRole("dialog", "Place order")
  for (const [field, symbol] of [
    ["otc-offer", offer],
    ["otc-buy", get],
  ]) {
    await dialog.getByTestId(field).getByRole("button", "Select asset").tap()
    const picker = screen.getByRole("dialog", "Asset select modal")
    await picker.getByRole("textbox").fill(symbol)
    await picker
      .getByRole("option", new RegExp(`^${symbol} ${symbol} `))
      .first()
      .tap()
    await expect(picker).toHaveCount(0)
  }
  const offerAmount = dialog.getByTestId("otc-offer").getByRole("textbox")
  const price = dialog.getByTestId("otc-price")
  const getAmount = dialog.getByTestId("otc-buy").getByRole("textbox")
  await expect
    .poll(() => amountOf(price), { timeout: 30_000 })
    .toBeGreaterThan(0)
  return { dialog, offerAmount, price, getAmount }
}

// Get is derived from offer × price; the price input is rounded for display.
const expectGetMatchesPrice = async (
  offerAmount: Locator,
  price: Locator,
  getAmount: Locator,
) => {
  const expected = async () =>
    Math.abs(
      (await amountOf(getAmount)) /
        ((await amountOf(offerAmount)) * (await amountOf(price))) -
        1,
    )
  await expect.poll(expected, { timeout: 15_000 }).toBeLessThan(0.005)
}

const marketInputs = (screen: Screen) => ({
  sell: screen.getByTestId("trade-sell").getByRole("textbox"),
  buy: screen.getByTestId("trade-buy").getByRole("textbox"),
})

// "Edit" next to Trade limit opens settings for the selected option only,
// so the dialog has a single slippage field. 1, 2 and 3 are presets.
const setSlippage = async (screen: Screen, value: string) => {
  await screen.getByRole("main").getByRole("button", "Edit").tap()
  const dialog = screen.getByRole("dialog", "Trade settings")
  if (["1", "2", "3"].includes(value))
    await dialog.getByRole("radio", `${value}%`).tap()
  else await dialog.getByRole("textbox", "%").fill(value)
  await expect(dialog.getByRole("textbox", "%")).toHaveValue(value)
  await dialog.press("Escape")
  await expect(dialog).toHaveCount(0)
  await expect(screen.getByTestId("trade-slippage")).toHaveText(`${value}%`)
}

describe("swap", { tags: ["trade"] }, () => {
  for (const [mode, amount, slippage] of [
    ["single", "1000", "2"],
    ["single", "2500", "0.5"],
    ["single", "400", "3"],
    ["twap", "1000", "3"],
    ["twap", "5000", "1.5"],
  ]) {
    test(`market: ${mode} ${amount} HDX with ${slippage}% slippage opens review`, async ({
      app,
      screen,
    }) => {
      await openPage(app, screen, swapUrl("market", ASSET.HDX, ASSET.DOT))
      const { sell, buy } = marketInputs(screen)
      await skipIfBalanceBelow(screen.getByTestId("trade-sell"), Number(amount))
      await expect(screen.getByRole("button", "Enter an amount")).toBeDisabled()
      await sell.fill(amount)
      await expect
        .poll(() => amountOf(buy), { timeout: 30_000 })
        .toBeGreaterThan(0)
      if (mode === "twap")
        await screen.getByRole("button", /^TWAP Execute /).tap()
      await setSlippage(screen, slippage)
      if (mode === "twap") {
        await screen.getByRole("button", "Place trades").tap()
        // Slippage is in permill; budget is the whole sell amount.
        await expectReviewThenClose(
          screen,
          new RegExp(
            `Dca: \\{ asset_in: 0 asset_out: 5 .*slippage: ${Number(slippage) * 10_000} budget: "${amount}000000000000"`,
          ),
        )
      } else {
        const quoted = await amountOf(buy)
        await screen.getByRole("button", "Swap").tap()
        const review = await expectReviewThenClose(
          screen,
          new RegExp(
            `Swap: \\{ asset_in: 0 asset_out: 5 amount_in: "${amount}000000000000"`,
          ),
        )
        // Minimum received is in DOT planck; allow 0.2% live quote drift.
        const minReceived =
          Number(review.match(/amount_out:\s*"(\d+)"/)?.[1]) / 1e10
        expect(
          Math.abs(minReceived / quoted - (1 - Number(slippage) / 100)),
        ).toBeLessThan(0.002)
      }
    })
  }

  test("single trade and TWAP keep separate slippage settings", async ({
    app,
    screen,
  }) => {
    await openPage(app, screen, swapUrl("market", ASSET.HDX, ASSET.DOT))
    const { sell, buy } = marketInputs(screen)
    await sell.fill("1000")
    await expect
      .poll(() => amountOf(buy), { timeout: 30_000 })
      .toBeGreaterThan(0)
    await setSlippage(screen, "3")
    await screen.getByRole("button", /^TWAP Execute /).tap()
    await setSlippage(screen, "1.5")
    await screen.getByRole("button", /^Single trade /).tap()
    await expect(screen.getByTestId("trade-slippage")).toHaveText("3%")
    await screen.getByRole("button", /^TWAP Execute /).tap()
    await expect(screen.getByTestId("trade-slippage")).toHaveText("1.5%")
  })

  test("summary below the submit button opens and closes", async ({
    app,
    screen,
  }) => {
    await openPage(app, screen, swapUrl("market", ASSET.HDX, ASSET.DOT))
    const { sell, buy } = marketInputs(screen)
    await sell.fill("1000")
    await expect
      .poll(() => amountOf(buy), { timeout: 30_000 })
      .toBeGreaterThan(0)

    // The Minimum received row is the toggle; the rest is hidden until opened.
    const toggle = screen.getByTestId("trade-summary-toggle")
    const details = screen.getByTestId("trade-summary-details")
    await expect(details).toHaveCount(0)
    await toggle.tap()
    await expect(details).toBeVisible()
    await toggle.tap()
    await expect(details).toHaveCount(0)
  })

  test("market, limit and TWAP keep the pair and the sell amount", async ({
    app,
    screen,
    browser,
  }) => {
    await openPage(app, screen, swapUrl("market", ASSET.HDX, ASSET.DOT))
    // The sell field keeps the same test ID across trade tabs.
    const sell = screen.getByTestId("trade-sell").getByRole("textbox")
    await sell.fill("1000")

    // Each tab shows the amount typed on the previous one, then changes it.
    for (const [tab, path, control, before, after] of [
      [
        "Limit",
        "limit",
        screen.getByRole("switch", "Partially fillable"),
        "1 000",
        "2500",
      ],
      [
        "TWAP",
        "twap",
        screen.getByRole("radio", "Limited budget"),
        "2 500",
        "400",
      ],
      [
        "Market",
        "market",
        screen.getByRole("button", "Settings"),
        "400",
        "750",
      ],
    ] as const) {
      await screen.getByRole("link", tab).tap()
      await expect(browser).toHaveURL(
        new RegExp(`/trade/swap/${path}\\?.*assetIn=%220%22&assetOut=%225%22`),
      )
      await expect(control).toBeVisible()
      await expect(sell).toHaveValue(before)
      await sell.fill(after)
    }

    await screen.getByTestId("switch-assets").tap()
    await expect(browser).toHaveURL(/assetIn=%225%22.*assetOut=%220%22/)
  })

  test("market transactions list recent trades", async ({ app, screen }) => {
    await openPage(app, screen, swapUrl("market", ASSET.HDX, ASSET.DOT))
    await screen.getByRole("link", "Market transactions").tap()
    await expect(
      screen.getByRole("table").last().getByRole("row").nth(1),
    ).toBeVisible({ timeout: 30_000 })
  })
})

// HDX -> DOT limit form, once the spot price has loaded.
const openLimit = async (app: App, screen: Screen) => {
  await openPage(app, screen, swapUrl("limit", ASSET.HDX, ASSET.DOT))
  const spotButton = screen.getByRole("button", /^Spot [\d.]+$/)
  await expect(spotButton).toBeVisible({ timeout: 30_000 })
  const { sell, buy } = marketInputs(screen)
  const price = screen.getByTestId("limit-price")
  // Until the form settles the inputs are busy.
  await expect(sell).toHaveAttribute("aria-busy", "false")
  const spot = Number(
    ((await spotButton.textContent()) ?? "").replace(/[^\d.]/g, ""),
  )
  return { sell, buy, price, spot }
}

// The pill reads "+5.00%" or "-22.61%".
const deviationOf = async (screen: Screen) =>
  parseFloat(
    (
      (await screen.getByRole("button", "Edit deviation").textContent()) ?? ""
    ).replace(/[^\d.+-]/g, ""),
  )

const expectRate = async (
  screen: Screen,
  price: Locator,
  spot: number,
  pct: number,
) => {
  await expect
    .poll(async () => (await amountOf(price)) / spot, { timeout: 15_000 })
    .toBeCloseTo(1 + pct / 100, 2)
  // The deviation is derived back from the rounded price, so +5% can read +4.99%.
  await expect.poll(() => deviationOf(screen)).toBeCloseTo(pct, 0)
}

// Submitting before the order settles is silently ignored, so wait for the
// summary. The review must sell and buy exactly what the form shows.
const placeLimitAndReview = async (
  screen: Screen,
  sell: Locator,
  buy: Locator,
) => {
  await expect(screen.getByTestId("limit-min-received")).toBeVisible()
  const [sold, bought] = [await amountOf(sell), await amountOf(buy)]
  await screen.getByRole("button", "Place limit order").tap()
  const review = await expectReviewThenClose(
    screen,
    /Intent\.submit_intent.*asset_in: 0 asset_out: 5/,
  )
  // HDX has 12 decimals, DOT 10; buy is shown rounded to 4 significant digits.
  const planck = (field: string) =>
    Number(review.match(new RegExp(`${field}:\\s*"(\\d+)"`))?.[1])
  expect(planck("amount_in") / 1e12).toBeCloseTo(sold, 6)
  expect(Math.abs(planck("amount_out") / 1e10 / bought - 1)).toBeLessThan(0.001)
}

describe("limit order", { tags: ["trade"] }, () => {
  test("preset buttons and reset move the price above spot", async ({
    app,
    screen,
  }) => {
    const { sell, buy, price, spot } = await openLimit(app, screen)
    await sell.fill("1000")
    // Buy is derived at spot until a rate is picked.
    await expectRate(screen, price, spot, 0)
    await expectGetMatchesPrice(sell, price, buy)

    // Presets change the price and buy; the sell amount stays.
    for (const step of [1, 5, 10]) {
      await screen.getByRole("button", `+${step}%`).tap()
      await expectRate(screen, price, spot, step)
      await expect(sell).toHaveValue("1 000")
      await expectGetMatchesPrice(sell, price, buy)
    }

    await screen.getByRole("button", "Reset deviation to market price").tap()
    await expectRate(screen, price, spot, 0)
    await expectGetMatchesPrice(sell, price, buy)

    await screen.getByRole("button", "+5%").tap()
    await expectRate(screen, price, spot, 5)
    await placeLimitAndReview(screen, sell, buy)
  })

  test("custom deviation and typed price set the rate below and above spot", async ({
    app,
    screen,
  }) => {
    const { sell, buy, price, spot } = await openLimit(app, screen)
    await sell.fill("1000")
    await expectRate(screen, price, spot, 0)

    // Custom deviation below spot, typed into the pill.
    await screen.getByRole("button", "Edit deviation").tap()
    await screen.getByTestId("limit-deviation").fill("-5")
    await screen.getByTestId("limit-deviation").press("Enter")
    await expectRate(screen, price, spot, -5)
    await expectGetMatchesPrice(sell, price, buy)
    await placeLimitAndReview(screen, sell, buy)

    // A typed price above, then below spot; the pill follows it.
    for (const pct of [20, -20]) {
      await price.fill((spot * (1 + pct / 100)).toPrecision(4))
      await expectRate(screen, price, spot, pct)
      await expect(sell).toHaveValue("1 000")
      await expectGetMatchesPrice(sell, price, buy)
    }
    await placeLimitAndReview(screen, sell, buy)
  })

  test("locking the sell amount keeps it fixed while buy and price change", async ({
    app,
    screen,
  }) => {
    const { sell, buy, price, spot } = await openLimit(app, screen)
    await sell.fill("1000")
    const rate = Number((spot * 1.1).toPrecision(4))
    await price.fill(String(rate))
    await expectGetMatchesPrice(sell, price, buy)

    // Unlocked: the last two edited fields win, so a new buy moves sell.
    await buy.fill(String(Number((2000 * rate).toPrecision(6))))
    await expect.poll(() => amountOf(sell)).toBeCloseTo(2000, 0)
    expect(await amountOf(price)).toBe(rate)

    // The lock appears once there is a sell amount.
    await screen
      .getByRole("button", /^When locked, sell amount stays fixed/)
      .tap()

    // Locked: buy moves the price instead.
    await buy.fill(String(Number((2000 * spot * 0.9).toPrecision(6))))
    await expectRate(screen, price, spot, -10)
    await expect(sell).toHaveValue("2 000")

    // Locked: price and presets move buy.
    await price.fill((spot * 1.15).toPrecision(4))
    await expectRate(screen, price, spot, 15)
    await expect(sell).toHaveValue("2 000")
    await expectGetMatchesPrice(sell, price, buy)

    await screen.getByRole("button", "+1%").tap()
    await expectRate(screen, price, spot, 1)
    await expect(sell).toHaveValue("2 000")
    await expectGetMatchesPrice(sell, price, buy)

    await placeLimitAndReview(screen, sell, buy)
  })
})

describe("OTC", { tags: ["trade"] }, () => {
  test("lists offers and filters them by asset", async ({
    app,
    screen,
    browser,
  }) => {
    await openPage(app, screen, "/trade/otc")
    await expect(screen.getByRole("columnheader", "Offer")).toBeVisible({
      timeout: PAGE_LOAD_TIMEOUT,
    })
    await expect(screen.getByRole("button", "Fill order").first()).toBeVisible({
      timeout: 30_000,
    })

    // Search also matches asset names ("Polkadot" hits "DOT"), so use USDT.
    await skipUnlessRowHas(screen.getByRole("table"), "USDT")
    await screen.getByPlaceholder("Search assets...").fill("USDT")
    await expect(browser).toHaveURL(/search=USDT/)
    await expectDataRows(screen.getByRole("table"), "USDT")

    await screen.getByRole("link", "My offers").tap()
    await expect(browser).not.toHaveURL(/offers=all/)
    await expect(screen.getByTestId("data-table-empty")).toBeVisible()
  })

  test("offering HDX for DOT prices at market, +10% and opens review", async ({
    app,
    screen,
  }) => {
    await openPage(app, screen, "/trade/otc")
    const { dialog, offerAmount, price, getAmount } = await openOtcOrder(
      screen,
      "HDX",
      "DOT",
    )
    await skipIfBalanceBelow(dialog, 10_000)
    await expect(dialog.getByTestId("otc-price-for")).toContainText("HDX")
    const submit = dialog.getByRole("button", "Place order")
    await expect(submit).toBeDisabled()

    await offerAmount.fill("10000")
    await expectGetMatchesPrice(offerAmount, price, getAmount)
    await expect(submit).toBeEnabled()

    const marketPrice = await amountOf(price)
    await dialog.getByRole("button", "+10%").tap()
    await expect
      .poll(async () => (await amountOf(price)) / marketPrice, {
        timeout: 15_000,
      })
      .toBeCloseTo(1.1, 2)
    await expectGetMatchesPrice(offerAmount, price, getAmount)

    await dialog.getByRole("button", "MARKET PRICE").tap()
    await expect
      .poll(async () => (await amountOf(price)) / marketPrice, {
        timeout: 15_000,
      })
      .toBeCloseTo(1, 2)

    await dialog.getByRole("switch").tap()
    await expect(dialog.getByRole("switch")).not.toBeChecked()
    await submit.tap()
    // Maker's view: asset_out is what is offered (HDX = 0), asset_in what is asked (DOT = 5).
    await expectReviewThenClose(
      screen,
      /OTC\.place_order: \{ amount_in: "\d+" amount_out: "10000000000000000" asset_in: 5 asset_out: 0 partially_fillable: false/,
    )
  })

  test("offering DOT with max fills the balance and prices HDX", async ({
    app,
    screen,
  }) => {
    await openPage(app, screen, "/trade/otc")
    const { dialog, offerAmount, price, getAmount } = await openOtcOrder(
      screen,
      "DOT",
      "HDX",
    )
    await expect(dialog.getByTestId("otc-price-for")).toContainText("DOT")
    await skipIfBalanceBelow(dialog)
    await dialog.getByRole("button", "max").tap()
    await expect.poll(() => amountOf(offerAmount)).toBeGreaterThan(0)
    // Max fills the offer side's balance, the first "Balance:" in the modal.
    const balance = Number(
      (
        (await dialog
          .getByText(/^Balance: /)
          .first()
          .textContent()) ?? ""
      ).replace(/[^\d.]/g, ""),
    )
    expect(await amountOf(offerAmount)).toBeCloseTo(balance, 3)
    await expectGetMatchesPrice(offerAmount, price, getAmount)

    await dialog.getByRole("button", "Place order").tap()
    await expectReviewThenClose(
      screen,
      /OTC\.place_order: \{ .*asset_in: 0 asset_out: 5 partially_fillable: true/,
    )
  })

  test("an offer above the balance is rejected", async ({ app, screen }) => {
    await openPage(app, screen, "/trade/otc")
    const { dialog, offerAmount } = await openOtcOrder(screen, "HDX", "DOT")
    await offerAmount.fill("999999999")
    await expect(dialog.getByTestId("asset-input-error")).toBeVisible()
    await expect(dialog.getByRole("button", "Place order")).toBeDisabled()
  })
})
