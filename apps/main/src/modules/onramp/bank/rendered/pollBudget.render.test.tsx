// @vitest-environment jsdom
/* On-ramp polling on the real BankFlow tree, against a fake server that runs a
 * port of the HBR rate limiter (advisor-b30-budget appendix). Rule 5 oracle:
 * whenever instructions are on screen, the last answer the server gave to
 * GET /v1/onramp/accounts was a 200 with usd `ready`. No count bound is
 * asserted: the server is the only limiter. */
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query"
import { act, cleanup, fireEvent, render } from "@testing-library/react"
import { useSyncExternalStore } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

// ---- wallet mock -------------------------------------------------------
type Acc = { rawAddress: string; address: string } | null
const walletState: {
  account: Acc
  signer: unknown
  listeners: Set<() => void>
} = {
  account: null,
  signer: null,
  listeners: new Set(),
}
let snapshot = { account: walletState.account, signer: walletState.signer }
const emit = () => {
  snapshot = { account: walletState.account, signer: walletState.signer }
  walletState.listeners.forEach((l) => l())
}
const subscribe = (l: () => void) => {
  walletState.listeners.add(l)
  return () => walletState.listeners.delete(l)
}
class FakeEthSigner {
  __eth = true
  constructor(public address: string) {}
  signMessage() {
    return new Promise<string>(() => {})
  }
}
vi.mock("@galacticcouncil/web3-connect", () => ({
  useAccount: () => ({
    account: useSyncExternalStore(subscribe, () => snapshot).account,
  }),
  useWallet: () => ({
    signer: useSyncExternalStore(subscribe, () => snapshot).signer,
  }),
  isEthereumSigner: (s: unknown) =>
    !!s && (s as { __eth?: boolean }).__eth === true,
  getEip1193ErrorCode: () => null,
  EIP1193_USER_REJECTED: 4001,
  useWeb3ConnectModal: () => ({ toggle: () => {} }),
  WalletMode: { EVM: "evm" },
}))
vi.mock("@galacticcouncil/ui/components", () => import("./uiKitStub"))
vi.mock(
  "@galacticcouncil/ui/assets/icons",
  // any icon name is a null component; "then" stays unset so the module is not a thenable
  () =>
    new Proxy(
      {},
      {
        get: (_t, key) => (key === "then" ? undefined : () => null),
        has: (_t, key) => key !== "then",
      },
    ),
)
vi.mock("@galacticcouncil/ui/utils", () => ({
  getToken: () => "",
  pxToRem: (px: number) => `${px / 16}rem`,
}))
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (k: string, o?: unknown) => (o ? `${k} ${JSON.stringify(o)}` : k),
  }),
  initReactI18next: { type: "3rdParty", init: () => {} },
}))
vi.mock("@/i18n", () => ({ default: { t: (k: string) => k } }))
vi.mock("@/config/env", () => ({
  ENV: { VITE_HBR_API_URL: "https://hbr.test" },
}))

import { BankFlow } from "@/modules/onramp/bank/components/BankFlow"
import { buildFixtureOnboarding } from "@/modules/onramp/bank/config/fixtures"
import { useHbrSessionStore } from "@/modules/onramp/bank/store/useHbrSessionStore"
import { HBR_READ_TIMEOUT_MS } from "@/modules/onramp/bank/utils/hbrService"
import { ONRAMP_POLL_MS } from "@/modules/onramp/bank/utils/onramp"
import { hbrQueryKeys } from "@/modules/onramp/bank/utils/queryKeys"
import { logMutationError, logQueryError } from "@/utils/queryErrorLog"

const A = "0x1111111111111111111111111111111111111111"
const B = "0x2222222222222222222222222222222222222222"
const TOKEN = { [A]: "a".repeat(43), [B]: "b".repeat(43) } as Record<
  string,
  string
>
const walletOfToken = (t: string | null) =>
  Object.keys(TOKEN).find((w) => TOKEN[w] === t) ?? null

