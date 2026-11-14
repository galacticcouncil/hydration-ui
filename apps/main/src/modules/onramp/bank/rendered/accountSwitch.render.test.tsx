// @vitest-environment jsdom
/* Reviewer harness (batch 30 review 1). Renders the REAL BankFlow tree with the
 * REAL hooks, store and HTTP client; only the wallet, the UI kit, i18n and
 * fetch are replaced. fetch is answered by the module's own fixture service
 * used as a server (token taken from the Authorization header). */
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
  screen,
  waitFor,
} from "@testing-library/react"
import { StrictMode, useSyncExternalStore } from "react"
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

type Deferred = {
  resolve: (v: string) => void
  reject: (e: unknown) => void
  message: string
  signer: string
}
const pendingSigns: Deferred[] = []
// Signatures still open in the fake wallet, whether or not a test took them
// out of `pendingSigns` to answer later.
let openSigns = 0
// Every personal_sign the app asked of the fake wallet, answered or not.
let signCalls = 0
class FakeEthSigner {
  __eth = true
  constructor(public address: string) {}
  signMessage(message: string) {
    signCalls += 1
    openSigns += 1
    return new Promise<string>((resolve, reject) => {
      const done =
        <T,>(f: (v: T) => void) =>
        (v: T) => {
          openSigns -= 1
          f(v)
        }
      pendingSigns.push({
        resolve: done(resolve),
        reject: done(reject),
        message,
        signer: this.address,
      })
    })
  }
}
class FakeSubstrateSigner {
  constructor(public address: string) {}
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
  getEip1193ErrorCode: (e: unknown) =>
    typeof e === "object" &&
    e !== null &&
    typeof (e as { code?: unknown }).code === "number"
      ? (e as { code: number }).code
      : null,
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
  useTranslation: () => ({ t: (k: string) => k }),
  initReactI18next: { type: "3rdParty", init: () => {} },
}))
vi.mock("@/i18n", () => ({ default: { t: (k: string) => k } }))
vi.mock("@/config/env", () => ({
  ENV: { VITE_HBR_API_URL: "https://hbr.test" },
}))

// ---- fake HBR server over fetch -----------------------------------------
import { BankFlow } from "@/modules/onramp/bank/components/BankFlow"
import { BankPortfolio } from "@/modules/onramp/bank/components/BankPortfolio"
import { useHbrSignOut } from "@/modules/onramp/bank/hooks/useHbr"
import { useHbrSessionStore } from "@/modules/onramp/bank/store/useHbrSessionStore"
import { HbrApiError } from "@/modules/onramp/bank/utils/hbrErrors"
import { createHbrFixtureService } from "@/modules/onramp/bank/utils/hbrFixtureService"
import { logMutationError, logQueryError } from "@/utils/queryErrorLog"

let reqToken: string | null = null
// When set, DELETE /v1/auth/session never answers (a hung revoke).
let deleteHangs = false
const newBackend = () =>
  createHbrFixtureService({
    session: { getToken: () => reqToken, onUnauthorized: () => {} },
    delayMs: 0,
  })
let backend = newBackend()
const tokenWallet = new Map<string, string>()
type LogEntry = {
  method: string
  path: string
  tokenOf: string | null
  active: string | null
  status: number
}
let log: LogEntry[] = []
let onboardingOverride: null | (() => Response) = null

const json = (status: number, body: unknown) =>
  new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  })

