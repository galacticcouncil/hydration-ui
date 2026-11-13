import { describe, expect, it, vi } from "vitest"

vi.mock("@galacticcouncil/web3-connect", () => ({
  isEthereumSigner: () => true,
}))

import {
  buildFixtureQuote,
  FIXTURE_QUOTE,
} from "@/modules/onramp/bank/config/fixtures"
import { RAMP_STATUSES } from "@/modules/onramp/bank/config/schemas"
import {
  classifyCashOutError,
  getCashOutAccounts,
  getLitStages,
  getLocalSendView,
  getPayoutLimitView,
  reportRedeemHash,
  showsLocalChecking,
} from "@/modules/onramp/bank/utils/cashOut"
import { buildCashOutTransaction } from "@/modules/onramp/bank/utils/cashOutTransaction"
import {
  HbrApiError,
  HbrNetworkError,
  HbrTimeoutError,
} from "@/modules/onramp/bank/utils/hbrErrors"
import type { HbrService } from "@/modules/onramp/bank/utils/hbrService"

const A = "0x00000000000000000000000000000000000000a1"
const tx = (data: string) => ({
  chainId: 222222,
  from: A,
  to: "0x00000000000000000000000000000000000000b2",
  data,
  value: "0x0",
})

describe("build and quote refusals", () => {
  it("503 ramp_build_unavailable is permanent: not available", () => {
    expect(
      classifyCashOutError(
        new HbrApiError(503, "ramp_build_unavailable"),
        "build",
      ),
    ).toEqual({ kind: "notAvailable" })
    expect(
      classifyCashOutError(
        new HbrApiError(503, "ramp_build_unavailable"),
        "quote",
      ),
    ).toEqual({ kind: "notAvailable" })
  })
  it("409 ramp_pending names the ramp and its validUntil", () => {
    const e = new HbrApiError(409, "ramp_pending", {
      error: "ramp_pending",
      ramp: { id: "r1" },
      validUntil: "2026-10-22T12:30:00.000Z",
    })
    expect(classifyCashOutError(e, "build")).toEqual({
      kind: "pending",
      rampId: "r1",
      validUntil: "2026-10-22T12:30:00.000Z",
    })
  })
  it("rampRecorded unknown, or a build with no answer, is never 'nothing recorded'", () => {
    for (const e of [
      new HbrApiError(503, "ramp_record_failed", { rampRecorded: "unknown" }),
      new HbrApiError(500, "internal", { rampRecorded: "unknown" }),
      new HbrNetworkError(),
      new HbrTimeoutError(60_000),
    ])
      expect(classifyCashOutError(e, "build")).toEqual({
        kind: "recordUnknown",
      })
  })
  it("codes the user can act on get their own copy; other 503s could not prepare", () => {
    expect(
      classifyCashOutError(new HbrApiError(422, "below_floor"), "quote").kind,
    ).toBe("below_floor")
    expect(
      classifyCashOutError(new HbrApiError(409, "la_inactive"), "build").kind,
    ).toBe("account")
    expect(
      classifyCashOutError(new HbrApiError(409, "psm_redeem_paused"), "build")
        .kind,
    ).toBe("paused")
    expect(
      classifyCashOutError(new HbrApiError(503, "psm_read_failed"), "build")
        .kind,
    ).toBe("couldNotPrepare")
    expect(
      classifyCashOutError(new HbrApiError(429, "rate_limited"), "build").kind,
    ).toBe("rateLimited")
    expect(
      classifyCashOutError(new HbrApiError(418, "brand_new"), "build").kind,
    ).toBe("unknown")
  })
})

describe("what the screen says", () => {
  it("payout limit: false promises nothing; minRefillSeconds is a lower bound", () => {
    expect(
      getPayoutLimitView({ refillNeeded: false, minRefillSeconds: "600" }),
    ).toEqual({ kind: "none" })
    expect(
      getPayoutLimitView({ refillNeeded: true, minRefillSeconds: null }),
    ).toEqual({ kind: "wait", minMinutes: null })
    expect(
      getPayoutLimitView({ refillNeeded: true, minRefillSeconds: "61" }),
    ).toEqual({ kind: "wait", minMinutes: 2 })
  })
  it("timeline: every ramp status is staged or off-timeline; only paid lights Paid", () => {
    for (const status of RAMP_STATUSES) {
      const lit = getLitStages(status)
      expect(lit).toBeGreaterThanOrEqual(0)
      expect(lit === 5).toBe(status === "paid")
    }
    expect(getLitStages("built")).toBe(1)
    expect(getLitStages("unknown")).toBe(0)
    expect(getLitStages("constructor")).toBe(0)
    expect(getLitStages("redeem_reverted")).toBe(0)
  })
  it("cash-out accounts: active with a known currency only", () => {
    const base = {
      externalAccountId: "e",
      accountType: null,
      last4: null,
      bankName: null,
    }
    expect(
      getCashOutAccounts([
        { ...base, id: "1", status: "active", currency: "usd" },
        { ...base, id: "2", status: "inactive", currency: "usd" },
        { ...base, id: "3", status: "unknown", currency: "eur" },
        { ...base, id: "4", status: "active", currency: "unknown" },
      ]).map((a) => a.id),
    ).toEqual(["1"])
  })
})

