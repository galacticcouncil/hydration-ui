import { describe, test } from "@e2e-dev/web"
import type { Locator } from "e2e"
import { expect } from "e2e"

import { openPage } from "../support/app"

// Mainnet balances and vault capacity can make MAX unavailable. Report this
// precondition explicitly instead of passing without exercising the button.
const pressMax = async (scope: Locator) => {
  const max = scope.getByRole("button", "max")
  await expect(max).toBeVisible({ timeout: 30_000 })
  test.skip(
    await max.isDisabled(),
    "MAX unavailable: account balance or vault capacity",
  )
  await max.tap()
  // The amount MAX fills is the first textbox; forms may also show a "You receive" one.
  const amount = async () =>
    Number(
      (await scope.getByRole("textbox").first().inputValue()).replace(
        /\s/g,
        "",
      ),
    )
  await expect.poll(amount, { timeout: 15_000 }).toBeGreaterThan(0)
}

describe("strategies", { tags: ["strategies"] }, () => {
  test("lists BIL vault and HOLLAR bonds", async ({ app, screen }) => {
    await openPage(app, screen, "/strategies")
    // Each card is a stretched link (zero-size <a> with a ::before overlay),
    // so check where it points rather than tapping it.
    await expect(
      screen.getByRole("link", "Brazilian Invoice Loans"),
    ).toHaveAttribute("href", "/strategies/bil-vault")
    await expect(screen.getByRole("link", "HOLLAR Bonds")).toHaveAttribute(
      "href",
      "/strategies/hollar-bonds",
    )
  })

  test("BIL vault shows details, deposit form and withdrawals", async ({
    app,
    screen,
  }) => {
    await openPage(app, screen, "/strategies/bil-vault")
    for (const heading of [
      "My positions",
      "Strategy details",
      "About BIL",
      "Withdrawals",
    ])
      await expect(screen.getByRole("heading", heading).first()).toBeVisible()
    await expect(
      screen.getByRole("button", /^1 BIL = [\d.]+ HOLLAR$/),
    ).toBeVisible({
      timeout: 30_000,
    })
    await expect(screen.getByRole("switch", "Auto-claim")).toBeVisible()
  })

  test("BIL vault MAX fills deposit", async ({ app, screen }) => {
    await openPage(app, screen, "/strategies/bil-vault")
    await expect(screen.getByRole("heading", "My positions")).toBeVisible()
    await pressMax(screen.getByRole("main"))
  })

  for (const [action, title] of [
    ["Withdraw", "Withdraw BIL"],
    ["Repay", "Repay HOLLAR"],
    ["Borrow", "Borrow HOLLAR"],
  ]) {
    test(`BIL vault MAX fills ${action.toLowerCase()}`, async ({
      app,
      screen,
    }) => {
      await openPage(app, screen, "/strategies/bil-vault")
      await screen.getByRole("main").getByRole("button", action).tap()
      const dialog = screen.getByRole("dialog", title)
      await expect(dialog).toBeVisible()
      await expect(dialog.getByTestId("health-factor")).toBeVisible()
      await pressMax(dialog)
      if (action === "Borrow")
        await expect(dialog.getByRole("button", "Borrow HOLLAR")).toBeEnabled()
      await dialog.press("Escape")
      await expect(dialog).toHaveCount(0)
    })
  }

  test("HOLLAR bonds list past sales that open a bond", async ({
    app,
    screen,
    browser,
  }) => {
    await openPage(app, screen, "/strategies/hollar-bonds")
    await expect(screen.getByRole("heading", "Past sales")).toBeVisible()
    await screen.getByRole("link", "Details").first().tap()
    await expect(browser).toHaveURL(/\/strategies\/hollar-bonds\/\d+/)
    await expect(screen.getByRole("heading", "Strategy details")).toBeVisible()
  })
})
