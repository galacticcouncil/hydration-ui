import { describe, test } from "@e2e-dev/web"
import { expect } from "e2e"

import { openPage, PAGE_LOAD_TIMEOUT } from "../support/app"
import { expectNavigationPageReady } from "../support/readiness"

describe("navigation", { tags: ["navigation"] }, () => {
  for (const [link, path] of [
    ["Borrow", "/borrow/dashboard"],
    ["Strategies", "/strategies"],
    ["Liquidity", "/liquidity"],
    ["Portfolio", "/portfolio"],
    ["Cross-Chain", "/cross-chain"],
    ["Stats", "/stats/fees"],
    ["Staking", "/staking"],
    ["Trade", "/trade/swap/market"],
  ] as const) {
    test(`${link} navigation loads usable page content`, async ({
      app,
      screen,
      browser,
    }) => {
      // Start elsewhere for Trade so that case also exercises a real navigation.
      const start = link === "Trade" ? "Strategies" : "Trade"
      await openPage(app, screen, link === "Trade" ? "/strategies" : "/")
      await expectNavigationPageReady(screen, start)
      await screen.getByRole("navigation", "Main").getByRole("link", link).tap()
      await expect(browser).toHaveURL(new RegExp(`^[^?]*${path}(?:\\?|$)`), {
        timeout: PAGE_LOAD_TIMEOUT,
      })
      await expectNavigationPageReady(screen, link)
    })
  }
})

describe("stats", { tags: ["stats"] }, () => {
  test("fees switches between revenue and fees", async ({ app, screen }) => {
    await openPage(app, screen, "/stats/fees")
    await expectNavigationPageReady(screen, "Stats")
    await expect(screen.getByRole("radio", "Revenue")).toBeChecked()
    await expect(screen.getByRole("button", /^Borrow APR \$/)).toBeVisible({
      timeout: 30_000,
    })
    await screen.getByRole("radio", "Fees").tap()
    await expect(screen.getByRole("radio", "Fees")).toBeChecked()
    await expectNavigationPageReady(screen, "Stats")
    await screen.getByRole("button", "1Y").tap()
    await expect(screen.getByRole("button", "1Y")).toHaveAttribute(
      "aria-pressed",
      "true",
    )
    await expectNavigationPageReady(screen, "Stats")
  })
})