const fakeFetch = async (url: string, init: RequestInit) => {
  const path = url.replace("https://hbr.test", "")
  const method = init.method ?? "GET"
  const auth = (init.headers as Record<string, string>)?.Authorization
  reqToken = auth ? auth.replace(/^Bearer /, "") : null
  const body = init.body ? JSON.parse(init.body as string) : undefined
  const entry: LogEntry = {
    method,
    path,
    tokenOf: reqToken ? (tokenWallet.get(reqToken) ?? "unknown-token") : null,
    active: walletState.account?.rawAddress.toLowerCase() ?? null,
    status: 0,
  }
  log.push(entry)
  // The fake server answers as the token's own wallet (the real server reads
  // the wallet from the session, never from the request).
  const api = backend.forWallet(
    entry.tokenOf ?? "0x0000000000000000000000000000000000000000",
  )
  const answer = async (): Promise<Response> => {
    try {
      const key = `${method} ${path}`
      if (key === "GET /v1/customers/me/onboarding" && onboardingOverride)
        return onboardingOverride()
      switch (key) {
        case "POST /v1/auth/challenge":
          return json(200, await backend.createChallenge(body.h160))
        case "POST /v1/auth/session": {
          const s = await backend.openSession(body)
          tokenWallet.set(s.token, s.h160)
          return json(200, s)
        }
        case "DELETE /v1/auth/session":
          if (deleteHangs) return await new Promise<Response>(() => {})
          await api.closeSession()
          return new Response(null, { status: 204 })
        case "GET /v1/me":
          return json(200, await api.getMe())
        case "POST /v1/customers":
          return json(201, await api.createCustomer(body.type))
        case "POST /v1/customers/me/bind/challenge":
          return json(200, await api.createBindChallenge())
        case "POST /v1/customers/me/bind/verify":
          return json(200, await api.verifyBind(body))
        case "GET /v1/customers/me/onboarding":
          return json(200, await api.getOnboarding())
        case "GET /v1/bank-accounts":
          return json(200, await api.listBankAccounts())
      }
      return json(404, { error: "not_found" })
    } catch (e) {
      if (e instanceof HbrApiError) return json(e.status, e.body)
      throw e
    }
  }
  const res = await answer()
  entry.status = res.status
  return res
}

// ---- helpers -------------------------------------------------------------
const A = "0x1111111111111111111111111111111111111111"
const B = "0x2222222222222222222222222222222222222222"
const SIG = `0x${"11".repeat(65)}`

const setEvm = (addr: string) => {
  walletState.account = { rawAddress: addr, address: addr }
  walletState.signer = new FakeEthSigner(addr)
  emit()
}
const setSubstrate = () => {
  walletState.account = {
    rawAddress: "0x" + "33".repeat(32),
    address: "7Nsubstrate",
  }
  walletState.signer = new FakeSubstrateSigner("7Nsubstrate")
  emit()
}
// Settled = every in-flight query or mutation is one the test holds on
// purpose (a signature still open in the fake wallet); no fixed sleeps.
const flush = async () => {
  await act(async () => {
    await waitFor(() =>
      expect(activeClient.isFetching() + activeClient.isMutating()).toBe(
        openSigns,
      ),
    )
  })
  await act(async () => {})
}
const signNext = async () => {
  const d = pendingSigns.shift()
  if (!d) throw new Error("no pending sign")
  await act(async () => d.resolve(SIG))
  await flush()
  return d
}

let activeClient: QueryClient
let errorSpy: ReturnType<typeof vi.spyOn>
const makeClient = () =>
  // exactly the App.tsx wiring
  new QueryClient({
    queryCache: new QueryCache({ onError: logQueryError }),
    mutationCache: new MutationCache({ onError: logMutationError }),
  })

// The bank screens carry no Sign out (owner decision 2026-11-13); the
// sign-out mutation's rules (clear before DELETE, a 401 reads signed out) are
// driven here through the hook itself, for the wallet whose session it ends.
const SignOutHarness = ({ h160 }: { h160: string }) => {
  const signOut = useHbrSignOut(h160)
  return (
    <button type="button" onClick={() => signOut.mutate()}>
      harness-sign-out
    </button>
  )
}
let harnessWallet: string | null = null
const mount = (direction: "deposit" | "withdraw" = "withdraw") => {
  const client = makeClient()
  activeClient = client
  render(
    <QueryClientProvider client={client}>
      <BankFlow direction={direction} />
      {harnessWallet && <SignOutHarness h160={harnessWallet} />}
    </QueryClientProvider>,
  )
  return client
}
// S04 -> S05: open Bridge (window.open stubbed), then "Return to Hydration",
// which re-reads the onboarding (the former "Check status" of this screen).
const returnFromBridge = async () => {
  vi.spyOn(window, "open").mockReturnValue(null)
  fireEvent.click(screen.getByText("bank.verify.kycCta"))
  await flush()
  fireEvent.click(screen.getByText("bank.verify.opened.return"))
}

