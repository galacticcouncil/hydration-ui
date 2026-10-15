import { describe, test } from "@e2e-dev/web"
import { expect } from "e2e"

import { expectDataRows, openPage } from "../support/app"

describe("liquidity", { tags: ["liquidity"] }, () => {
  test("pool type tabs filter the list", async ({ app, screen, browser }) => {
    await openPage(app, screen, "/liquidity")
    await expect(screen.getByRole("columnheader", "Pair")).toBeVisible()

    for (const [tab, type] of [
      ["Concentrated liquidity", "vaults"],
      ["Omnipool & stablepool", "omnipoolStablepool"],
      ["Isolated", "isolated"],
      ["All pools", "all"],
    ]) {
      await screen.getByRole("link", tab).tap()
      await expect(browser).toHaveURL(new RegExp(`type=${type}\\b`))
    }
    await expect(screen.getByRole("link", "Create Isolated Pool")).toBeVisible()
  })

  test("search narrows pools to the asset", async ({ app, screen }) => {
    await openPage(app, screen, "/liquidity?type=omnipoolStablepool")
    await screen.getByPlaceholder("Search...").fill("PAXG")
    await expectDataRows(screen.getByRole("table").first(), "PAXG")
  })

  test("omnipool details lead to add liquidity", async ({
    app,
    screen,
    browser,
  }) => {
    // 39 = PAXG, an omnipool asset with farms.
    await openPage(app, screen, "/liquidity/39")
    await expect(screen.getByTestId("pool-liquidity-limit")).toBeVisible()
    await expect(screen.getByTestId("yield-opportunities")).toBeVisible()

    await screen.getByRole("link", "Add Liquidity").tap()
    await expect(browser).toHaveURL(/\/liquidity\/39\/add/)
    const dialog = screen.getByRole("dialog", "Add Liquidity")
    await expect(dialog.getByTestId("pool-share")).toBeVisible()
    await expect(dialog.getByRole("button", "PAXG PAXG")).toBeVisible()
  })

  test("join farms page explains the requirement", async ({ app, screen }) => {
    await openPage(app, screen, "/liquidity/39/join")
    await expect(screen.getByRole("heading", "Join Farms")).toBeVisible()
    await expect(screen.getByRole("button", "Join Farms")).toBeDisabled()
  })

  test("concentrated liquidity vault explains its states", async ({
    app,
    screen,
  }) => {
    await openPage(app, screen, "/liquidity?type=vaults")
    await screen.getByRole("link", "Details").first().tap()
    await expect(screen.getByRole("heading", "Composition")).toBeVisible()
    await expect(
      screen.getByRole("heading", "How this pool works"),
    ).toBeVisible()

    await screen.getByRole("radio", "Price moves out").tap()
    await expect(screen.getByRole("radio", "Price moves out")).toBeChecked()
    await expect(screen.getByRole("radio", "In range")).not.toBeChecked()
  })

  test("create isolated pool starts empty", async ({ app, screen }) => {
    await openPage(app, screen, "/liquidity/create")
    await expect(
      screen.getByRole("heading", "Create Isolated Pool"),
    ).toBeVisible()
    await expect(
      screen.getByRole("button", "Create Isolated Pool"),
    ).toBeDisabled()
  })
})
