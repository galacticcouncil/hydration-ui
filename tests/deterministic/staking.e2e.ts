import { describe, test } from "@e2e-dev/web"
import { expect } from "e2e"

import {
  expectReviewThenClose,
  openPage,
  skipIfBalanceBelow,
} from "../support/app"

describe("staking", { tags: ["staking"] }, () => {
  test("GIGAHDX staking shows APR and enables with an amount", async ({
    app,
    screen,
  }) => {
    await openPage(app, screen, "/staking")
    await expect(screen.getByRole("button", /^Recent APR /)).toBeVisible({
      timeout: 30_000,
    })
    await skipIfBalanceBelow(screen.getByRole("main"), 100)
    const stake = screen.getByRole("button", "Stake as GIGAHDX")
    await expect(stake).toBeDisabled()

    await screen.getByRole("main").getByRole("textbox").fill("100")
    await expect(stake).toBeEnabled({ timeout: 15_000 })
    await stake.tap()
    await expectReviewThenClose(screen, /GigaHdx|gigaHdx|giga_hdx/i)
  })

  test("legacy staking still renders its form", async ({ app, screen }) => {
    await openPage(app, screen, "/staking-old")
    await expect(screen.getByTestId("how-to-stake")).toBeVisible()
    await expect(screen.getByRole("button", "Stake")).toBeDisabled()
  })
})
