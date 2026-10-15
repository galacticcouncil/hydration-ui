import { describe, test } from "@e2e-dev/web"
import { expect } from "e2e"

import { expectDataRows, openPage, PAGE_LOAD_TIMEOUT } from "../support/app"
import {
  expectCrossChainReady,
  expectCrossChainRoute,
} from "../support/readiness"

describe("cross-chain", { tags: ["cross-chain"] }, () => {
  test("defaults to DOT from AssetHub to Hydration", async ({
    app,
    screen,
    browser,
  }) => {
    await openPage(app, screen, "/cross-chain")
    await expectCrossChainReady(screen)
    await expectCrossChainRoute(browser)
  })

  test("source chain is read from the URL", async ({
    app,
    screen,
    browser,
  }) => {
    await openPage(
      app,
      screen,
      "/cross-chain?srcChain=hydration&srcAsset=dot&destChain=assethub&destAsset=dot",
    )
    await expectCrossChainReady(screen, "hydration")
    await expectCrossChainRoute(browser, "hydration")
  })

  test("history lists transfers", async ({ app, screen }) => {
    await openPage(app, screen, "/cross-chain/history")
    for (const column of ["Asset", "From", "To", "Status", "Protocol"])
      await expect(screen.getByRole("columnheader", column)).toBeVisible()
    await expectDataRows(screen.getByRole("table"))
  })
})

describe("deposit and withdraw", { tags: ["onramp"] }, () => {
  for (const [path, heading, verb] of [
    ["/deposit", "Deposit from", "Deposit"],
    ["/withdraw", "Withdraw to", "Withdraw"],
  ])
    test(`${path} offers exchange and chain routes`, async ({
      app,
      screen,
      browser,
    }) => {
      await openPage(app, screen, path)
      await expect(screen.getByRole("heading", heading)).toBeVisible()
      await expect(
        screen.getByRole("button", new RegExp(`^Centralized exchange ${verb}`)),
      ).toBeVisible()
      await screen
        .getByRole("button", new RegExp(`^Another chain ${verb}`))
        .tap()
      await expect(browser).toHaveURL(/\/cross-chain(?:\?|$)/, {
        timeout: PAGE_LOAD_TIMEOUT,
      })
      await expectCrossChainReady(screen)
      await expectCrossChainRoute(browser)
      await expect(screen.getByRole("heading", heading)).toHaveCount(0)
    })
})
