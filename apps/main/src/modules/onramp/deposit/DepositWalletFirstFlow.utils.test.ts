import { describe, expect, it } from "vitest"

import { OnrampScreen } from "@/modules/onramp/types"

import {
  depositStepAfterAsset,
  depositStepAfterSource,
} from "./DepositWalletFirstFlow.utils"

describe("wallet-first deposit destination", () => {
  it("asks for a destination after choosing an asset in the full flow", () => {
    expect(depositStepAfterAsset("connected")).toBe(
      OnrampScreen.DepositOnchainDestination,
    )
    expect(depositStepAfterAsset("current")).toBe(
      OnrampScreen.DepositOnchainForm,
    )
  })

  it("asks after connecting a source, but preserves an explicit destination on source changes", () => {
    expect(depositStepAfterSource("connected", "")).toBe(
      OnrampScreen.DepositOnchainDestination,
    )
    expect(depositStepAfterSource("connected", "selected-recipient")).toBe(
      OnrampScreen.DepositOnchainForm,
    )
    expect(depositStepAfterSource("current", "")).toBe(
      OnrampScreen.DepositOnchainForm,
    )
  })
})