const view = (
  currency: string,
  status: string,
  extra: Record<string, unknown> = {},
) => ({
  currency,
  status,
  onrampAvailable: false,
  retryAllowed: false,
  ...extra,
})
const usdReady = () => ({
  currency: "usd",
  status: "ready",
  onrampAvailable: true,
  retryAllowed: false,
  instructions: {
    accountNumber: "ACCT-A1",
    routingNumber: "ROUT-A1",
    bankName: "BANK-A1",
    beneficiaryName: "BENE-A1",
    paymentRails: ["ach_push"],
  },
  minimumDeposit: "1000000",
})

const json = (status: number, body: unknown) =>
  new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  })

// Port of hydration-ramp server/lib/http/apiMiddleware.mjs createRateLimiter
// (one key): a fixed window from the first hit after the last window ended; a
// refused hit is not counted.
const mkLimiter = (limit: number, windowMs: number) => {
  let w: { start: number; count: number } | undefined
  return {
    hit: () => {
      const t = Date.now()
      if (w && t - w.start < windowMs && t >= w.start) {
        if (w.count >= limit) return false
        w.count++
        return true
      }
      w = { start: t, count: 1 }
      return true
    },
  }
}

// Fake server state. A request moves USD to preparing and EUR to refused
// (re-arm allowed); a re-arm moves a refused account to preparing.
const st: Record<string, { status: string; retryAllowed: boolean }> = {}
let lim = {
  list: mkLimiter(6, 60_000),
  request: mkLimiter(5, 600_000),
  retry: mkLimiter(3, 3_600_000),
}
// Scripted status of the n-th GET (1-based), before the normal answer.
let scripted: Record<number, number> = {}
let gets = 0
let limited = 0
let last: { status: number; usdReady: boolean } | null = null
let t0 = 0

// GETs after this many answers never settle (a hung read); 0 = off.
let hangAfter = 0

const answerGet = (): Response | Promise<Response> => {
  if (hangAfter && gets >= hangAfter) {
    gets += 1
    return new Promise<Response>(() => {})
  }
  gets += 1
  if (!lim.list.hit()) {
    limited += 1
    last = { status: 429, usdReady: false }
    return json(429, { error: "rate_limited" })
  }
  const forced = scripted[gets]
  if (forced) {
    last = { status: forced, usdReady: false }
    return json(forced, {
      error: forced === 429 ? "rate_limited" : "bridge_unavailable",
    })
  }
  const accounts = (["usd", "eur"] as const).map((c) =>
    c === "usd" && st.usd!.status === "ready"
      ? usdReady()
      : view(c, st[c]!.status, {
          retryAllowed: st[c]!.retryAllowed,
          reason: null,
        }),
  )
  last = { status: 200, usdReady: st.usd!.status === "ready" }
  return json(200, { accounts })
}

const fakeFetch = async (url: string, init: RequestInit) => {
  const path = url.replace("https://hbr.test", "")
  const method = init.method ?? "GET"
  const auth = (init.headers as Record<string, string>)?.Authorization
  const wallet = walletOfToken(auth ? auth.replace(/^Bearer /, "") : null)
  if (!wallet) return json(401, { error: "unauthorized" })
  const body = init.body ? JSON.parse(init.body as string) : undefined
  const retry = path.match(/^\/v1\/onramp\/accounts\/(usd|eur)\/retry$/)
  if (method === "POST" && retry) {
    if (!lim.retry.hit()) return json(429, { error: "rate_limited" })
    const c = retry[1]!
    st[c] = { status: "preparing", retryAllowed: false }
    return json(202, { account: view(c, "preparing") })
  }
  switch (`${method} ${path}`) {
    case "GET /v1/me":
      return json(200, {
        h160: wallet,
        customer: { id: "00000000-0000-4000-8000-000000000001" },
      })
    case "GET /v1/customers/me/onboarding":
      return json(
        200,
        buildFixtureOnboarding({
          type: "individual",
          bound: true,
          status: "active",
          gate: "ok",
        }),
      )
    case "GET /v1/onramp/deposits":
      return json(200, { deposits: [], unattributed: [] })
    case "GET /v1/onramp/accounts":
      return answerGet()
    case "POST /v1/onramp/accounts": {
      if (!lim.request.hit()) return json(429, { error: "rate_limited" })
      const c = body.currency as string
      st[c] =
        c === "eur"
          ? { status: "refused", retryAllowed: true }
          : { status: "preparing", retryAllowed: false }
      return json(202, { account: view(c, st[c]!.status) })
    }
    default:
      return json(404, { error: "not_found" })
  }
}

