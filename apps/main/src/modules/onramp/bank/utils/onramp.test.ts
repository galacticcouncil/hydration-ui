import { describe, expect, it } from "vitest"

import {
  FIXTURE_DEPOSIT_HISTORY,
  FIXTURE_ONRAMP_VIEWS,
} from "@/modules/onramp/bank/config/fixtures"
import {
  depositsResponseSchema,
  onrampAccountsResponseSchema,
} from "@/modules/onramp/bank/config/schemas"
import { HbrApiError } from "@/modules/onramp/bank/utils/hbrErrors"
import {
  canRequestOnrampAccount,
  canRetryOnrampAccount,
  formatUsdcBaseUnits,
  getDepositAmountLine,
  getDepositDetailKey,
  getOnrampHeader,
  getOnrampPollInterval,
  getVisibleInstructions,
  ONRAMP_POLL_MS,
} from "@/modules/onramp/bank/utils/onramp"

const read = (
  usd: object,
  eur: object = FIXTURE_ONRAMP_VIEWS.notRequested("eur"),
) => onrampAccountsResponseSchema.parse({ accounts: [usd, eur] })

describe("deposit instructions visibility (rule 5)", () => {
  it("shown for a ready view, with its minimum", () => {
    const visible = getVisibleInstructions(
      { data: read(FIXTURE_ONRAMP_VIEWS.ready("usd")), error: null },
      "usd",
    )
    expect(visible?.instructions).toMatchObject({
      routingNumber: "<placeholder>",
    })
    expect(visible?.minimumDeposit).toBe("1000000")
  })

  it("removed at once when a later read has another status", () => {
    expect(
      getVisibleInstructions(
        { data: read(FIXTURE_ONRAMP_VIEWS.preparing("usd")), error: null },
        "usd",
      ),
    ).toBeNull()
  })

  it("hidden for a view that is not ready even if it carried instructions", () => {
    // The schema already drops them; this checks the display rule on its own.
    const ready = read(FIXTURE_ONRAMP_VIEWS.ready("usd"))
    const data = {
      accounts: ready.accounts.map((a) => ({
        ...a,
        status: "checking" as const,
      })),
    }
    expect(getVisibleInstructions({ data, error: null }, "usd")).toBeNull()
  })

  it("removed when the latest read failed, even with ready data kept", () => {
    expect(
      getVisibleInstructions(
        {
          data: read(FIXTURE_ONRAMP_VIEWS.ready("usd")),
          error: new HbrApiError(429, "rate_limited"),
        },
        "usd",
      ),
    ).toBeNull()
  })

  it("two views of one currency (malformed) show nothing", () => {
    const ready = read(FIXTURE_ONRAMP_VIEWS.ready("usd"))
    const usd = ready.accounts[0]
    const data = { accounts: usd ? [usd, usd] : [] }
    expect(getVisibleInstructions({ data, error: null }, "usd")).toBeNull()
  })

  it("never shows one currency's details for the other", () => {
    expect(
      getVisibleInstructions(
        { data: read(FIXTURE_ONRAMP_VIEWS.ready("usd")), error: null },
        "eur",
      ),
    ).toBeNull()
  })
})

describe("re-arm gate (rule 6): retryAllowed alone", () => {
  const view = (status: string, retryAllowed: boolean) =>
    read({
      ...FIXTURE_ONRAMP_VIEWS.preparing("usd"),
      status,
      retryAllowed,
    }).accounts[0] ?? null

  it.each([
    ["refused", true, true],
    ["refused", false, false],
    ["preparing", true, true],
    ["needs_attention", false, false],
    ["some_future_status", true, true],
    ["ready_but_unknown", false, false],
  ])("%s with retryAllowed %s -> %s", (status, allowed, expected) => {
    expect(canRetryOnrampAccount(view(status, allowed))).toBe(expected)
  })

  it("the request action is only for an account never requested", () => {
    expect(canRequestOnrampAccount(view("not_requested", false))).toBe(true)
    expect(canRequestOnrampAccount(view("brand_new", false))).toBe(false)
  })
})

