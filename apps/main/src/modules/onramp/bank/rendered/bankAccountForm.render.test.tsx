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
    case "GET /v1/bank-accounts":
      return json(200, { bankAccounts: [] })
    case "POST /v1/bank-accounts": {
      const next = bankQueue.length > 1 ? bankQueue.shift()! : bankQueue[0]!
      return next()
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
let direction: "deposit" | "withdraw" = "deposit"
const app = () => (
  <QueryClientProvider client={queryClient}>
    <BankFlow direction={direction} />
  </QueryClientProvider>
)
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

const posts = () =>
  sent.filter((s) => s.method === "POST" && s.path === "/v1/bank-accounts")
const type = async (name: string, value: string) =>
  act(async () => {
    fireEvent.change(document.querySelector(`input[name="${name}"]`)!, {
      target: { value },
    })
  })
const fillAch = async (acct = "123456789012") => {
  await type("bankName", "Review Bank")
  await type("accountNumber", acct)
  await type("routingNumber", "021000021")
  await type("streetLine1", "1 Main St")
  await type("city", "New York")
  await type("state", "NY")
  await type("postalCode", "10001")
}
const submit = () =>
  act(async () => {
    fireEvent.submit(document.querySelector("form")!)
  })
const clickText = (text: string) =>
  act(async () => {
    const b = Array.from(document.querySelectorAll("button")).find(
      (x) => x.textContent === text,
    )
    if (!b) throw new Error(`no button ${text}`)
    fireEvent.click(b)
  })
const openForm = async () => {
  direction = "withdraw"
  signIn(A)
  setWallet(A)
  render(app())
  await flush()
  await clickText("bank.accounts.add")
  await flush()
}
const ids = () =>
  posts().map((p) => (p.body as { clientRequestId: string }).clientRequestId)

describe("Q2 clientRequestId", () => {
  beforeEach(() => {
    bankQueue.length = 0
    direction = "deposit"
  })
  const created = () =>
    json(201, {
      bankAccount: {
        id: "00000000-0000-4000-8000-0000000000b1",
        externalAccountId: "x",
      },
    })

  it("Q2a double submit before the first resolves", async () => {
    bankQueue.push(hold())
    await openForm()
    await fillAch()
    await act(async () => {
      fireEvent.submit(document.querySelector("form")!)
      fireEvent.submit(document.querySelector("form")!)
    })
    await flush()
    expect(new Set(ids()).size).toBe(1)
    expect(posts().length).toBe(1)
  })

  it("Q2b retry after outcome_unknown reuses the id; Q2c retry after a network error too", async () => {
    bankQueue.push(
      () => json(502, { error: "outcome_unknown" }),
      () => {
        throw new TypeError("network")
      },
      created,
    )
    await openForm()
    await fillAch()
    await submit()
    await flush()
    await submit()
    await flush()
    await submit()
    await flush()
    expect(new Set(ids()).size).toBe(1)
  })

  it("Q2d edit then submit is a new id; edit back to the first body: which id?", async () => {
    bankQueue.push(() => json(502, { error: "outcome_unknown" }))
    await openForm()
    await fillAch("123456789012")
    await submit()
    await flush()
    await type("accountNumber", "999999999999")
    await submit()
    await flush()
    await type("accountNumber", "123456789012")
    await submit()
    await flush()
    const byBody = new Map<string, Set<string>>()
    for (const p of posts()) {
      const { clientRequestId, ...rest } = p.body as { clientRequestId: string }
      const k = JSON.stringify(rest)
      if (!byBody.has(k)) byBody.set(k, new Set())
      byBody.get(k)!.add(clientRequestId)
    }
    const byId = new Map<string, Set<string>>()
    for (const p of posts()) {
      const { clientRequestId, ...rest } = p.body as { clientRequestId: string }
      if (!byId.has(clientRequestId)) byId.set(clientRequestId, new Set())
      byId.get(clientRequestId)!.add(JSON.stringify(rest))
    }
    expect([...byId.values()].every((s) => s.size === 1)).toBe(true)
  })

  it("Q2e outcome_unknown, then Cancel, Add, same details: the id is lost", async () => {
    bankQueue.push(() => json(502, { error: "outcome_unknown" }))
    await openForm()
    await fillAch()
    await submit()
    await flush()
    await clickText("bank.accounts.form.cancel")
    await flush()
    await clickText("bank.accounts.add")
    await flush()
    await fillAch()
    await submit()
    await flush()
    // Whatever ids were used, no id ever went out with two bodies (residual
    // R5: the id itself is not kept across Cancel or a remount).
    const bodiesPerId = new Map<string, Set<string>>()
    for (const p of posts()) {
      const { clientRequestId, ...rest } = p.body as { clientRequestId: string }
      const set = bodiesPerId.get(clientRequestId) ?? new Set<string>()
      set.add(JSON.stringify(rest))
      bodiesPerId.set(clientRequestId, set)
    }
    expect(posts().length).toBe(2)
    expect([...bodiesPerId.values()].every((b) => b.size === 1)).toBe(true)
  })

  it("Q2f remount mid-submission (wallet away and back while the POST is held)", async () => {
    bankQueue.push(hold(), () => json(502, { error: "outcome_unknown" }))
    await openForm()
    await fillAch()
    await submit()
    await flush()
    await act(async () => setWallet(null))
    await flush()
    await act(async () => setWallet(A))
    await flush()
    await releaseHeld(json(502, { error: "outcome_unknown" }))
    const formShown = !!document.querySelector("form")
    if (!formShown) {
      await clickText("bank.accounts.add")
      await flush()
    }
    await fillAch()
    await submit()
    await flush()
    // Whatever ids were used, no id ever went out with two bodies (residual
    // R5: the id itself is not kept across Cancel or a remount).
    const bodiesPerId = new Map<string, Set<string>>()
    for (const p of posts()) {
      const { clientRequestId, ...rest } = p.body as { clientRequestId: string }
      const set = bodiesPerId.get(clientRequestId) ?? new Set<string>()
      set.add(JSON.stringify(rest))
      bodiesPerId.set(clientRequestId, set)
    }
    expect(posts().length).toBe(2)
    expect([...bodiesPerId.values()].every((b) => b.size === 1)).toBe(true)
  })
  it("Q2g remount while the first POST is still held, then submit again", async () => {
    bankQueue.push(hold())
    await openForm()
    await fillAch()
    await submit()
    await flush()
    await act(async () => setWallet(null))
    await flush()
    await act(async () => setWallet(A))
    await flush()
    if (!document.querySelector("form")) {
      await clickText("bank.accounts.add")
      await flush()
    }
    await fillAch()
    // D-R2: the remounted form shows the pending POST of this wallet.
    const btn = Array.from(document.querySelectorAll("button")).find(
      (b) => b.getAttribute("type") === "submit",
    ) as HTMLButtonElement
    expect(btn.textContent).toBe("bank.accounts.form.saving")
    expect(btn.disabled).toBe(true)
    await submit()
    await flush()
    expect(posts().length).toBe(1)
  })
})

describe("rail switches (E2E-1)", () => {
  beforeEach(() => {
    bankQueue.length = 0
    bankQueue.push(() =>
      json(201, {
        bankAccount: {
          id: "00000000-0000-4000-8000-0000000000b1",
          externalAccountId: "x",
        },
      }),
    )
  })
  const fillSepa = async (bankName?: string) => {
    await type("iban", "DE89370400440532013000")
    await type("bic", "COBADEFFXXX")
    if (bankName !== undefined) await type("bankName", bankName)
    await type("streetLine1", "Hauptstrasse 1")
    await type("city", "Berlin")
    await type("postalCode", "10115")
    await type("country", "DEU")
  }
  const pick = (rail: "ach" | "sepa") =>
    act(async () => {
      fireEvent.click(document.querySelector(`[data-toggle-item="${rail}"]`)!)
    })
  const fieldErrors = () =>
    Array.from(document.querySelectorAll("[data-field-error]")).map(
      (e) => e.textContent ?? "",
    )
  const onlySepaKeys = () => {
    expect(posts()).toHaveLength(1)
    const body = posts()[0]!.body as Record<string, unknown>
    expect(Object.keys(body).sort()).toEqual(
      ["address", "bic", "clientRequestId", "iban", "rail"]
        .concat("bankName" in body ? ["bankName"] : [])
        .sort(),
    )
    expect(body.rail).toBe("sepa")
  }

  it("ACH -> SEPA with bank name empty submits one SEPA POST", async () => {
    await openForm()
    await pick("sepa")
    await fillSepa()
    await submit()
    await flush()
    expect(fieldErrors()).toEqual([])
    onlySepaKeys()
  })

  it("ACH -> SEPA with bank name filled submits one SEPA POST", async () => {
    await openForm()
    await pick("sepa")
    await fillSepa("Commerzbank")
    await submit()
    await flush()
    expect(fieldErrors()).toEqual([])
    onlySepaKeys()
    expect((posts()[0]!.body as { bankName?: string }).bankName).toBe(
      "Commerzbank",
    )
  })

  it("SEPA -> ACH -> SEPA submits one SEPA POST", async () => {
    await openForm()
    await pick("sepa")
    await pick("ach")
    await pick("sepa")
    await fillSepa()
    await submit()
    await flush()
    expect(fieldErrors()).toEqual([])
    onlySepaKeys()
  })

  it("ACH -> SEPA -> ACH submits one ACH POST with only ACH keys", async () => {
    await openForm()
    await pick("sepa")
    await pick("ach")
    await fillAch()
    await type("country", "USA")
    await submit()
    await flush()
    expect(fieldErrors()).toEqual([])
    expect(posts()).toHaveLength(1)
    const body = posts()[0]!.body as Record<string, unknown>
    expect(Object.keys(body).sort()).toEqual(
      [
        "accountNumber",
        "address",
        "bankName",
        "checkingOrSavings",
        "clientRequestId",
        "rail",
        "routingNumber",
      ].sort(),
    )
  })

  it("a refused submit always shows a translated message on a visible field", async () => {
    await openForm()
    await pick("sepa")
    await type("iban", "not-an-iban")
    await submit()
    await flush()
    expect(posts()).toHaveLength(0)
    const errors = fieldErrors()
    expect(errors.length).toBeGreaterThan(0)
    // The form-level summary shows on every refused submit.
    expect(document.body.textContent).toContain(
      "bank.accounts.form.error.summary",
    )
    // The test i18n returns keys: every message is one of ours.
    expect(
      errors.every((e) => e.startsWith("onramp:bank.accounts.form.error.")),
    ).toBe(true)
  })
})