let queryClient: QueryClient
let settles = 0
const setWallet = (w: string | null) => {
  walletState.account = w ? { rawAddress: w, address: w } : null
  walletState.signer = w ? new FakeEthSigner(w) : null
  emit()
}
const page = () => document.body.innerHTML
const shown = () => page().includes("ACCT-A1")
const app = () => (
  <QueryClientProvider client={queryClient}>
    <BankFlow direction="deposit" />
  </QueryClientProvider>
)

// The rule 5 oracle, sampled after every 250 ms step: instructions on screen
// while the last GET answer was not a 200 with usd ready, for more than two
// steps in a row (the body and the render can land one step apart).
let badRun = 0
let violations: number[] = []
const check = () => {
  const bad = shown() && !(last && last.status === 200 && last.usdReady)
  badRun = bad ? badRun + 1 : 0
  if (badRun >= 3) violations.push(Date.now() - t0)
}
// Fake time only: no real waiting.
const tick = async (ms: number) => {
  for (let i = 0; i < ms / 250; i++) {
    await act(async () => {
      await vi.advanceTimersByTimeAsync(250)
    })
    check()
  }
}
const stepUntil = async (done: () => boolean, maxMs: number) => {
  let waited = 0
  while (!done() && waited < maxMs) {
    await tick(250)
    waited += 250
  }
  return waited
}
const reread = () =>
  act(async () => {
    void queryClient.invalidateQueries({
      queryKey: hbrQueryKeys.onrampAccounts(A),
    })
  })
const clickStart = (text: string) =>
  act(async () => {
    const b = Array.from(document.querySelectorAll("button")).find(
      (x) => x.textContent?.startsWith(text) && !x.disabled,
    )
    if (b) fireEvent.click(b)
  })
const pickCurrency = (c: "usd" | "eur") =>
  act(async () => {
    fireEvent.click(document.querySelector(`[data-toggle-item="${c}"]`)!)
  })
// No failure title and no error alert (the instructions' info notice is an
// alert too, so only error copy counts).
const noFailureShown = () => {
  expect(page()).not.toContain("bank.deposit.readFailed")
  const alerts = Array.from(document.querySelectorAll("[data-alert]")).map(
    (a) => a.textContent ?? "",
  )
  expect(alerts.filter((a) => a.startsWith("bank.error."))).toEqual([])
}

