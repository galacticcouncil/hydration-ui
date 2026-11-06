import { describe, test } from "@e2e-dev/web"

import {
  expectReviewThenClose,
  openPage,
  skipIfBalanceBelow,
} from "../support/app"

describe("liquidity (agentic)", { tags: ["agentic"] }, () => {
  test("add 1 HOLLAR to the HOLLAR pool up to review", async ({
    app,
    agent,
    screen,
  }) => {
    // HDX and aDOT sit over their Omnipool caps, so they reject new liquidity;
    // HOLLAR (asset 222) has room. Its balance shows only in the add form.
    await openPage(app, screen, "/liquidity/222/add")
    await skipIfBalanceBelow(screen.getByRole("dialog", "Add Liquidity"), 1)

    await openPage(app, screen, "/liquidity")
    await agent.act("add 1 HOLLAR of liquidity to the HOLLAR pool")
    // HOLLAR has 18 decimals.
    await expectReviewThenClose(
      screen,
      /Omnipool\.add_liquidity\w*: \{ asset: 222 amount: "1000000000000000000"/,
    )
  })
})
