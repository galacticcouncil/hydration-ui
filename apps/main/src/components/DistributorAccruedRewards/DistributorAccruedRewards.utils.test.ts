import { interpolationFormat } from "@galacticcouncil/utils/src/helpers/interpolation"
import i18next, { type TFunction } from "i18next"
import { describe, expect, it } from "vitest"

import {
  getAccruedStageParts,
  getAccruedStageText,
} from "@/components/DistributorAccruedRewards/DistributorAccruedRewards.utils"
import common from "@/i18n/locales/en/common.json"

// Only the shared namespace is loaded: the borrow dashboard and the portfolio
// both show these lines, so their strings are in neither one's own.
const i18n = i18next.createInstance()
i18n.init({
  initImmediate: false,
  lng: "en",
  ns: ["common"],
  defaultNS: "common",
  resources: { en: { common } },
  interpolation: { format: interpolationFormat, escapeValue: false },
})

// the real strings, through the formatters the app registers
const t = i18n.getFixedT("en") as unknown as TFunction

// the number formatter separates with non-breaking spaces
const text = (...args: Parameters<typeof getAccruedStageText>) =>
  getAccruedStageText(...args).replaceAll(" ", " ")

// local time, as the date formatter prints it
const AT = new Date(2026, 10, 17, 14, 5)

describe("getAccruedStageText", () => {
  it("names the time a pending root can be claimed from", () => {
    expect(
      text(t, { stage: "pending", amount: "12.5", claimableAt: AT }, "PRIME"),
    ).toBe("12.5 PRIME claimable from about Nov 17, 14:05")
  })

  it("names no time once a pending root only needs accepting", () => {
    expect(
      text(
        t,
        { stage: "pending", amount: "12.5", claimableAt: undefined },
        "PRIME",
      ),
    ).toBe("12.5 PRIME claimable shortly")
  })

  it("names no time for a closed epoch whose root is not posted", () => {
    expect(
      text(
        t,
        { stage: "closed", amount: "0.4", claimableAt: undefined },
        "PRIME",
      ),
    ).toBe("0.4 PRIME earned, not claimable yet")
  })

  it("marks the open epoch's amount and time as estimates", () => {
    expect(
      text(t, { stage: "accruing", amount: "3.2", claimableAt: AT }, "PRIME"),
    ).toBe("≈ 3.2 PRIME accruing, claimable from about Nov 17, 14:05")
  })

  it("marks the open epoch's amount as an estimate when no time is known", () => {
    expect(
      text(
        t,
        { stage: "accruing", amount: "3.2", claimableAt: undefined },
        "PRIME",
      ),
    ).toBe("≈ 3.2 PRIME accruing")
  })

  it("prints the smallest amounts in full", () => {
    expect(
      text(
        t,
        { stage: "accruing", amount: "0.000007", claimableAt: undefined },
        "PRIME",
      ),
    ).toBe("≈ 0.000007 PRIME accruing")
  })
})

const parts = (...args: Parameters<typeof getAccruedStageParts>) => {
  const { amount, when } = getAccruedStageParts(...args)
  return {
    amount: amount.replaceAll("\u00a0", " "),
    when: when?.replaceAll("\u00a0", " "),
  }
}

describe("getAccruedStageParts", () => {
  it("puts a pending root's amount apart from the time it can be claimed from", () => {
    expect(
      parts(t, { stage: "pending", amount: "12.5", claimableAt: AT }, "PRIME"),
    ).toEqual({
      amount: "12.5 PRIME pending",
      when: "claimable from about Nov 17, 14:05",
    })
  })

  it("says a pending root that only needs accepting is claimable shortly", () => {
    expect(
      parts(
        t,
        { stage: "pending", amount: "12.5", claimableAt: undefined },
        "PRIME",
      ),
    ).toEqual({ amount: "12.5 PRIME pending", when: "claimable shortly" })
  })

  it("says a closed epoch whose root is not posted is not claimable yet", () => {
    expect(
      parts(
        t,
        { stage: "closed", amount: "0.4", claimableAt: undefined },
        "PRIME",
      ),
    ).toEqual({ amount: "0.4 PRIME earned", when: "not claimable yet" })
  })

  it("marks the open epoch's amount as an estimate, with its time", () => {
    expect(
      parts(t, { stage: "accruing", amount: "3.2", claimableAt: AT }, "PRIME"),
    ).toEqual({
      amount: "≈ 3.2 PRIME accruing",
      when: "claimable from about Nov 17, 14:05",
    })
  })

  it("gives no time for the open epoch when none is known", () => {
    expect(
      parts(
        t,
        { stage: "accruing", amount: "3.2", claimableAt: undefined },
        "PRIME",
      ),
    ).toEqual({ amount: "≈ 3.2 PRIME accruing", when: undefined })
  })
})