beforeEach(() => {
  vi.useFakeTimers({
    toFake: [
      "setTimeout",
      "clearTimeout",
      "setInterval",
      "clearInterval",
      "Date",
    ],
  })
  t0 = Date.now()
  st.usd = { status: "not_requested", retryAllowed: false }
  st.eur = { status: "not_requested", retryAllowed: false }
  lim = {
    list: mkLimiter(6, 60_000),
    request: mkLimiter(5, 600_000),
    retry: mkLimiter(3, 3_600_000),
  }
  scripted = {}
  hangAfter = 0
  gets = 0
  limited = 0
  last = null
  settles = 0
  badRun = 0
  violations = []
  vi.stubGlobal("fetch", vi.fn(fakeFetch))
  queryClient = new QueryClient({
    queryCache: new QueryCache({ onError: logQueryError }),
    mutationCache: new MutationCache({ onError: logMutationError }),
  })
  // Count every settled read of the on-ramp accounts query.
  queryClient.getQueryCache().subscribe((event) => {
    if (
      event.type === "updated" &&
      (event.action.type === "success" || event.action.type === "error") &&
      event.query.queryKey[2] === "onramp-accounts"
    )
      settles += 1
  })
  vi.spyOn(console, "error").mockImplementation(() => {})
  useHbrSessionStore.getState().clear()
  useHbrSessionStore.getState().setSession({
    token: TOKEN[A]!,
    h160: A,
    expiresAt: "2099-01-01T00:00:00.000Z",
  })
})
afterEach(() => {
  cleanup()
  queryClient.clear()
  vi.useRealTimers()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe("rule 5 under polling, re-reads and 429s (no client limiter)", () => {
  it.each([502, 429])(
    "P3 after a %s read, no trigger shows the earlier instructions until a read answers ready",
    async (code) => {
      st.usd = { status: "ready", retryAllowed: false }
      scripted = { 6: code }
      setWallet(A)
      render(app())
      await tick(1000)
      expect(shown()).toBe(true)
      for (let i = 0; i < 5; i++) {
        await reread()
        await tick(500)
      }
      await reread()
      await tick(500)
      await tick(70_000)
      expect(violations).toEqual([])
      expect(gets).toBe(settles)
    },
  )

  it("P4 after 5 quick re-reads the server leaves ready: instructions are gone within 20 s", async () => {
    st.usd = { status: "ready", retryAllowed: false }
    setWallet(A)
    render(app())
    await tick(1000)
    for (let i = 0; i < 5; i++) {
      await reread()
      await tick(250)
    }
    expect(shown()).toBe(true)
    st.usd = { status: "checking", retryAllowed: false }
    const waited = await stepUntil(() => !shown(), 70_000)
    expect(waited).toBeLessThanOrEqual(20_250)
    expect(violations).toEqual([])
    expect(gets).toBe(settles)
  })

  it("P6 USD at 3 s, EUR at 18 s: the server refuses no read and ready shows within 15 s of the server reading ready", async () => {
    setWallet(A)
    render(app())
    await tick(3000)
    await clickStart("bank.deposit.request")
    await tick(14_000)
    await pickCurrency("eur")
    await tick(1000)
    await clickStart("bank.deposit.request")
    await pickCurrency("usd")
    await tick(58_000 - (Date.now() - t0))
    st.usd = { status: "ready", retryAllowed: false }
    const waited = await stepUntil(shown, 60_000)
    expect(waited).toBeLessThanOrEqual(15_250)
    expect(limited).toBe(0)
    expect(violations).toEqual([])
    expect(gets).toBe(settles)
  })

  it("P7 stress: requests, a re-arm and tab switches every 2 s for 3 minutes", async () => {
    setWallet(A)
    render(app())
    await tick(1000)
    await clickStart("bank.deposit.request")
    for (let s = 0; s < 180; s += 2) {
      await pickCurrency(s % 4 === 0 ? "eur" : "usd")
      await clickStart("bank.deposit.request")
      await clickStart("bank.deposit.retry")
      await tick(2000)
    }
    expect(violations).toEqual([])
    noFailureShown()
    // Reads continue: the server limits them, the screen never stops reading.
    expect(gets).toBeGreaterThanOrEqual(9)
    expect(gets).toBe(settles)
  })

  it("S5b 8 mounts in 14 s on a ready account: no instructions without a ready answer", async () => {
    st.usd = { status: "ready", retryAllowed: false }
    setWallet(A)
    for (let i = 0; i < 8; i++) {
      const { unmount } = render(app())
      await tick(2000)
      unmount()
      await tick(250)
    }
    render(app())
    await stepUntil(shown, 90_000)
    expect(shown()).toBe(true)
    expect(violations).toEqual([])
    noFailureShown()
  })
})

describe("a hung read (advisor item 8)", () => {
  it("H1 a ready account whose next read never answers hides its instructions within one interval plus the read timeout", async () => {
    st.usd = { status: "ready", retryAllowed: false }
    hangAfter = 1
    setWallet(A)
    render(app())
    await tick(1000)
    expect(shown()).toBe(true)
    const waited = await stepUntil(() => !shown(), 120_000)
    expect(waited).toBeLessThanOrEqual(
      ONRAMP_POLL_MS.settled + HBR_READ_TIMEOUT_MS + 250,
    )
  })
})

describe("a 429 is a backoff, never a failure display", () => {
  it("BUD5 a 429 on the first read (no answer yet) reads 'checking again shortly', no alert", async () => {
    scripted = { 1: 429 }
    setWallet(A)
    render(app())
    await tick(1000)
    expect(page()).toContain("bank.deposit.rechecking")
    noFailureShown()
  })
})
