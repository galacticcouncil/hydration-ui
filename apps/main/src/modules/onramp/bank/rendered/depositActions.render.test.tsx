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
import {
  buildFixtureOnboarding,
  FIXTURE_BANK_ACCOUNTS,
  FIXTURE_DEPOSIT_HISTORY,
} from "@/modules/onramp/bank/config/fixtures"
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
const bankQueue: Answer[] = []
const delQueue: Answer[] = []
let depositsAnswer: unknown = { deposits: [], unattributed: [] }
let bankList: unknown = { bankAccounts: [] }
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
      return json(200, depositsAnswer)
    case "GET /v1/onramp/accounts": {
      const q = onrampQueue[wallet]!
      const next = q.length > 1 ? q.shift()! : q[0]!
      const r = next()
      if (r instanceof Promise) held[held.length - 1]!.wallet = wallet
      return r
    }
    case "GET /v1/bank-accounts":
      return json(200, bankList)
    case "POST /v1/bank-accounts": {
      const next = bankQueue.length > 1 ? bankQueue.shift()! : bankQueue[0]!
      return next()
    }
    default:
      if (method === "DELETE" && path.startsWith("/v1/bank-accounts/")) {
        const next = delQueue.length > 1 ? delQueue.shift()! : delQueue[0]!
        return next()
      }
      if (
        method === "POST" &&
        /^\/v1\/onramp\/accounts\/(usd|eur)\/retry$/.test(path)
      )
        return json(202, { account: view(path.split("/")[4]!, "preparing") })
      break
    case "POST /v1/onramp/accounts":
      return json(202, { account: view(body.currency, "preparing") })
  }
  return json(404, { error: "not_found" })
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
let direction: "deposit" | "withdraw" = "deposit"
const app = () => (
  <QueryClientProvider client={queryClient}>
    <BankFlow direction={direction} />
  </QueryClientProvider>
)
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
  onrampReadBudget.reset()
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

const clickText = (text: string) =>
  act(async () => {
    const b = Array.from(document.querySelectorAll("button")).find(
      (x) => x.textContent === text,
    )
    if (!b) throw new Error(`no button ${text}`)
    fireEvent.click(b)
  })
const buttons = () =>
  Array.from(document.querySelectorAll("button")).map((b) => b.textContent)
const alerts = () =>
  Array.from(document.querySelectorAll("[data-alert]")).map(
    (a) => a.textContent,
  )

describe("Q6 deposit history, builder's own fixture", () => {
  it("H1 renders FIXTURE_DEPOSIT_HISTORY", async () => {
    depositsAnswer = FIXTURE_DEPOSIT_HISTORY
    signIn(A)
    onrampQueue[A] = [
      () =>
        json(200, { accounts: [usdReady("A1"), view("eur", "not_requested")] }),
    ]
    setWallet(A)
    render(app())
    await flush()
    const text = document.body.textContent ?? ""
    // the funds_scheduled entry (f5): status checking, receivedAt null
    const spans = Array.from(document.querySelectorAll("span")).map(
      (s) => s.textContent ?? "",
    )
    const i = spans.findIndex((t) =>
      t.includes("bank.history.detail.funds_scheduled"),
    )
    const f5 = JSON.stringify(spans.slice(Math.max(0, i - 4), i + 1))
    expect(f5).not.toContain("receivedUsd")
    expect(f5).toContain("transferUsd")
    const j = spans.findIndex((t) => t === "Received by Bridge")
    expect(JSON.stringify(spans.slice(j, j + 3))).toContain("receivedUsd")
    expect(text).not.toContain("90.00")
  })
})

