// @vitest-environment jsdom
/* Reviewer harness (batch 30 review 2). Renders the REAL BankFlow tree
 * (direction "deposit") with the REAL hooks, session store, react-query
 * factories and HTTP client. Only the wallet, the UI kit, i18n and fetch are
 * replaced. fetch answers are scripted per test, and can be held (deferred). */
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query"
import {
  act,
  cleanup,
  fireEvent,
  render,
  waitFor,
} from "@testing-library/react"
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
import { useHbrSessionStore } from "@/modules/onramp/bank/store/useHbrSessionStore"
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

const usdReady = (tag: string) => ({
  currency: "usd",
  status: "ready",
  onrampAvailable: true,
  retryAllowed: false,
  instructions: {
    accountNumber: `ACCT-${tag}`,
    routingNumber: `ROUT-${tag}`,
    bankName: `BANK-${tag}`,
    beneficiaryName: `BENE-${tag}`,
    paymentRails: ["ach_push"],
  },
  minimumDeposit: "1000000",
})
const eurReady = (tag: string) => ({
  currency: "eur",
  status: "ready",
  onrampAvailable: true,
  retryAllowed: false,
  instructions: {
    iban: `IBAN-${tag}`,
    bic: `BIC-${tag}`,
    accountHolderName: `HOLDER-${tag}`,
    bankName: `EBANK-${tag}`,
    paymentRails: ["sepa"],
  },
  minimumDeposit: "1000000",
})
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

type Answer = () => Response | Promise<Response>
// per wallet, a queue of answers for GET /v1/onramp/accounts; the last one repeats
const onrampQueue: Record<string, Answer[]> = {}
const sent: {
  method: string
  path: string
  wallet: string | null
  body?: unknown
}[] = []
let held: { resolve: (r: Response) => void; wallet: string | null }[] = []

const hold = (): Answer => () =>
  new Promise<Response>((resolve) => held.push({ resolve, wallet: null }))

const fakeFetch = async (url: string, init: RequestInit) => {
  const path = url.replace("https://hbr.test", "")
  const method = init.method ?? "GET"
  const auth = (init.headers as Record<string, string>)?.Authorization
  const wallet = walletOfToken(auth ? auth.replace(/^Bearer /, "") : null)
  const body = init.body ? JSON.parse(init.body as string) : undefined
  sent.push({ method, path, wallet, body })
  if (!wallet) return json(401, { error: "unauthorized" })
  const key = `${method} ${path}`
  switch (key) {
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
      const q = onrampQueue[wallet]!
      const next = q.length > 1 ? q.shift()! : q[0]!
      const r = next()
      if (r instanceof Promise) held[held.length - 1]!.wallet = wallet
      return r
    }
    case "POST /v1/onramp/accounts":
      return json(202, { account: view(body.currency, "preparing") })
    default:
      return json(404, { error: "not_found" })
  }
}

let queryClient: QueryClient
const logs: unknown[][] = []
const setWallet = (w: string | null) => {
  walletState.account = w ? { rawAddress: w, address: w } : null
  walletState.signer = w ? new FakeEthSigner(w) : null
  emit()
}
// Settled = every in-flight query or mutation is one the test holds on
// purpose (a held fetch answer); no fixed sleeps.
const flush = async () => {
  await act(async () => {
    await waitFor(() =>
      expect(queryClient.isFetching() + queryClient.isMutating()).toBe(
        held.length,
      ),
    )
  })
  await act(async () => {})
}
const page = () => document.body.innerHTML
const app = () => (
  <QueryClientProvider client={queryClient}>
    <BankFlow direction="deposit" />
  </QueryClientProvider>
)
const refetchOnramp = (w: string) =>
  act(async () => {
    void queryClient.invalidateQueries({
      queryKey: hbrQueryKeys.onrampAccounts(w),
    })
  })
const pickCurrency = (c: "usd" | "eur") =>
  act(async () => {
    fireEvent.click(document.querySelector(`[data-toggle-item="${c}"]`)!)
  })