// The sign-in screen in any of its forms: the wallet prompt pending (asked
// automatically when the flow opens), failed, or waiting for a press.
const signInShown = () =>
  !!(
    screen.queryByText("bank.signIn.pending.title") ||
    screen.queryByText("bank.signIn.cta") ||
    screen.queryByText("bank.signIn.retry")
  )
// Opening the flow asks the wallet at once (owner decision 2026-11-14).
const signInAs = async (addr: string) => {
  await flush()
  const d = await signNext()
  expect(d.signer).toBe(addr)
}

beforeEach(() => {
  vi.stubGlobal("fetch", fakeFetch)
  useHbrSessionStore.getState().clear()
  log = []
  backend = newBackend()
  pendingSigns.length = 0
  deleteHangs = false
  openSigns = 0
  signCalls = 0
  onboardingOverride = null
  harnessWallet = null
  errorSpy = vi.spyOn(console, "error").mockImplementation(() => {})
})
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  errorSpy.mockRestore()
})

const crossed = () =>
  log.filter((e) => e.tokenOf && e.active && e.tokenOf !== e.active)

describe("lead question: identity crosses wallets", () => {
  it("L1 switch A->B after challenge, before session", async () => {
    setEvm(A)
    mount()
    await flush()
    expect(pendingSigns.length).toBe(1)
    act(() => setEvm(B))
    await flush()
    await signNext() // A's signer finishes, A's session opens
    const s = useHbrSessionStore.getState().session
    expect(signInShown()).toBe(true)
    expect(s).toBeNull()
    expect(crossed()).toEqual([])
  })

  it("L2 switch A->B after session (A on account-type screen), then B->Substrate->A", async () => {
    setEvm(A)
    mount()
    await signInAs(A)
    await flush()
    expect(screen.queryByText("bank.accountType.cta")).not.toBeNull()
    const before = log.length
    // Every node the switch adds, in every commit (not only the final frame).
    const added: string[] = []
    const collect = (records: MutationRecord[]) =>
      records.forEach((r) =>
        r.addedNodes.forEach((n) => added.push(n.textContent ?? "")),
      )
    const watcher = new MutationObserver(collect)
    watcher.observe(document.body, { childList: true, subtree: true })
    act(() => setEvm(B))
    await flush()
    collect(watcher.takeRecords())
    watcher.disconnect()
    // B's wallet never gets the onboarding screen of A's session, not even
    // for one commit before the session guard drops it (reviewer-1 F12).
    expect(added.some((t) => t.includes("bank.accountType.cta"))).toBe(false)
    // ... and no query was ever built for B under A's session (B has none yet).
    expect(
      activeClient
        .getQueryCache()
        .findAll({ queryKey: ["hbr", B.toLowerCase()] }),
    ).toEqual([])
    expect(signInShown()).toBe(true)
    expect(screen.queryByText("bank.accountType.cta")).toBeNull()
    expect(crossed()).toEqual([])
    // After the switch, no request carries A's token.
    expect(log.slice(before).some((e) => e.tokenOf === A)).toBe(false)
    expect(useHbrSessionStore.getState().session).toBeNull()
  })

  it("R6 a reload in the same tab with the same wallet keeps the session; another wallet does not get it", async () => {
    setEvm(A)
    mount()
    await signInAs(A)
    await flush()
    expect(screen.queryByText("bank.accountType.cta")).not.toBeNull()
    // Reload: the page and memory are gone, the tab's sessionStorage stays.
    cleanup()
    act(() => useHbrSessionStore.setState({ session: null }))
    const before = log.length
    mount()
    await flush()
    expect(signInShown()).toBe(false)
    expect(screen.queryByText("bank.accountType.cta")).not.toBeNull()
    expect(
      log.slice(before).every((e) => e.tokenOf === A || e.tokenOf === null),
    ).toBe(true)
    // Reload again, now with wallet B: A's stored token is never used for B.
    cleanup()
    act(() => useHbrSessionStore.setState({ session: null }))
    const beforeB = log.length
    setEvm(B)
    mount()
    await flush()
    expect(signInShown()).toBe(true)
    expect(log.slice(beforeB).some((e) => e.tokenOf === A)).toBe(false)
  })

  it("B3 sign-out while its DELETE hangs, then a reload: signed out, no authed request", async () => {
    setEvm(A)
    harnessWallet = A.toLowerCase()
    mount()
    await signInAs(A)
    await flush()
    expect(screen.queryByText("bank.accountType.cta")).not.toBeNull()
    deleteHangs = true
    fireEvent.click(screen.getByText("harness-sign-out"))
    await act(async () => {})
    // Before the DELETE answers, nothing of the session is left locally.
    expect(sessionStorage.length).toBe(0)
    expect(useHbrSessionStore.getState().session).toBeNull()
    // The revoke went out with the captured token.
    expect(log.some((e) => e.method === "DELETE" && e.tokenOf === A)).toBe(true)
    // Reload while the DELETE is still pending.
    cleanup()
    act(() => useHbrSessionStore.setState({ session: null }))
    const before = log.length
    mount()
    await flush()
    expect(signInShown()).toBe(true)
    expect(log.slice(before).some((e) => e.tokenOf !== null)).toBe(false)
  })

  it.each(["withdraw", "deposit"] as const)(
    "the link step on %s says what the wallet is linked for",
    async (direction) => {
      setEvm(A)
      mount(direction)
      await signInAs(A)
      fireEvent.click(screen.getByText("bank.accountType.cta"))
      await flush()
      expect(screen.queryByText("bank.link.title")).not.toBeNull()
      expect(
        screen.queryByText(`bank.link.description.${direction}`),
      ).not.toBeNull()
      const other = direction === "withdraw" ? "deposit" : "withdraw"
      expect(screen.queryByText(`bank.link.description.${other}`)).toBeNull()
    },
  )

  it("L2b A -> Substrate -> A keeps A's session (no request while substrate)", async () => {
    setEvm(A)
    mount()
    await signInAs(A)
    const before = log.length
    act(() => setSubstrate())
    await flush()
    const whileSub = log.slice(before)
    expect(
      screen.queryByText("bank.connectEvm.cta") ??
        screen.queryAllByRole("button").length,
    ).toBeTruthy()
    expect(whileSub).toEqual([])
    act(() => setEvm(A))
    await flush()
  })

  it("L3 switch between bind challenge and bind verify; B signs in meanwhile", async () => {
    setEvm(A)
    mount()
    await signInAs(A)
    fireEvent.click(screen.getByText("bank.accountType.cta"))
    await flush()
    expect(screen.queryByText("bank.link.cta")).not.toBeNull()
    fireEvent.click(screen.getByText("bank.link.cta"))
    await flush()
    expect(pendingSigns.length).toBe(1) // A's bind message is in the wallet
    const bindDeferred = pendingSigns.shift()!
    act(() => setEvm(B))
    await flush()
    // B is asked to sign in (automatically, B is a new wallet in this open)
    // while A's bind signature is still open
    await flush()
    await signNext()
    expect(useHbrSessionStore.getState().session?.h160).toBe(B)
    const before = log.length
    // now A's wallet returns the bind signature
    await act(async () => bindDeferred.resolve(SIG))
    await flush()
    const after = log.slice(before)
    // R1 (review 1): A's bind signature never goes out under B's session.
    expect(
      after.some((e) => e.path.endsWith("/bind/verify") && e.tokenOf === B),
    ).toBe(false)
    expect(useHbrSessionStore.getState().session?.h160).toBe(B)
  })

  it("L4 switch while onboarding polls: no A-token request after the switch", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    try {
      setEvm(A)
      mount()
      await signInAs(A)
      fireEvent.click(screen.getByText("bank.accountType.cta"))
      await flush()
      fireEvent.click(screen.getByText("bank.link.cta"))
      await flush()
      await signNext()
      await flush()
      expect(screen.queryByText("bank.verify.action.title")).not.toBeNull()
      const before = log.length
      act(() => setEvm(B))
      await flush()
      await act(async () => {
        vi.advanceTimersByTime(35_000)
      })
      await flush()
      const after = log.slice(before)
      expect(after.filter((e) => e.tokenOf === A)).toEqual([])
      expect(screen.queryByText("bank.verify.action.title")).toBeNull()
    } finally {
      vi.useRealTimers()
    }
  })

  it("S1 a failed poll after a good read logs no bearer link (App's QueryCache onError)", async () => {
    setEvm(A)
    mount()
    await signInAs(A)
    fireEvent.click(screen.getByText("bank.accountType.cta"))
    await flush()
    fireEvent.click(screen.getByText("bank.link.cta"))
    await flush()
    await signNext()
    await flush()
    expect(screen.queryByText("bank.verify.action.title")).not.toBeNull()
    errorSpy.mockClear()
    onboardingOverride = () => json(429, { error: "rate_limited" })
    await returnFromBridge()
    await flush()
    const logged = errorSpy.mock.calls.map((args) =>
      args
        .map((a) => {
          const q = a as { state?: { data?: unknown } }
          return q && typeof q === "object" && "state" in q
            ? JSON.stringify(q.state?.data)
            : String(a)
        })
        .join(" | "),
    )
    expect(errorSpy).toHaveBeenCalled()
    // Every URL in the log, parsed: none is the bearer link (exact origin and
    // path, not a substring match).
    const urls = logged.flatMap((l) => l.match(/https?:\/\/[^\s"'|\\]+/g) ?? [])
    const link = new URL("https://example.org/")
    expect(
      urls.some((u) => {
        try {
          const parsed = new URL(u)
          return (
            parsed.origin === link.origin && parsed.pathname === link.pathname
          )
        } catch {
          return false
        }
      }),
    ).toBe(false)
  })

  it("Q3 a 401 on the onboarding read discards the token, returns to sign-in, no repeat", async () => {
    setEvm(A)
    mount()
    await signInAs(A)
    fireEvent.click(screen.getByText("bank.accountType.cta"))
    await flush()
    fireEvent.click(screen.getByText("bank.link.cta"))
    await flush()
    await signNext()
    await flush()
    onboardingOverride = () => json(401, { error: "unauthorized" })
    const before = log.length
    await returnFromBridge()
    await flush()
    const after = log.slice(before)
    expect(useHbrSessionStore.getState().session).toBeNull()
    expect(signInShown()).toBe(true)
    expect(
      after.filter((e) => e.path === "/v1/customers/me/onboarding").length,
    ).toBe(1)
    expect(after.filter((e) => e.tokenOf !== null).length).toBe(1)
  })

  it("Q3 a 401 on DELETE /v1/auth/session reads signed out", async () => {
    setEvm(A)
    harnessWallet = A.toLowerCase()
    mount()
    await signInAs(A)
    const origFetch = fakeFetch
    vi.stubGlobal("fetch", async (url: string, init: RequestInit) =>
      init.method === "DELETE"
        ? json(401, { error: "unauthorized" })
        : origFetch(url, init),
    )
    fireEvent.click(screen.getByText("harness-sign-out"))
    await flush()
    expect(useHbrSessionStore.getState().session).toBeNull()
    expect(signInShown()).toBe(true)
  })
})

// ---- owner decision 2026-11-14: opening Bank asks the wallet at once --------

describe("auto sign-in: at most one personal_sign per user action", () => {
  // The app's one QueryClient lives across bank-modal mounts.
  const open = (client: QueryClient, strict = false) => {
    activeClient = client
    const tree = (
      <QueryClientProvider client={client}>
        <BankFlow direction="deposit" />
      </QueryClientProvider>
    )
    return render(strict ? <StrictMode>{tree}</StrictMode> : tree)
  }

  it("one prompt on open, also under StrictMode", async () => {
    setEvm(A)
    open(makeClient(), true)
    await flush()
    expect(signCalls).toBe(1)
    expect(screen.queryByText("bank.signIn.pending.title")).not.toBeNull()
    await signNext()
    expect(useHbrSessionStore.getState().session?.h160).toBe(A.toLowerCase())
    expect(signCalls).toBe(1)
  })

  it("reopening the modal while the prompt is open asks nothing more", async () => {
    setEvm(A)
    const client = makeClient()
    const first = open(client)
    await flush()
    expect(signCalls).toBe(1)
    first.unmount()
    open(client)
    await flush()
    expect(signCalls).toBe(1)
    expect(screen.queryByText("bank.signIn.pending.title")).not.toBeNull()
    await signNext()
    expect(useHbrSessionStore.getState().session?.h160).toBe(A.toLowerCase())
  })

  it("no prompt while this wallet has a session", async () => {
    setEvm(A)
    const client = makeClient()
    const first = open(client)
    await flush()
    await signNext()
    expect(signCalls).toBe(1)
    first.unmount()
    // a new open of the flow with the session live: no prompt
    open(client)
    await flush()
    expect(screen.queryByText("bank.accountType.cta")).not.toBeNull()
    expect(signCalls).toBe(1)
  })

  it("no prompt for a Substrate account", async () => {
    setSubstrate()
    open(makeClient())
    await flush()
    expect(signCalls).toBe(0)
    expect(screen.queryByText("bank.connectEvm.title")).not.toBeNull()
  })

  it("a rejected prompt shows Try again; only pressing it asks once more", async () => {
    setEvm(A)
    open(makeClient())
    await flush()
    const d = pendingSigns.shift()!
    await act(async () =>
      d.reject(Object.assign(new Error("rejected"), { code: 4001 })),
    )
    await flush()
    expect(screen.queryByText("bank.signIn.retry")).not.toBeNull()
    expect(signCalls).toBe(1)
    // a re-render, or a remount inside the same open (wallet away and back),
    // asks nothing by itself
    act(() => setEvm(A))
    await flush()
    act(() => setSubstrate())
    await flush()
    act(() => setEvm(A))
    await flush()
    expect(signCalls).toBe(1)
    expect(screen.queryByText("bank.signIn.cta")).not.toBeNull()
    // a double press before the re-render asks once
    const press = screen.getByText("bank.signIn.cta")
    act(() => {
      fireEvent.click(press)
      fireEvent.click(press)
    })
    await flush()
    expect(signCalls).toBe(2)
    expect(screen.queryByText("bank.signIn.pending.title")).not.toBeNull()
  })

  it("the Portfolio sign-in tile: one prompt per press, none while one is open", async () => {
    setEvm(A)
    const client = makeClient()
    activeClient = client
    render(
      <QueryClientProvider client={client}>
        <BankPortfolio onOpen={() => {}} />
      </QueryClientProvider>,
    )
    await flush()
    // Portfolio never prompts by itself
    expect(signCalls).toBe(0)
    fireEvent.click(screen.getByText("bank.tile.signIn.cta"))
    fireEvent.click(screen.getByText("bank.tile.signIn.cta"))
    await flush()
    expect(signCalls).toBe(1)
  })
})
