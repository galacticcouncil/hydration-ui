import { describe, test } from "@e2e-dev/web"

import { expectReviewThenClose, openPage } from "../support/app"

describe("staking (agentic)", { tags: ["agentic"] }, () => {
  test("stake 100 HDX as GIGAHDX up to review", async ({
    app,
    agent,
    screen,
  }) => {
    await openPage(app, screen, "/staking")
    await agent.act("enter 100 HDX and press Stake as GIGAHDX")
    await expectReviewThenClose(screen, /GigaHdx|gigaHdx|giga_hdx/i)
  })
})