describe("local send state (rule 11)", () => {
  it("the redeem at the wallet with any outcome but a decline reads checking", () => {
    for (const s of [
      "claimed",
      "prompted",
      "failed",
      "sent",
      "succeeded",
      "reverted",
      "unknown",
    ] as const)
      expect(getLocalSendView("succeeded", s, true)).toBe("checking")
    expect(getLocalSendView("succeeded", "rejected", true)).toBe("declined")
    expect(getLocalSendView("succeeded", "refused", true)).toBe("notSent")
  })
  it("a redeem never presented is not sent; only an OBSERVED approve revert says it reverted", () => {
    expect(getLocalSendView(undefined, undefined, false)).toBe("none")
    expect(getLocalSendView(undefined, undefined, true)).toBe("notSent")
    expect(getLocalSendView("reverted", undefined, true)).toBe(
      "approvalReverted",
    )
    for (const s of [
      "claimed",
      "prompted",
      "failed",
      "sent",
      "unknown",
    ] as const)
      expect(getLocalSendView(s, undefined, true)).toBe("approvalChecking")
    expect(getLocalSendView("rejected", undefined, true)).toBe("declined")
  })

  it("the local label replaces built only", () => {
    expect(showsLocalChecking({ status: "built" }, "checking")).toBe(true)
    expect(showsLocalChecking({ status: "submitted" }, "checking")).toBe(false)
    expect(showsLocalChecking({ status: "built" }, "declined")).toBe(false)
  })
})

describe("the createTransaction input", () => {
  const prepared = {
    rampId: "r1",
    validUntil: "2026-10-22T12:30:00.000Z",
    approveTx: tx("0x095ea7b3"),
    redeemTx: tx("0xabcdef01"),
  }
  const copy = {
    approveStep: "a",
    redeemStep: "r",
    approveTitle: "a",
    redeemTitle: "r",
    toasts: { submitted: "s", success: "s" },
  }
  it("approve then redeem; only the redeem reports its hash and waits for the approve", () => {
    const onRedeemHash = vi.fn()
    const input = buildCashOutTransaction({
      prepared,
      sessionAddress: A,
      onRedeemHash,
      copy,
    })
    const steps = input.tx as { strictEvm: Record<string, unknown> }[]
    expect(steps).toHaveLength(2)
    expect(steps[0]!.strictEvm.prepared).toBe(prepared.approveTx)
    expect(steps[0]!.strictEvm.onHash).toBeUndefined()
    expect(steps[1]!.strictEvm.prepared).toBe(prepared.redeemTx)
    expect(steps[1]!.strictEvm.after).toBe(prepared.approveTx)
    expect(steps[1]!.strictEvm.onHash).toBe(onRedeemHash)
    expect(steps[1]!.strictEvm.notAfter).toBe(Date.parse(prepared.validUntil))
    expect(steps.every((s) => s.strictEvm.sessionAddress === A)).toBe(true)
  })
  it("no approve: the redeem alone, with no sequencing requirement", () => {
    const input = buildCashOutTransaction({
      prepared: { ...prepared, approveTx: null },
      sessionAddress: A,
      onRedeemHash: vi.fn(),
      copy,
    })
    const steps = input.tx as { strictEvm: Record<string, unknown> }[]
    expect(steps).toHaveLength(1)
    expect(steps[0]!.strictEvm.after).toBeNull()
  })
})

describe("report of the redeem hash", () => {
  const service = (answers: (() => Promise<unknown>)[]) => {
    const reportRamp = vi.fn(() => answers.shift()!())
    return {
      reportRamp,
      service: { forWallet: () => ({ reportRamp }) } as unknown as HbrService,
    }
  }
  const sleep = vi.fn(async () => undefined)
  it("repeats the SAME hash after no answer, a 5xx or a 429, a bounded number of times", async () => {
    const { service: s, reportRamp } = service([
      () => Promise.reject(new HbrNetworkError()),
      () => Promise.reject(new HbrApiError(429, "rate_limited")),
      () => Promise.resolve({}),
    ])
    await expect(
      reportRedeemHash({
        service: s,
        h160: A,
        rampId: "r1",
        txHash: "0xh",
        sleep,
      }),
    ).resolves.toBe("reported")
    expect(reportRamp.mock.calls).toEqual([
      ["r1", "0xh"],
      ["r1", "0xh"],
      ["r1", "0xh"],
    ])
    const { service: s2, reportRamp: r2 } = service([
      () => Promise.reject(new HbrApiError(503, "x")),
      () => Promise.reject(new HbrApiError(503, "x")),
      () => Promise.reject(new HbrApiError(503, "x")),
      () => Promise.resolve({}),
    ])
    await expect(
      reportRedeemHash({
        service: s2,
        h160: A,
        rampId: "r1",
        txHash: "0xh",
        sleep,
      }),
    ).resolves.toBe("notReported")
    expect(r2).toHaveBeenCalledTimes(3)
  })
  it("a 409 report_conflict is final", async () => {
    const { service: s, reportRamp } = service([
      () => Promise.reject(new HbrApiError(409, "report_conflict")),
    ])
    await expect(
      reportRedeemHash({
        service: s,
        h160: A,
        rampId: "r1",
        txHash: "0xh",
        sleep,
      }),
    ).resolves.toBe("refused")
    expect(reportRamp).toHaveBeenCalledTimes(1)
  })
})

// The fixture build refusal (503 ramp_build_unavailable) is pinned in hbrService.test.ts.
describe("fixtures (testnet): quote from the server's formula", () => {
  it("the doc example comes out of the formula; below the floor is refused", () => {
    expect(buildFixtureQuote("25.5")).toEqual(FIXTURE_QUOTE)
    expect(buildFixtureQuote("2")).toBeNull()
  })
})
