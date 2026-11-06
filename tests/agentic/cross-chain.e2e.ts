import { describe, test } from "@e2e-dev/web"

import {
  ACCOUNT,
  expectReviewThenClose,
  openPage,
  skipIfBalanceBelow,
} from "../support/app"
import { expectCrossChainReady } from "../support/readiness"

describe("cross-chain (agentic)", { tags: ["agentic"] }, () => {
  test("send 1 DOT from Hydration to AssetHub up to review", async ({
    app,
    agent,
    screen,
  }) => {
    await openPage(
      app,
      screen,
      "/cross-chain?srcChain=hydration&srcAsset=dot&destChain=assethub&destAsset=dot",
    )
    await expectCrossChainReady(screen, "hydration")
    await skipIfBalanceBelow(screen.getByTestId("xcm-source"), 1)
    // The form starts without a recipient; the agent has to pick one.
    await agent.act("send 1 DOT to the recipient {recipient}", {
      params: { recipient: ACCOUNT },
    })
    // 1 DOT is 10^10 planck; parachain 1000 is AssetHub; the beneficiary is
    // the account's public key (shown truncated).
    await expectReviewThenClose(
      screen,
      /PolkadotXcm\.transfer_assets\w*: .*Parachain: 1000 .*Fungible: "10000000000" .*AccountId32: \{ id: "0x5c4464cb3a63c97b065d8576533a3b6c14f9fc52/,
    )
  })
})