describe("Q4 remove", () => {
  beforeEach(() => {
    delQueue.length = 0
    bankList = FIXTURE_BANK_ACCOUNTS
    depositsAnswer = { deposits: [], unattributed: [] }
  })
  const open = async () => {
    direction = "withdraw"
    signIn(A)
    setWallet(A)
    render(app())
    await flush()
  }
  it("R1 the row stays until the server answers; 202 reads removing; list re-read", async () => {
    delQueue.push(hold())
    await open()
    expect(document.body.textContent).toContain("1234")
    await clickText("bank.accounts.remove")
    await flush()
    // While the DELETE is held the row stays and remove is disabled.
    expect(document.body.textContent ?? "").toContain("1234")
    expect(
      (
        Array.from(document.querySelectorAll("button")).find(
          (b) => b.textContent === "bank.accounts.remove",
        ) as HTMLButtonElement
      ).disabled,
    ).toBe(true)
    const listsBefore = sent.filter(
      (s) => s.method === "GET" && s.path === "/v1/bank-accounts",
    ).length
    bankList = { bankAccounts: [] }
    await releaseHeld(
      json(202, {
        status: "deactivation_pending",
        bankAccount: {
          id: "00000000-0000-4000-8000-0000000000b1",
          state: "revoked",
        },
      }),
    )
    const listsAfter = sent.filter(
      (s) => s.method === "GET" && s.path === "/v1/bank-accounts",
    ).length
    expect(alerts()).toContain("bank.accounts.removeResult.removing")
    expect(listsAfter - listsBefore).toBe(1)
    // The row is gone only from the re-read list.
    expect(document.body.textContent ?? "").not.toContain("1234")
  })
  it("R2 ramp_in_flight: try later, no automatic second DELETE", async () => {
    delQueue.push(() =>
      json(409, {
        error: "ramp_in_flight",
        ramp: { id: "00000000-0000-4000-8000-0000000000d1" },
        validUntil: "2026-10-22T12:30:00.000Z",
        retryAfter: "2026-10-22T12:30:00.000Z",
      }),
    )
    await open()
    await clickText("bank.accounts.remove")
    await flush()
    vi.useFakeTimers()
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3_600_000)
    })
    vi.useRealTimers()
    expect(alerts()).toContain("bank.accounts.removeResult.inFlight")
    expect(sent.filter((s) => s.method === "DELETE").length).toBe(1)
    expect(document.body.textContent ?? "").toContain("1234")
  })
  it("R3 a 200 with an unknown status is not read as removed", async () => {
    delQueue.push(() =>
      json(200, {
        status: "weird",
        bankAccount: { id: "00000000-0000-4000-8000-0000000000b1", state: "x" },
      }),
    )
    await open()
    await clickText("bank.accounts.remove")
    await flush()
    expect(alerts()).toContain("bank.accounts.removeResult.unknown")
    expect(alerts()).not.toContain("bank.accounts.removeResult.removed")
  })
})

describe("Q5 retry lever", () => {
  beforeEach(() => {
    direction = "deposit"
    depositsAnswer = { deposits: [], unattributed: [] }
  })
  const show = async (usd: Record<string, unknown>) => {
    signIn(A)
    onrampQueue[A] = [
      () => json(200, { accounts: [usd, view("eur", "not_requested")] }),
    ]
    setWallet(A)
    render(app())
    await flush()
    return buttons()
  }
  it("V1 unknown status with retryAllowed true: re-arm shown, no request, Checking copy", async () => {
    const b = await show(view("usd", "brand_new", { retryAllowed: true }))
    expect(b).toContain("bank.deposit.retry")
    expect(b.some((x) => x?.startsWith("bank.deposit.request"))).toBe(false)
    expect(document.body.textContent ?? "").toContain(
      "bank.deposit.status.unknown.title",
    )
  })
  it("V2 refused with retryAllowed false: no re-arm", async () => {
    const b = await show(
      view("usd", "refused", { retryAllowed: false, reason: null }),
    )
    expect(b).not.toContain("bank.deposit.retry")
  })
  it("V3 preparing with retryAllowed true: re-arm shown", async () => {
    const b = await show(view("usd", "preparing", { retryAllowed: true }))
    expect(b).toContain("bank.deposit.retry")
  })
  it("V4 ready with retryAllowed true: re-arm shown beside the instructions", async () => {
    const b = await show({ ...usdReady("A1"), retryAllowed: true })
    expect(b).toContain("bank.deposit.retry")
    expect(document.body.textContent ?? "").toContain("ACCT-A1")
  })
  it("V5 re-arm double: tab away and back while the re-arm POST is pending", async () => {
    signIn(A)
    onrampQueue[A] = [
      () =>
        json(200, {
          accounts: [
            view("usd", "refused", { retryAllowed: true, reason: null }),
            view("eur", "not_requested"),
          ],
        }),
    ]
    setWallet(A)
    render(app())
    await flush()
    let release: (r: Response) => void = () => {}
    ;(
      globalThis.fetch as unknown as {
        mockImplementationOnce: (f: unknown) => void
      }
    ).mockImplementationOnce(async (url: string, init: RequestInit) => {
      sent.push({
        method: init.method ?? "GET",
        path: url.replace("https://hbr.test", ""),
        wallet: A,
      })
      return new Promise<Response>((r) => {
        held.push({ resolve: r, wallet: A })
        release = (res) => {
          held = held.filter((h) => h.resolve !== r)
          r(res)
        }
      })
    })
    await clickText("bank.deposit.retry")
    await flush()
    await pickCurrency("eur")
    await flush()
    await pickCurrency("usd")
    await flush()
    const visible = buttons().includes("bank.deposit.retry")
    const disabled = (
      Array.from(document.querySelectorAll("button")).find(
        (b) => b.textContent === "bank.deposit.retry",
      ) as HTMLButtonElement | undefined
    )?.disabled
    if (visible && !disabled) {
      await clickText("bank.deposit.retry")
      await flush()
    }
    release(json(202, { account: view("usd", "preparing") }))
    await flush()
    expect(sent.filter((s) => s.path.endsWith("/retry")).length).toBe(1)
  })
})
