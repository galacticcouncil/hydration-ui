import { describe, test } from "@e2e-dev/web"
import { expect } from "e2e"

import { openPage } from "../support/app"

describe("borrow", { tags: ["borrow"] }, () => {
  test("dashboard shows supplies, borrows and both market lists", async ({
    app,
    screen,
  }) => {
    await openPage(app, screen, "/borrow/dashboard")
    for (const heading of [
      "My supplies",
      "My borrows",
      "Assets to supply",
      "Assets to borrow",
    ])
      await expect(screen.getByRole("heading", heading)).toBeVisible({
        timeout: 30_000,
      })
    await expect(screen.getByRole("button", "Risk details")).toBeVisible()
  })

  test("supply modal opens from assets to supply", async ({ app, screen }) => {
    await openPage(app, screen, "/borrow/dashboard")
    const dot = screen
      .getByRole("row", /^DOT DOT /)
      .filter({ has: screen.getByRole("button", "Supply") })
    await dot.getByRole("button", "Supply").tap()
    const dialog = screen.getByRole("dialog", "Supply DOT")
    await expect(dialog).toBeVisible()
    await expect(dialog).toContainText("DOT")
    await expect(dialog.getByRole("button", "Enter an amount")).toBeDisabled()
  })

  test("markets list assets and open a market", async ({
    app,
    screen,
    browser,
  }) => {
    await openPage(app, screen, "/borrow/markets")
    await expect(screen.getByRole("heading", "Available assets")).toBeVisible()
    const dot = screen.getByRole("row", /^DOT DOT /)
    await expect(dot).toBeVisible({ timeout: 30_000 })
    await dot.tap()
    await expect(browser).toHaveURL(/\/borrow\/markets\/0x[0-9a-fA-F]+/)
  })

  test("history lists transactions with a type filter", async ({
    app,
    screen,
  }) => {
    await openPage(app, screen, "/borrow/history")
    await expect(screen.getByRole("columnheader", "Type")).toBeVisible()
    await expect(
      screen.getByRole("row", /^\w[\w ]* \d{2}:\d{2}/).first(),
    ).toBeVisible({
      timeout: 30_000,
    })
    await screen.getByRole("button", "Filter by: All").tap()
    await screen
      .getByRole("menu", "Filter by: All")
      .getByRole("menuitemcheckbox", "Repay")
      .tap()
    await screen.getByRole("menu").press("Escape")
    await expect(screen.getByRole("button", "Filter by: Repay")).toBeVisible()
    await expect(
      screen.getByRole("row", /^Repay \d{2}:\d{2}/).first(),
    ).toBeVisible()
    await expect(
      screen.getByRole("row", /^Collateral Change \d{2}:\d{2}/),
    ).toHaveCount(0)
  })
})
