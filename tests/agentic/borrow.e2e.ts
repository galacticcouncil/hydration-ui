import { describe, test } from "@e2e-dev/web"

import { expectReviewThenClose, openPage } from "../support/app"
import { expectNavigationPageReady } from "../support/readiness"

describe("borrow (agentic)", { tags: ["agentic"] }, () => {
  test("supply 1 DOT up to review", async ({ app, agent, screen }) => {
    await openPage(app, screen, "/borrow/dashboard")
    await expectNavigationPageReady(screen, "Borrow")
    // DOT has three rows (supplied, to supply, to borrow); only the one with
    // Supply holds the wallet balance, e.g. "51.1271 $48.00".
    const balance = parseFloat(
      (await screen
        .getByRole("row", /^DOT DOT /)
        .filter({ has: screen.getByRole("button", "Supply") })
        .getByRole("cell")
        .nth(1)
        .textContent()) ?? "",
    )
    test.skip(!(balance >= 1), `DOT balance ${balance} cannot cover 1`)
    await agent.act("supply 1 DOT from Assets to supply")
    // An EVM call to the money market: DOT (asset 5) as an ERC-20 address, 10^10 planck.
    await expectReviewThenClose(
      screen,
      /supply: \{ asset: "0x0+100000005" amount: "10000000000"/,
    )
  })
})
