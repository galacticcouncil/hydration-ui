// @vitest-environment jsdom
/* Ported from the review-2 Delta 2 budget harness (BUD2, BUD5) plus a stress case. Renders the REAL BankFlow tree
 * (direction "deposit") with the REAL hooks, session store, react-query
 * factories and HTTP client. Only the wallet, the UI kit, i18n and fetch are
 * replaced. fetch answers are scripted per test, and can be held (deferred). */
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
vi.mock("@galacticcouncil/ui/assets/icons", () => {
  const I = () => null
  return {
    WalletIcon: I,
    Building2Icon: I,
    UserIcon: I,
    CircleAlertIcon: I,
    ClockIcon: I,
    ShieldCheckIcon: I,
    BadgeCheckIcon: I,
    LandmarkIcon: I,
  }
})
vi.mock("@galacticcouncil/ui/utils", () => ({ getToken: () => "" }))
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
import { onrampReadBudget } from "@/modules/onramp/bank/hooks/hbrQueries"
import { useHbrSessionStore } from "@/modules/onramp/bank/store/useHbrSessionStore"
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

const json = (status: number, body: unknown) =>
  new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  })

// The fake server's account states; a request moves USD to preparing and EUR
// to refused (re-arm allowed), a re-arm moves a refused account to preparing.
const st: Record<string, { status: string; retryAllowed: boolean }> = {}
let firstReadStatus = 200
const reads: number[] = []
let t0 = 0

const fakeFetch = async (url: string, init: RequestInit) => {
  const path = url.replace("https://hbr.test", "")
  const method = init.method ?? "GET"
  const auth = (init.headers as Record<string, string>)?.Authorization
  const wallet = walletOfToken(auth ? auth.replace(/^Bearer /, "") : null)
  if (!wallet) return json(401, { error: "unauthorized" })
  const body = init.body ? JSON.parse(init.body as string) : undefined
  const retry = path.match(/^\/v1\/onramp\/accounts\/(usd|eur)\/retry$/)
  if (method === "POST" && retry) {
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
    case "GET /v1/onramp/accounts": {
      reads.push(Date.now() - t0)
      if (reads.length === 1 && firstReadStatus === 429)
        return json(429, { error: "rate_limited" })
      return json(200, {
        accounts: (["usd", "eur"] as const).map((c) =>
          view(c, st[c]!.status, {
            retryAllowed: st[c]!.retryAllowed,
            reason: null,
          }),
        ),
      })
    }
    case "POST /v1/onramp/accounts": {
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
const setWallet = (w: string | null) => {
  walletState.account = w ? { rawAddress: w, address: w } : null
  walletState.signer = w ? new FakeEthSigner(w) : null
  emit()
}
const page = () => document.body.innerHTML
const app = () => (
  <QueryClientProvider client={queryClient}>
    <BankFlow direction="deposit" />
  </QueryClientProvider>
)
// Fake time only: no real waiting.
const tick = async (ms: number) => {
  for (let i = 0; i < ms / 250; i++)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(250)
    })
}
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
/** The most reads of GET /v1/onramp/accounts in any sliding 60 s window. */
const maxIn60 = () =>
  Math.max(
    0,
    ...reads.map((a) => reads.filter((b) => b >= a && b < a + 60_000).length),
  )

beforeEach(() => {
  onrampReadBudget.reset()
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
  reads.length = 0
  firstReadStatus = 200
  st.usd = { status: "not_requested", retryAllowed: false }
  st.eur = { status: "not_requested", retryAllowed: false }
  vi.stubGlobal("fetch", vi.fn(fakeFetch))
  queryClient = new QueryClient({
    queryCache: new QueryCache({ onError: logQueryError }),
    mutationCache: new MutationCache({ onError: logMutationError }),
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

describe("GET /v1/onramp/accounts stays within 6 reads in any 60 s window", () => {
  it("BUD2 request USD, switch to EUR and request EUR within one minute", async () => {
    setWallet(A)
    render(app())
    await tick(3000)
    await clickStart("bank.deposit.request")
    await tick(14_000)
    await pickCurrency("eur")
    await tick(1000)
    await clickStart("bank.deposit.request")
    await tick(90_000)
    expect(reads.length).toBeGreaterThan(6)
    expect(maxIn60()).toBeLessThanOrEqual(6)
  })

  it("stress: requests, a re-arm and tab switches every 2 s for 3 minutes", async () => {
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
    expect(maxIn60()).toBeLessThanOrEqual(6)
    // Still reading: the budget delays reads, it does not stop them.
    expect(reads.length).toBeGreaterThanOrEqual(15)
  })
})

describe("a 429 is a backoff, never a failure display", () => {
  it("BUD5 a 429 on the first read (no answer yet) reads 'checking again shortly', no alert", async () => {
    firstReadStatus = 429
    setWallet(A)
    render(app())
    await tick(1000)
    expect(page()).toContain("bank.deposit.rechecking")
    expect(page()).not.toContain("bank.deposit.readFailed")
    expect(document.querySelector("[data-alert]")).toBeNull()
  })
})
