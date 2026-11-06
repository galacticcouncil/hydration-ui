import { describe, test } from "@e2e-dev/web"
import { expect } from "e2e"

import { expectDataRows, skipUnlessRowHas, openPage } from "../support/app"

describe("portfolio", { tags: ["portfolio"] }, () => {
  test("category tabs switch the view", async ({ app, screen, browser }) => {
    await openPage(app, screen, "/portfolio")
    // Loaded once the Hydration total replaces the skeleton.
    await expect(
      screen.getByRole("button", /^Polkadot 2034 Hydration \$/),
    ).toBeVisible({ timeout: 30_000 })

    for (const [tab, category, column] of [
      ["Liquidity positions", "liquidity", "Current value"],
      ["Bonds", "bonds", "Maturity"],
      ["Assets", "assets", "Transferable balance"],
    ]) {
      await screen.getByRole("link", tab).tap()
      await expect(browser).toHaveURL(new RegExp(`category=${category}\\b`))
      const table = screen
        .getByRole("table")
        .filter({ has: screen.getByRole("columnheader", column) })
        .first()
      await expectDataRows(table)
    }
  })

  test("search narrows the asset table", async ({ app, screen }) => {
    await openPage(app, screen, "/portfolio")
    await expect(
      screen.getByRole("link", "Start staking your HDX"),
    ).toBeVisible({
      timeout: 30_000,
    })
    const table = screen
      .getByRole("table")
      .filter({ has: screen.getByRole("columnheader", "Transferable balance") })
    // Search also matches asset names ("Polkadot" hits "DOT"), so use vDOT.
    await skipUnlessRowHas(table, "vDOT")
    await screen.getByPlaceholder("Search assets...").fill("vDOT")
    await expectDataRows(table, "vDOT")
    await expect(
      screen.getByRole("link", "Start staking your HDX"),
    ).toHaveCount(0)
  })

  test("tracks Polkadot, Solana and NEAR wallets, then removes them", async ({
    app,
    screen,
  }) => {
    // Shown truncated as first 6 … last 6 characters.
    const wallets = [
      ["1Etma5ebSYWKdVmfzZNYJ6oPyJ1X1FrjiGvC3UcMLCvYP42", "1Etma5…CvYP42"],
      ["GiaSoAk1jEbMr5jEYxXbQKYhWFY7TmxvepcM5DDmuVRH", "GiaSoA…DmuVRH"],
      [
        "b66a80648e11925a297bcdf30ba3c116dfa38dd5c84a5fd7e87b3352544f8831",
        "b66a80…4f8831",
      ],
    ]
    await openPage(app, screen, "/portfolio/tracked")
    const empty = screen.getByTestId("tracked-wallets-empty")
    await expect(empty).toBeVisible({ timeout: 30_000 })

    const dialog = screen.getByRole("dialog", "Your tracked wallets")
    const add = async (address: string) => {
      await dialog.getByRole("textbox", "Paste address here...").fill(address)
      await dialog.getByRole("button", "Save").tap()
      await expect(dialog).toHaveCount(0)
    }

    // The first one from the empty state, the rest through the manage modal.
    for (const [i, [address, short]] of wallets.entries()) {
      await screen
        .getByRole("button", i === 0 ? "Add address" : "Manage tracked wallets")
        .tap()
      await add(address)
      await screen.getByRole("button", "Manage tracked wallets").tap()
      await expect(
        dialog.getByTestId("tracked-wallet-entry").filter({ hasText: short }),
      ).toBeVisible()
      await dialog.press("Escape")
      await expect(dialog).toHaveCount(0)
    }
    await expect(empty).toHaveCount(0)

    // Remove by identity so sorting changes cannot delete the wrong wallet.
    await screen.getByRole("button", "Manage tracked wallets").tap()
    const remove = dialog.getByRole("button", "Remove")
    await expect(remove).toHaveCount(3)
    for (const [, short] of [...wallets].reverse()) {
      const entry = dialog
        .getByTestId("tracked-wallet-entry")
        .filter({ hasText: short })
      await expect(entry).toBeVisible()
      await entry.getByRole("button", "Remove").tap()
      await expect(entry).toHaveCount(0)
    }
    await expect(remove).toHaveCount(0)
    await dialog.press("Escape")
    await expect(empty).toBeVisible()
  })
})