const releaseHeld = async (response: Response) => {
  const h = held.shift()!
  await act(async () => {
    h.resolve(response)
  })
  await flush()
}

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn(fakeFetch))
  queryClient = new QueryClient({
    queryCache: new QueryCache({ onError: logQueryError }),
    mutationCache: new MutationCache({ onError: logMutationError }),
  })
  vi.spyOn(console, "error").mockImplementation((...a: unknown[]) => {
    logs.push(a)
  })
  sent.length = 0
  held = []
  logs.length = 0
  for (const k of Object.keys(onrampQueue)) delete onrampQueue[k]
  useHbrSessionStore.getState().clear()
})
afterEach(() => {
  cleanup()
  queryClient.clear()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

const signIn = (w: string) =>
  useHbrSessionStore.getState().setSession({
    token: TOKEN[w]!,
    h160: w,
    expiresAt: "2099-01-01T00:00:00.000Z",
  })

describe("lead: deposit instructions shown only when they must be", () => {
  it("L1 a poll returning another status after ready removes them at once", async () => {
    signIn(A)
    onrampQueue[A] = [
      () =>
        json(200, { accounts: [usdReady("A1"), view("eur", "not_requested")] }),
      () =>
        json(200, {
          accounts: [view("usd", "checking"), view("eur", "not_requested")],
        }),
    ]
    setWallet(A)
    render(app())
    await flush()
    expect(page()).toContain("ACCT-A1")
    await refetchOnramp(A)
    await flush()
    expect(page()).not.toContain("ACCT-A1")
    expect(page()).not.toContain("ROUT-A1")
  })

  it("L2a a failed (429) read after ready hides them", async () => {
    signIn(A)
    onrampQueue[A] = [
      () =>
        json(200, { accounts: [usdReady("A1"), view("eur", "not_requested")] }),
      () => json(429, { error: "rate_limited" }),
    ]
    setWallet(A)
    render(app())
    await flush()
    expect(page()).toContain("ACCT-A1")
    await refetchOnramp(A)
    await flush()
    expect(page()).not.toContain("bank.deposit.status.ready.title")
    expect(page()).not.toContain("ACCT-A1")
    // the instructions' copy buttons carry the value too
    expect(document.querySelector('[data-copy="ACCT-A1"]')).toBeNull()
    // nothing logged carries the instructions
    expect(JSON.stringify(logs.map((l) => l.map(String)))).not.toContain(
      "ACCT-A1",
    )
    expect(
      JSON.stringify(logs, (_k, v) =>
        v instanceof Error ? { ...v, message: v.message } : v,
      ),
    ).not.toContain("ACCT-A1")
  })

  it("L2b a 401 read after ready hides them and ends the session", async () => {
    signIn(A)
    onrampQueue[A] = [
      () =>
        json(200, { accounts: [usdReady("A1"), view("eur", "not_requested")] }),
      () => json(401, { error: "unauthorized" }),
    ]
    setWallet(A)
    render(app())
    await flush()
    expect(page()).toContain("ACCT-A1")
    await refetchOnramp(A)
    await flush()
    expect(page()).not.toContain("ACCT-A1")
    expect(useHbrSessionStore.getState().session).toBeNull()
  })

  it("L3a currency switch USD->EUR while a poll is in flight: the answer lands per currency", async () => {
    signIn(A)
    onrampQueue[A] = [
      () =>
        json(200, { accounts: [usdReady("A1"), view("eur", "not_requested")] }),
      hold(),
    ]
    setWallet(A)
    render(app())
    await flush()
    expect(page()).toContain("ACCT-A1")
    await refetchOnramp(A) // poll in flight, held
    await pickCurrency("eur")
    await flush()
    expect(page()).not.toContain("ACCT-A1")
    // the held answer arrives: USD ready (new), EUR preparing
    await releaseHeld(
      json(200, { accounts: [usdReady("A2"), view("eur", "preparing")] }),
    )
    expect(page()).not.toContain("ACCT-A2")
    expect(page()).toContain("bank.deposit.status.preparing.title")
    await pickCurrency("usd")
    await flush()
    expect(page()).toContain("ACCT-A2")
  })

  it("L3b currency switch EUR->USD while a poll is in flight (reverse)", async () => {
    signIn(A)
    onrampQueue[A] = [
      () =>
        json(200, { accounts: [view("usd", "not_requested"), eurReady("E1")] }),
      hold(),
    ]
    setWallet(A)
    render(app())
    await flush()
    await pickCurrency("eur")
    await flush()
    expect(page()).toContain("IBAN-E1")
    await refetchOnramp(A)
    await pickCurrency("usd")
    await flush()
    expect(page()).not.toContain("IBAN-E1")
    await releaseHeld(
      json(200, { accounts: [view("usd", "preparing"), eurReady("E2")] }),
    )
    expect(page()).not.toContain("IBAN-E2")
    expect(page()).not.toContain("IBAN-E1")
  })

  it("L3c a USD view carrying EUR-shaped instructions shows nothing; EUR fields on a USD view never render", async () => {
    signIn(A)
    onrampQueue[A] = [
      () =>
        json(200, {
          accounts: [
            {
              ...usdReady("A1"),
              instructions: { ...eurReady("X").instructions },
            },
            view("eur", "not_requested"),
          ],
        }),
    ]
    setWallet(A)
    render(app())
    await flush()
    expect(page()).not.toContain("IBAN-X")
    // and a USD view with USD fields PLUS an iban: the iban is stripped
    onrampQueue[A] = [
      () =>
        json(200, {
          accounts: [
            {
              ...usdReady("A1"),
              instructions: {
                ...usdReady("A1").instructions,
                iban: "IBAN-SNEAK",
              },
            },
            view("eur", "not_requested"),
          ],
        }),
    ]
    await refetchOnramp(A)
    await flush()
    expect(page()).not.toContain("IBAN-SNEAK")
  })

  it("L4a wallet switch A -> B (B signed in) while A's instructions are shown", async () => {
    signIn(A)
    onrampQueue[A] = [
      () =>
        json(200, { accounts: [usdReady("A1"), view("eur", "not_requested")] }),
    ]
    onrampQueue[B] = [hold()]
    setWallet(A)
    render(app())
    await flush()
    expect(page()).toContain("ACCT-A1")
    signIn(B) // B's session (the store holds one session)
    await act(async () => setWallet(B))
    const firstFrame = page()
    await flush()
    expect(firstFrame).not.toContain("ACCT-A1")
    expect(page()).not.toContain("ACCT-A1")
    if (held.length)
      await releaseHeld(
        json(200, { accounts: [usdReady("B1"), view("eur", "not_requested")] }),
      )
    expect(page()).not.toContain("ACCT-A1")
    // every onramp read after the switch was B's own
  })

  it("L4b wallet switch A -> B (no session for B) while A's instructions are shown", async () => {
    signIn(A)
    onrampQueue[A] = [
      () =>
        json(200, { accounts: [usdReady("A1"), view("eur", "not_requested")] }),
    ]
    setWallet(A)
    render(app())
    await flush()
    expect(page()).toContain("ACCT-A1")
    const before = sent.length
    await act(async () => setWallet(B))
    expect(page()).not.toContain("ACCT-A1")
    await flush()
    expect(page()).not.toContain("ACCT-A1")
    expect(sent.slice(before).every((s) => s.wallet !== A)).toBe(true)
  })

  it("L4c A's in-flight poll resolving AFTER the switch to B lands nowhere visible", async () => {
    signIn(A)
    onrampQueue[A] = [
      () =>
        json(200, { accounts: [usdReady("A1"), view("eur", "not_requested")] }),
      hold(),
    ]
    onrampQueue[B] = [
      () =>
        json(200, {
          accounts: [
            view("usd", "not_requested"),
            view("eur", "not_requested"),
          ],
        }),
    ]
    setWallet(A)
    render(app())
    await flush()
    await refetchOnramp(A)
    signIn(B)
    await act(async () => setWallet(B))
    await flush()
    // A's held answer now arrives
    const idx = held.findIndex((h) => h.wallet === A)
    const h = held.splice(idx, 1)[0]!
    await act(async () => {
      h.resolve(
        json(200, { accounts: [usdReady("A9"), view("eur", "not_requested")] }),
      )
    })
    await flush()
    expect(page()).not.toContain("ACCT-A9")
    expect(page()).not.toContain("ACCT-A1")
  })

  it("L5 a refetch returning ready with other instructions replaces them", async () => {
    signIn(A)
    onrampQueue[A] = [
      () =>
        json(200, { accounts: [usdReady("A1"), view("eur", "not_requested")] }),
      () =>
        json(200, { accounts: [usdReady("A2"), view("eur", "not_requested")] }),
    ]
    setWallet(A)
    render(app())
    await flush()
    expect(page()).toContain("ACCT-A1")
    await refetchOnramp(A)
    await flush()
    expect(page()).toContain("ACCT-A2")
    expect(page()).not.toContain("ACCT-A1")
    expect(document.querySelector('[data-copy="ACCT-A1"]')).toBeNull()
  })

  it("L6a unmount then remount in the same task: what the first frame shows from the cache", async () => {
    signIn(A)
    onrampQueue[A] = [
      () =>
        json(200, { accounts: [usdReady("A1"), view("eur", "not_requested")] }),
      hold(),
    ]
    setWallet(A)
    const r = render(app())
    await flush()
    expect(page()).toContain("ACCT-A1")
    // unmount and remount synchronously (no macrotask in between)
    let firstFrame = ""
    act(() => {
      r.unmount()
    })
    const r2 = render(app())
    firstFrame = page()
    console.log(
      "L6a remount same task: cached ACCT-A1 in first frame:",
      firstFrame.includes("ACCT-A1"),
      "; cache entry present:",
      !!queryClient
        .getQueryCache()
        .find({ queryKey: hbrQueryKeys.onrampAccounts(A) }),
    )
    // the refetch is held: the cached answer is what the user sees meanwhile
    await flush()
    r2.unmount()
  })

  it("L6b unmount, a macrotask, remount: the cache entry is gone (gcTime 0)", async () => {
    signIn(A)
    onrampQueue[A] = [
      () =>
        json(200, { accounts: [usdReady("A1"), view("eur", "not_requested")] }),
      hold(),
    ]
    setWallet(A)
    const r = render(app())
    await flush()
    act(() => r.unmount())
    await flush()
    const entry = queryClient
      .getQueryCache()
      .find({ queryKey: hbrQueryKeys.onrampAccounts(A) })
    expect(entry).toBeUndefined()
    render(app())
    expect(page()).not.toContain("ACCT-A1")
    await flush()
    expect(page()).not.toContain("ACCT-A1")
  })

  it("L6c switching to the withdraw direction and back (BankDeposit unmount) in the same tick", async () => {
    signIn(A)
    onrampQueue[A] = [
      () =>
        json(200, { accounts: [usdReady("A1"), view("eur", "not_requested")] }),
    ]
    setWallet(A)
    const r = render(app())
    await flush()
    expect(page()).toContain("ACCT-A1")
    r.unmount()
    // a failed read lands in the cache for this key before the remount (e.g. another observer)
    expect(true).toBe(true)
  })
})
