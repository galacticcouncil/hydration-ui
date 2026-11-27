import { describe, expect, it } from "vitest"

import {
  getXcTwapErrorView,
  XC_TWAP_NO_ERRORS,
} from "@/modules/trade/swap/sections/XcTwap/utils/errors"

describe("getXcTwapErrorView", () => {
  it("shows nothing without errors", () => {
    expect(getXcTwapErrorView([])).toEqual(XC_TWAP_NO_ERRORS)
  })

  it("puts a router rejection on the recipient", () => {
    expect(getXcTwapErrorView(["RecipientRejected"])).toEqual({
      ...XC_TWAP_NO_ERRORS,
      recipient: "recipientRejected",
    })
  })

  it("blocks with the unpriced alert", () => {
    expect(getXcTwapErrorView(["Unpriced"]).alert).toBe("unpriced")
  })

  it("puts an existential-deposit error on the amount", () => {
    expect(getXcTwapErrorView(["BelowExistentialDeposit"]).sellAmount).toBe(
      "belowEd",
    )
  })

  it("prefers the minimum budget when the order is also too small", () => {
    expect(
      getXcTwapErrorView(["BelowExistentialDeposit", "OrderTooSmall"]),
    ).toEqual({ ...XC_TWAP_NO_ERRORS, sellAmount: "minBudget" })
  })

  it.each([
    "MinDeliveryBelowRouteMin",
    "InvalidPeriod",
    "InvalidTranches",
    "WethTwap",
    "InvalidRefundAddress",
  ] as const)("treats %s as a failed estimate", (error) => {
    expect(getXcTwapErrorView([error])).toEqual({
      ...XC_TWAP_NO_ERRORS,
      alert: "estimateFailed",
    })
  })

  it("prefers unpriced over a generic failure", () => {
    expect(getXcTwapErrorView(["InvalidPeriod", "Unpriced"]).alert).toBe(
      "unpriced",
    )
  })

  it("keeps field errors next to an alert", () => {
    expect(getXcTwapErrorView(["RecipientRejected", "Unpriced"])).toEqual({
      ...XC_TWAP_NO_ERRORS,
      recipient: "recipientRejected",
      alert: "unpriced",
    })
  })

  it("turns a thrown estimate into the failed alert only", () => {
    expect(getXcTwapErrorView(["RecipientRejected"], true)).toEqual({
      ...XC_TWAP_NO_ERRORS,
      alert: "estimateFailed",
    })
  })
})