describe("deposit history", () => {
  it("formats USDC base units exactly", () => {
    expect(formatUsdcBaseUnits("60000000")).toBe("60")
    expect(formatUsdcBaseUnits("500000")).toBe("0.5")
    expect(formatUsdcBaseUnits("1")).toBe("0.000001")
    expect(formatUsdcBaseUnits("0")).toBe("0")
    expect(formatUsdcBaseUnits("123456789012345678901")).toBe(
      "123456789012345.678901",
    )
    expect(formatUsdcBaseUnits("1e6")).toBeNull()
  })

  it("a EUR deposit shows no EUR amount; a USD one shows its amount", () => {
    const { deposits } = depositsResponseSchema.parse(FIXTURE_DEPOSIT_HISTORY)
    const eur = deposits.find((d) => d.currency === "eur")
    const usd = deposits.find((d) => d.currency === "usd")
    expect(eur && getDepositAmountLine(eur)).toBeNull()
    expect(usd && getDepositAmountLine(usd)?.amount).toBe(usd?.amount)
  })

  it("'received by Bridge' only with Bridge's receivedAt (fixture f5, funds_scheduled)", () => {
    const { deposits } = depositsResponseSchema.parse(FIXTURE_DEPOSIT_HISTORY)
    const f5 = deposits.find((d) => d.detail === "funds_scheduled")
    const f4 = deposits.find((d) => d.status === "received_by_bridge")
    expect(f5?.receivedAt).toBeNull()
    expect(f5 && getDepositAmountLine(f5)).toEqual({
      amount: "20.00",
      received: false,
    })
    expect(f4 && getDepositAmountLine(f4)?.received).toBe(true)
  })

  it("an unknown detail code gets the generic copy", () => {
    expect(getDepositDetailKey("below_flush_minimum")).toBe(
      "below_flush_minimum",
    )
    expect(getDepositDetailKey("something_new")).toBe("other")
    expect(getDepositDetailKey(null)).toBeNull()
  })

  it("every fixture deposit parses, with the 5.3 labels", () => {
    const { deposits, unattributed } = depositsResponseSchema.parse(
      FIXTURE_DEPOSIT_HISTORY,
    )
    expect(deposits.map((d) => d.status)).not.toContain("unknown")
    expect(unattributed).toHaveLength(1)
  })
})

describe("on-ramp polling and the 429 backoff", () => {
  const accounts = (usd: object) => read(usd)

  it("polls every 12 s while an account is preparing, 20 s otherwise", () => {
    expect(
      getOnrampPollInterval(
        accounts(FIXTURE_ONRAMP_VIEWS.preparing("usd")),
        null,
      ),
    ).toBe(12_000)
    expect(
      getOnrampPollInterval(accounts(FIXTURE_ONRAMP_VIEWS.ready("usd")), null),
    ).toBe(20_000)
    expect(getOnrampPollInterval(undefined, null)).toBe(20_000)
  })

  it("after a 429 the next poll waits a whole window, preparing or not", () => {
    const limited = new HbrApiError(429, "rate_limited")
    expect(
      getOnrampPollInterval(
        accounts(FIXTURE_ONRAMP_VIEWS.preparing("usd")),
        limited,
      ),
    ).toBe(60_000)
  })

  it("the preparing interval plus the one re-read after a request fits 6 a minute", () => {
    expect(
      Math.ceil(60_000 / ONRAMP_POLL_MS.preparing) + 1,
    ).toBeLessThanOrEqual(6)
  })

  it("a 429 is a backoff in the header, never a failure", () => {
    const limited = new HbrApiError(429, "rate_limited")
    expect(
      getOnrampHeader(
        {
          data: accounts(FIXTURE_ONRAMP_VIEWS.preparing("usd")),
          error: limited,
        },
        "usd",
      ),
    ).toMatchObject({ kind: "status", view: { status: "preparing" } })
    expect(
      getOnrampHeader(
        { data: accounts(FIXTURE_ONRAMP_VIEWS.ready("usd")), error: limited },
        "usd",
      ),
    ).toEqual({ kind: "rechecking" })
    expect(
      getOnrampHeader(
        {
          data: accounts(FIXTURE_ONRAMP_VIEWS.ready("usd")),
          error: new HbrApiError(502, "bridge_unavailable"),
        },
        "usd",
      ),
    ).toEqual({ kind: "failed" })
  })
})
