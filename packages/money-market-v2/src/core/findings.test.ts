import { describe, expect, it } from "vitest"

import {
  hasAcknowledgement,
  hasBlocker,
  HF_ACKNOWLEDGEMENT_THRESHOLD,
  HF_BLOCKER_THRESHOLD,
  HF_MAX_TARGET,
} from "@/core"
import type { Finding } from "@/types"

type TestCode = "stop" | "accept" | "inform"

const blocker: Finding<TestCode> = { kind: "blocker", code: "stop", params: {} }
const acknowledgement: Finding<TestCode> = {
  kind: "acknowledgement",
  code: "accept",
  params: { percent: 98 },
}
const warning: Finding<TestCode> = {
  kind: "notice",
  tone: "warning",
  code: "inform",
  params: { symbols: ["DOT", "vDOT"] },
}
const info: Finding<TestCode> = {
  kind: "notice",
  tone: "info",
  code: "inform",
  params: { symbol: "PRIME" },
}

describe("hasBlocker", () => {
  it("is false for no findings", () => {
    expect(hasBlocker([])).toBe(false)
  })

  it("is false when there are only notices", () => {
    expect(hasBlocker([warning, info])).toBe(false)
  })

  it("is false for an acknowledgement alone", () => {
    expect(hasBlocker([acknowledgement, info])).toBe(false)
  })

  it("is true when any finding blocks", () => {
    expect(hasBlocker([info, acknowledgement, blocker])).toBe(true)
  })
})

describe("hasAcknowledgement", () => {
  it("is false for no findings", () => {
    expect(hasAcknowledgement([])).toBe(false)
  })

  it("is false when there are only notices", () => {
    expect(hasAcknowledgement([warning, info])).toBe(false)
  })

  it("is false for a blocker alone", () => {
    expect(hasAcknowledgement([blocker, warning])).toBe(false)
  })

  it("is true when any finding asks for acceptance", () => {
    expect(hasAcknowledgement([blocker, warning, acknowledgement])).toBe(true)
  })
})

describe("health factor thresholds", () => {
  it("orders blocker < max target < acknowledgement", () => {
    expect(Number(HF_BLOCKER_THRESHOLD)).toBe(1)
    expect(Number(HF_MAX_TARGET)).toBe(1.01)
    expect(Number(HF_ACKNOWLEDGEMENT_THRESHOLD)).toBe(1.1)
  })
})
