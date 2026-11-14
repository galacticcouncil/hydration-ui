// @vitest-environment jsdom
/*
 * Stage 4 (Figma Bank v3 / Mobile bank): the navigation of the bank modal and
 * the Portfolio, Deposits tiles, rendered with the REAL BankFlow and
 * BankPortfolio, hooks, session store, react-query factories and HTTP client.
 * Replaced: the wallet, the UI kit (stub), i18n (keys) and fetch (a scripted
 * HBR whose onboarding and on-ramp answers each test sets).
 */
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

// Node's own (file-less) localStorage shadows jsdom's: a memory Storage, so a
// write would be seen.
const storage = vi.hoisted(() => {
  const data = new Map<string, string>()
  const s = {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, String(v)),
    removeItem: (k: string) => void data.delete(k),
    clear: () => data.clear(),
    key: (i: number) => [...data.keys()][i] ?? null,
    get length() {
      return data.size
    },
  }
  Object.defineProperty(globalThis, "localStorage", {
    value: s,
    configurable: true,
  })
  return s
})

type Acc = { rawAddress: string; address: string } | null
const walletState: {
  account: Acc
  signer: unknown
  listeners: Set<() => void>
} = { account: null, signer: null, listeners: new Set() }
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
import { BankPortfolio } from "@/modules/onramp/bank/components/BankPortfolio"
import { BankTransferHistory } from "@/modules/onramp/bank/components/BankTransferHistory"
import {
  buildFixtureOnboarding,
  FIXTURE_BANK_ACCOUNTS,
  FIXTURE_QUOTE,
  FIXTURE_RAMP_BUILT,
} from "@/modules/onramp/bank/config/fixtures"
import { useBankEntryStore } from "@/modules/onramp/bank/store/useBankEntryStore"
import { useHbrSessionStore } from "@/modules/onramp/bank/store/useHbrSessionStore"
import { formatUsdcBaseUnits } from "@/modules/onramp/bank/utils/onramp"
import { logMutationError, logQueryError } from "@/utils/queryErrorLog"

const A = "0x1111111111111111111111111111111111111111"
const TOKEN = "a".repeat(43)

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  })
const usdReady = {
  currency: "usd",
  status: "ready",
  onrampAvailable: true,
  retryAllowed: false,
  instructions: {
    accountNumber: "ACCT",
    routingNumber: "ROUT",
    bankName: "BANK",
    beneficiaryName: "BENE",
    paymentRails: ["ach_push"],
  },
  minimumDeposit: "1000000",
}
const view = (currency: string, status: string) => ({
  currency,
  status,
  onrampAvailable: false,
  retryAllowed: false,
})

// The scripted server: each test sets what the onboarding and on-ramp reads say.
let onboarding: () => Response
let onrampAccounts: unknown
let depositsAnswer: unknown
let onrampFail: null | "500" | "429" | "net"
let bankAccounts: { bankAccounts: unknown[] }
let rampsList: unknown[]
let unlinkedList: unknown[]
let rampView: Record<string, unknown>
let quoteCalls = 0
const ready = () =>
  json(
    200,
    buildFixtureOnboarding({
      type: "individual",
      bound: true,
      status: "active",
      gate: "ok",
    }),
  )
const stage =
  (status: string, bound = true) =>
  () =>
    json(
      200,
      buildFixtureOnboarding({ type: "individual", bound, status, gate: "x" }),
    )
const noCustomer = () => json(404, { error: "customer_not_found" })

const fakeFetch = async (url: string, init: RequestInit) => {
  const path = url.replace("https://hbr.test", "")
  switch (`${init.method ?? "GET"} ${path}`) {
    case "GET /v1/me":
      return json(200, { h160: A, customer: null })
    case "GET /v1/customers/me/onboarding":
      return onboarding()
    case "GET /v1/onramp/accounts":
      if (onrampFail === "net") throw new TypeError("network")
      if (onrampFail === "429") return json(429, { error: "rate_limited" })
      if (onrampFail === "500") return json(500, { error: "internal" })
      return json(200, onrampAccounts)
    case "GET /v1/onramp/deposits":
      return json(200, depositsAnswer)
    case "GET /v1/bank-accounts":
      return json(200, bankAccounts)
    case "GET /v1/ramps":
      return json(200, {
        ramps: rampsList,
        truncated: false,
        unlinkedRedeems: unlinkedList,
        unlinkedRedeemsTruncated: false,
      })
    case `GET /v1/ramps/${FIXTURE_RAMP_BUILT.id}`:
      return json(200, { ramp: rampView })
    case "POST /v1/ramps/quote":
      quoteCalls += 1
      return json(200, FIXTURE_QUOTE)
  }
  return json(404, { error: "not_found" })
}

let client: QueryClient
const flush = async () => {
  await act(async () => {
    await new Promise((r) => setTimeout(r, 0))
  })
  await act(async () => {})
}
const text = () => document.body.textContent ?? ""
const stepper = () => document.querySelector("[data-step]")
const click = async (selector: string) => {
  const el = document.querySelector(selector)
  if (!el) throw new Error(`no ${selector}`)
  await act(async () => {
    fireEvent.click(el)
  })
  await flush()
}
const clickText = async (label: string) => {
  const b = Array.from(document.querySelectorAll("button")).find(
    (x) => x.textContent === label,
  )
  if (!b) throw new Error(`no button ${label}`)
  await act(async () => {
    fireEvent.click(b)
  })
  await flush()
}
const signedIn = () =>
  useHbrSessionStore.getState().setSession({
    token: TOKEN,
    h160: A.toLowerCase(),
    expiresAt: "2099-01-01T00:00:00.000Z",
  })
const mountFlow = (
  direction: "deposit" | "withdraw",
  nav: { onExit?: () => void; onClose?: () => void } = {},
) =>
  render(
    <QueryClientProvider client={client}>
      <BankFlow direction={direction} {...nav} />
    </QueryClientProvider>,
  )

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn(fakeFetch))
  client = new QueryClient({
    queryCache: new QueryCache({ onError: logQueryError }),
    mutationCache: new MutationCache({ onError: logMutationError }),
  })
  vi.spyOn(console, "error").mockImplementation(() => {})
  useHbrSessionStore.getState().clear()
  useBankEntryStore.getState().clear()
  onboarding = ready
  onrampAccounts = { accounts: [usdReady, view("eur", "not_requested")] }
  depositsAnswer = { deposits: [], unattributed: [] }
  onrampFail = null
  bankAccounts = FIXTURE_BANK_ACCOUNTS
  rampsList = []
  unlinkedList = []
  rampView = { ...FIXTURE_RAMP_BUILT, label: "Checking (server)" }
  quoteCalls = 0
  walletState.account = { rawAddress: A, address: A }
  walletState.signer = new FakeEthSigner(A)
  emit()
})
afterEach(() => {
  cleanup()
  client.clear()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe("the bank modal: stepper, back and close", () => {
  it("deposit steps are Method, Verify, Bank details, Transfer; set-up sits on Verify", async () => {
    mountFlow("deposit")
    await flush()
    expect(stepper()?.getAttribute("data-steps")).toBe(
      "bank.step.method|bank.step.verify|bank.step.bankDetails|bank.step.transfer",
    )
    expect(text()).toMatch(/bank\.signIn\./)
    expect(stepper()?.getAttribute("data-step")).toBe("bank.step.verify")
  })

  it("withdraw steps are Figma's: Amount, Bank account, Review, Transfer", async () => {
    signedIn()
    mountFlow("withdraw")
    await waitFor(() => expect(stepper()).not.toBeNull())
    expect(stepper()?.getAttribute("data-steps")).toBe(
      "bank.step.amount|bank.step.bankAccount|bank.step.review|bank.step.transfer",
    )
  })

  it("set-up screens follow the server's state, each on the Verify step (S02-S06)", async () => {
    signedIn()
    const seen: string[] = []
    for (const [answer, marker] of [
      [noCustomer, "bank.accountType.cta"],
      [stage("tos_pending", false), "bank.link.title"],
      [stage("kyc_not_started"), "bank.verify.kycCta"],
      [stage("kyc_under_review"), "bank.verify.review.title"],
    ] as const) {
      onboarding = answer
      mountFlow("deposit")
      await waitFor(() => expect(text()).toContain(marker))
      seen.push(stepper()?.getAttribute("data-step") ?? "-")
      cleanup()
      client.clear()
    }
    expect(seen).toEqual(Array(4).fill("bank.step.verify"))
  })

  it("S04 -> S05 after a Bridge page is opened; back returns to S04", async () => {
    signedIn()
    onboarding = stage("kyc_not_started")
    vi.spyOn(window, "open").mockReturnValue(null)
    mountFlow("deposit")
    await waitFor(() => expect(text()).toContain("bank.verify.kycCta"))
    await clickText("bank.verify.kycCta")
    expect(text()).toContain("bank.verify.opened.title")
    await click("[data-header-back]")
    expect(text()).toContain("bank.verify.kycCta")
    expect(text()).not.toContain("bank.verify.opened.title")
  })

  it("back on the first screen leaves the flow; close goes to Portfolio, Deposits", async () => {
    const onExit = vi.fn()
    const onClose = vi.fn()
    mountFlow("deposit", { onExit, onClose })
    await flush()
    await click("[data-header-back]")
    expect(onExit).toHaveBeenCalledTimes(1)
    await click("[data-header-close]")
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it("without a close handler no close is drawn", async () => {
    mountFlow("deposit")
    await flush()
    expect(document.querySelector("[data-header-close]")).toBeNull()
  })

  it("add account: the rail is its own step; back from the fields returns to it, back again to the picker", async () => {
    signedIn()
    const onExit = vi.fn()
    mountFlow("withdraw", { onExit })
    await waitFor(() =>
      expect(
        document.querySelector('[data-option="bank.cashOut.form.destination"]'),
      ).not.toBeNull(),
    )
    await click('[data-option="bank.cashOut.form.destination"]')
    await waitFor(() => expect(text()).toContain("bank.accounts.addAnother"))
    await click('[data-option="bank.accounts.addAnother"]')
    expect(text()).toContain("bank.accounts.railTitle")
    expect(document.querySelector("form")).toBeNull()
    await click('[data-option="bank.accounts.form.rail.ach"]')
    expect(document.querySelector("form")).not.toBeNull()
    expect(text()).toContain("bank.accounts.addTitle.ach")
    await click("[data-header-back]")
    expect(document.querySelector("form")).toBeNull()
    expect(text()).toContain("bank.accounts.railTitle")
    await click("[data-header-back]")
    expect(text()).toContain("bank.accounts.title")
    expect(onExit).not.toHaveBeenCalled()
  })

  it("S07 shows once when the set-up finishes while the flow is open, then the details", async () => {
    signedIn()
    onboarding = stage("kyc_under_review")
    mountFlow("deposit")
    await waitFor(() => expect(text()).toContain("bank.verify.review.title"))
    onboarding = ready
    await clickText("bank.verify.checkStatus")
    await waitFor(() => expect(text()).toContain("bank.ready.title.deposit"))
    await clickText("bank.ready.cta.deposit")
    expect(text()).toContain("bank.deposit.detailsTitle")
  })

  it("a user already set up goes straight to the details (no S07)", async () => {
    signedIn()
    mountFlow("deposit")
    await waitFor(() => expect(text()).toContain("bank.deposit.detailsTitle"))
    expect(text()).not.toContain("bank.ready.title.deposit")
  })
})

describe("no Sign out in the bank screens (owner decision 2026-11-13)", () => {
  const noSignOut = () => {
    expect(text()).not.toMatch(/sign\s*-?out/i)
    expect(
      Array.from(document.querySelectorAll("button")).some((b) =>
        /sign\s*-?out/i.test(b.textContent ?? ""),
      ),
    ).toBe(false)
  }
  it.each([
    ["deposit", null],
    ["deposit", noCustomer],
    ["deposit", stage("tos_pending", false)],
    ["deposit", stage("kyc_not_started")],
    ["deposit", stage("kyc_under_review")],
    ["deposit", stage("kyc_rejected")],
    ["deposit", ready],
    ["withdraw", ready],
  ] as const)("%s, server state %#", async (direction, answer) => {
    if (answer) {
      signedIn()
      onboarding = answer
    }
    mountFlow(direction, { onExit: () => {}, onClose: () => {} })
    await flush()
    await flush()
    noSignOut()
  })
})

describe("Portfolio, Deposits: the saved-status tile is the server's state", () => {
  const mountTiles = (onOpen = vi.fn()) => {
    render(
      <QueryClientProvider client={client}>
        <BankPortfolio onOpen={onOpen} />
      </QueryClientProvider>,
    )
    return onOpen
  }
  const tiles = () =>
    Array.from(document.querySelectorAll("[data-bank-tile]")).map((t) =>
      t.getAttribute("data-bank-tile"),
    )

  it.each([
    [noCustomer, "chooseType"],
    [stage("tos_pending", false), "bind"],
    [stage("kyc_not_started"), "verifyAction"],
    [stage("kyc_under_review"), "review"],
    [stage("kyc_rejected"), "rejected"],
    [stage("unknown"), "verifyUnknown"],
  ] as const)("onboarding %# reads tile %s", async (answer, kind) => {
    signedIn()
    onboarding = answer
    mountTiles()
    await waitFor(() => expect(tiles()).toEqual([kind]))
  })

  it("no session: the sign-in tile, and nothing is read", async () => {
    mountTiles()
    await flush()
    expect(tiles()).toEqual(["signIn"])
    expect(vi.mocked(fetch)).not.toHaveBeenCalled()
  })

  it("ready: one tile per requested currency, from the on-ramp read", async () => {
    signedIn()
    onrampAccounts = { accounts: [usdReady, view("eur", "preparing")] }
    mountTiles()
    await waitFor(() => expect(tiles()).toEqual(["account", "account"]))
    expect(text()).toContain("bank.tile.account.ready.title")
    expect(text()).toContain("bank.tile.account.preparing.title")
    // The tile never shows the bank details themselves (rule 5).
    expect(text()).not.toContain("ACCT")
  })

  it("the tile follows the next read: ready, then the server says checking", async () => {
    signedIn()
    mountTiles()
    await waitFor(() =>
      expect(text()).toContain("bank.tile.account.ready.title"),
    )
    onrampAccounts = { accounts: [view("usd", "checking")] }
    await act(async () => {
      await client.invalidateQueries()
    })
    await waitFor(() =>
      expect(text()).toContain("bank.tile.account.checking.title"),
    )
    expect(text()).not.toContain("bank.tile.account.ready.title")
  })

  it("nothing of the set-up is stored: no localStorage, sessionStorage holds the session only", async () => {
    storage.clear()
    sessionStorage.clear()
    signedIn()
    onboarding = stage("kyc_under_review")
    mountTiles()
    await waitFor(() => expect(tiles()).toEqual(["review"]))
    expect(storage.length).toBe(0)
    const keys = Array.from({ length: sessionStorage.length }, (_, i) =>
      sessionStorage.key(i),
    )
    expect(keys.every((k) => k?.startsWith("hbr-session:"))).toBe(true)
  })

  it("a tile action reopens the flow at its target, without the wizard stepper", async () => {
    signedIn()
    const onOpen = mountTiles()
    await waitFor(() => expect(tiles()).toEqual(["account"]))
    await clickText("bank.tile.account.ready.cta")
    expect(onOpen).toHaveBeenCalledWith({
      direction: "deposit",
      target: { kind: "bankDetails", currency: "usd" },
    })
    cleanup()
    useBankEntryStore.getState().open(onOpen.mock.calls[0]![0])
    mountFlow("deposit")
    await waitFor(() => expect(text()).toContain("bank.deposit.detailsTitle"))
    expect(stepper()).toBeNull()
    // Read once: the next open of the flow is a normal one.
    expect(useBankEntryStore.getState().entry).toBeNull()
  })
})

// ---- phase B: deposit ----------------------------------------------------

const DEP = "00000000-0000-4000-8000-0000000000f9"
const deposit = (
  status: string,
  label: string,
  detail: string | null = null,
) => ({
  id: DEP,
  currency: "usd",
  amount: "120.00",
  bridgeState: "payment_processed",
  receivedAt: "2026-10-22T12:00:00.000Z",
  status,
  label,
  detail,
  progress: {
    arrived: "120000000",
    deposited: "120000000",
    waiting: "0",
    credited: status === "credited" ? "120000000" : "0",
  },
})

describe("deposit: details, transfers, one deposit's timeline", () => {
  const toTransfers = async () => {
    signedIn()
    mountFlow("deposit")
    await waitFor(() => expect(text()).toContain("bank.deposit.viewDeposits"))
    expect(stepper()?.getAttribute("data-step")).toBe("bank.step.bankDetails")
    await clickText("bank.deposit.viewDeposits")
    await waitFor(() =>
      expect(document.querySelector("[data-deposit-row]")).not.toBeNull(),
    )
    expect(stepper()?.getAttribute("data-step")).toBe("bank.step.transfer")
  }
  const openRow = async () => {
    await clickText("bank.history.open")
    await waitFor(() =>
      expect(text()).toContain("bank.deposit.summary.bankTransfer"),
    )
  }

  it("D06 rails read as names; an unknown rail token is shown as returned", async () => {
    onrampAccounts = {
      accounts: [
        {
          ...usdReady,
          instructions: {
            ...usdReady.instructions,
            paymentRails: ["ach_push", "wire", "zz_new"],
          },
        },
        view("eur", "not_requested"),
      ],
    }
    signedIn()
    mountFlow("deposit")
    await waitFor(() =>
      expect(document.querySelector("[data-rails]")).not.toBeNull(),
    )
    expect(
      document.querySelector("[data-rails]")!.getAttribute("data-rails"),
    ).toBe("ACH|Wire|zz_new")
    expect(text()).not.toContain("ach_push")
  })

  it("the details of one deposit replace the list; back returns to it", async () => {
    depositsAnswer = {
      deposits: [deposit("queued_on_hydration", "Queued on Hydration")],
      unattributed: [],
    }
    await toTransfers()
    await openRow()
    expect(document.querySelector("[data-deposit-row]")).toBeNull()
    await click("[data-header-back]")
    expect(document.querySelector("[data-deposit-row]")).not.toBeNull()
    expect(text()).not.toContain("bank.deposit.summary.bankTransfer")
  })

  it("the timeline lights only what the status reaches; the current stage is the server's label", async () => {
    depositsAnswer = {
      deposits: [deposit("queued_on_hydration", "Queued (server words)")],
      unattributed: [],
    }
    await toTransfers()
    await openRow()
    const tl = document.querySelector("[data-timeline-lit]")!
    expect(tl.getAttribute("data-timeline-lit")).toBe("5")
    expect(tl.getAttribute("data-timeline-complete")).toBe("false")
    expect(text()).toContain("Queued (server words)")
    expect(
      Array.from(document.querySelectorAll("[data-stage-upcoming]")).map((e) =>
        e.getAttribute("data-stage-upcoming"),
      ),
    ).toEqual(["Credited"])
  })

  it("waiting for the deposit limit stands on Depositing, with its label and the wait copy", async () => {
    depositsAnswer = {
      deposits: [deposit("waiting_deposit_limit", "Waiting for deposit limit")],
      unattributed: [],
    }
    await toTransfers()
    await openRow()
    expect(
      document
        .querySelector("[data-stage-current]")
        ?.getAttribute("data-stage-current"),
    ).toBe("Depositing")
    expect(text()).toContain("bank.history.waitingLimit")
  })

  it("credited completes the timeline; checking shows no timeline at all", async () => {
    depositsAnswer = {
      deposits: [deposit("credited", "Credited")],
      unattributed: [],
    }
    await toTransfers()
    await openRow()
    expect(
      document
        .querySelector("[data-timeline-complete]")
        ?.getAttribute("data-timeline-complete"),
    ).toBe("true")
    cleanup()
    client.clear()
    depositsAnswer = {
      deposits: [deposit("checking", "Checking", "funds_scheduled")],
      unattributed: [],
    }
    await toTransfers()
    await openRow()
    expect(document.querySelector("[data-timeline-lit]")).toBeNull()
    expect(
      document
        .querySelector("[data-off-timeline]")
        ?.getAttribute("data-off-timeline"),
    ).toBe("checking")
    expect(text()).toContain("bank.history.detail.funds_scheduled")
  })

  it("Portfolio's deposit row reopens the flow on that deposit, without the stepper", async () => {
    depositsAnswer = {
      deposits: [deposit("arrived", "Arrived")],
      unattributed: [],
    }
    signedIn()
    useBankEntryStore
      .getState()
      .open({ direction: "deposit", target: { kind: "deposit", id: DEP } })
    mountFlow("deposit")
    await waitFor(() =>
      expect(text()).toContain("bank.deposit.summary.bankTransfer"),
    )
    expect(stepper()).toBeNull()
    expect(text()).toContain("Arrived")
  })
})

// ---- review 4a fix round ---------------------------------------------------

describe("tiles never show the last good read after a failed refetch (review 4a B2)", () => {
  it.each([
    ["500", "error"],
    ["429", "rechecking"],
    ["net", "error"],
  ] as const)(
    "a good ready read, then %s: tile %s, no Ready",
    async (fail, kind) => {
      signedIn()
      render(
        <QueryClientProvider client={client}>
          <BankPortfolio onOpen={vi.fn()} />
        </QueryClientProvider>,
      )
      await waitFor(() =>
        expect(text()).toContain("bank.tile.account.ready.title"),
      )
      onrampFail = fail
      await act(async () => {
        await client.refetchQueries({ queryKey: ["hbr"] })
      })
      await waitFor(() =>
        expect(
          Array.from(document.querySelectorAll("[data-bank-tile]")).map((t) =>
            t.getAttribute("data-bank-tile"),
          ),
        ).toEqual([kind]),
      )
      expect(text()).not.toContain("bank.tile.account.ready")
      expect(text()).not.toContain("bank.tile.setUp")
      expect(document.querySelector('[data-chip="success"]')).toBeNull()
    },
  )
})

describe("the cash-out stays on the account chosen at Continue (review 4a B4)", () => {
  const X = FIXTURE_BANK_ACCOUNTS.bankAccounts[0]!
  const Y = {
    ...X,
    id: "00000000-0000-4000-8000-0000000000c2",
    last4: "9999",
    bankName: "Other bank",
  }
  // W01 amount -> W02 Continue with the default pick (X) -> W05 review.
  const toReview = async () => {
    signedIn()
    rampsList = [{ ...FIXTURE_RAMP_BUILT, label: "Checking (server)" }]
    bankAccounts = { bankAccounts: [X] }
    mountFlow("withdraw")
    await waitFor(() => expect(document.querySelector("input")).not.toBeNull())
    await act(async () => {
      fireEvent.change(document.querySelector("input")!, {
        target: { value: "25.5" },
      })
    })
    await clickText("bank.flow.continue")
    await waitFor(() =>
      expect(
        Array.from(document.querySelectorAll("button")).find(
          (b) => b.textContent === "bank.flow.continue",
        )?.disabled,
      ).toBe(false),
    )
    await clickText("bank.flow.continue")
    await waitFor(() =>
      expect(text()).toContain("bank.cashOut.summary.overview"),
    )
  }
  const reread = async () => {
    await act(async () => {
      await client.refetchQueries({ queryKey: ["hbr"] })
    })
    await flush()
  }

  it("c1 the list reorders after Continue: the review stays X's", async () => {
    await toReview()
    expect(text()).toContain("1234")
    bankAccounts = { bankAccounts: [Y, X] }
    await reread()
    expect(text()).toContain("bank.cashOut.summary.overview")
    expect(text()).toContain("1234")
    expect(text()).not.toContain("9999")
  })

  it("c1b a ramp's status stays on its ramp whatever the list says", async () => {
    signedIn()
    rampsList = [{ ...FIXTURE_RAMP_BUILT, label: "Checking (server)" }]
    mountFlow("withdraw")
    await waitFor(() =>
      expect(text()).toContain("bank.cashOut.status.viewTransfers"),
    )
    await clickText("bank.cashOut.status.viewTransfers")
    await waitFor(() => expect(text()).toContain("bank.cashOut.history.open"))
    await clickText("bank.cashOut.history.open")
    await waitFor(() =>
      expect(document.querySelector("[data-cash-out-status]")).not.toBeNull(),
    )
    bankAccounts = { bankAccounts: [Y, X] }
    await reread()
    expect(document.querySelector("[data-cash-out-status]")).not.toBeNull()
    expect(text()).toContain("Checking (server)")
  })

  it("c2 the chosen account leaves the list: the review of X stays, no jump to the picker", async () => {
    await toReview()
    bankAccounts = { bankAccounts: [Y] }
    await reread()
    expect(text()).toContain("bank.cashOut.summary.overview")
    expect(text()).toContain("1234")
    expect(text()).not.toContain("bank.accounts.title")
  })
})

// ---- phase C: withdraw -----------------------------------------------------

describe("withdraw: W01 -> W02 -> W05 -> status (Figma W01-W15)", () => {
  const enterAmount = async (value = "25.5") => {
    await waitFor(() => expect(document.querySelector("input")).not.toBeNull())
    await act(async () => {
      fireEvent.change(document.querySelector("input")!, {
        target: { value },
      })
    })
  }

  it("the steps go in order and the review asks for one quote", async () => {
    signedIn()
    mountFlow("withdraw")
    await enterAmount()
    expect(stepper()?.getAttribute("data-step")).toBe("bank.step.amount")
    // W01 shows no figure of its own: the only cash-out figures are the quote's.
    expect(text()).not.toContain("bank.cashOut.quote")
    await clickText("bank.flow.continue")
    await waitFor(() => expect(text()).toContain("bank.accounts.title"))
    expect(stepper()?.getAttribute("data-step")).toBe("bank.step.bankAccount")
    await clickText("bank.flow.continue")
    await waitFor(() =>
      expect(text()).toContain("bank.cashOut.quote.bridgeCredited"),
    )
    expect(stepper()?.getAttribute("data-step")).toBe("bank.step.review")
    // The summary's figure is the quote's bridgeCredited, nothing computed.
    expect(document.querySelector("[data-summary-credited]")?.textContent).toBe(
      `bank.cashOut.quote.usdc ${JSON.stringify({
        amount: formatUsdcBaseUnits(FIXTURE_QUOTE.quote.bridgeCredited),
      })}`,
    )
    await flush()
    expect(quoteCalls).toBe(1)
  })

  it("W02 reached before an amount: Continue returns to W01, no quote", async () => {
    signedIn()
    mountFlow("withdraw")
    await waitFor(() =>
      expect(
        document.querySelector('[data-option="bank.cashOut.form.destination"]'),
      ).not.toBeNull(),
    )
    await click('[data-option="bank.cashOut.form.destination"]')
    await waitFor(() => expect(text()).toContain("bank.accounts.title"))
    await waitFor(() =>
      expect(
        Array.from(document.querySelectorAll("button")).find(
          (b) => b.textContent === "bank.flow.continue",
        )?.disabled,
      ).toBe(false),
    )
    await clickText("bank.flow.continue")
    expect(stepper()?.getAttribute("data-step")).toBe("bank.step.amount")
    expect(text()).toContain("1234")
    await flush()
    expect(quoteCalls).toBe(0)
  })

  it("an invalid amount stays on W01 with its message", async () => {
    signedIn()
    mountFlow("withdraw")
    await enterAmount("1.1234567")
    await clickText("bank.flow.continue")
    expect(text()).toContain("bank.cashOut.form.error.amount")
    expect(text()).not.toContain("bank.accounts.title")
    expect(quoteCalls).toBe(0)
  })

  it("a cash-out's details replace the list (R01); back returns to the list", async () => {
    signedIn()
    rampsList = [FIXTURE_RAMP_BUILT]
    mountFlow("withdraw")
    await waitFor(() =>
      expect(text()).toContain("bank.cashOut.status.viewTransfers"),
    )
    await clickText("bank.cashOut.status.viewTransfers")
    await waitFor(() =>
      expect(document.querySelector("[data-ramp-row]")).not.toBeNull(),
    )
    expect(stepper()?.getAttribute("data-step")).toBe("bank.step.transfer")
    await clickText("bank.cashOut.history.open")
    await waitFor(() =>
      expect(document.querySelector("[data-cash-out-status]")).not.toBeNull(),
    )
    expect(document.querySelector("[data-ramp-row]")).toBeNull()
    await click("[data-header-back]")
    expect(document.querySelector("[data-ramp-row]")).not.toBeNull()
    expect(document.querySelector("[data-cash-out-status]")).toBeNull()
  })

  const openStatus = async () => {
    signedIn()
    useBankEntryStore.getState().open({
      direction: "withdraw",
      target: { kind: "ramp", id: FIXTURE_RAMP_BUILT.id },
    })
    mountFlow("withdraw")
    await waitFor(() =>
      expect(document.querySelector("[data-cash-out-status]")).not.toBeNull(),
    )
    await waitFor(() => expect(text()).toContain("bank.cashOut.status.cashOut"))
  }

  it("reopened from Portfolio: the status directly, no stepper", async () => {
    await openStatus()
    expect(stepper()).toBeNull()
  })

  it("the 5.5 timeline lights only the server's stage; its label is the current stage", async () => {
    rampView = {
      ...FIXTURE_RAMP_BUILT,
      status: "credited",
      label: "Queued on Base (server)",
      tone: "pending",
    }
    await openStatus()
    expect(
      document
        .querySelector("[data-timeline-lit]")
        ?.getAttribute("data-timeline-lit"),
    ).toBe("3")
    expect(text()).toContain("Queued on Base (server)")
    expect(
      Array.from(document.querySelectorAll("[data-stage-upcoming]")).map((e) =>
        e.getAttribute("data-stage-upcoming"),
      ),
    ).toEqual(["bank.cashOut.stage.3", "bank.cashOut.stage.4"])
  })

  it("paid alone completes the timeline", async () => {
    rampView = {
      ...FIXTURE_RAMP_BUILT,
      status: "paid",
      label: "Paid",
      tone: "success",
    }
    await openStatus()
    expect(
      document
        .querySelector("[data-timeline-complete]")
        ?.getAttribute("data-timeline-complete"),
    ).toBe("true")
  })

  it("an off-timeline status shows its label and detail, no timeline", async () => {
    rampView = {
      ...FIXTURE_RAMP_BUILT,
      status: "expired",
      label: "Expired - no redemption found",
      tone: "neutral",
      detail: "server detail words",
    }
    await openStatus()
    expect(document.querySelector("[data-timeline-lit]")).toBeNull()
    expect(text()).toContain("Expired - no redemption found")
    expect(text()).toContain("server detail words")
  })
})

// ---- review 4a delta 1 follow-ups ------------------------------------------

describe("delta 1: deposit details, rails, notice, Portfolio history", () => {
  const mountTiles = () =>
    render(
      <QueryClientProvider client={client}>
        <BankPortfolio
          onOpen={vi.fn()}
          history={(h160) => (
            <BankTransferHistory
              h160={h160}
              onOpenDeposit={vi.fn()}
              onOpenRamp={vi.fn()}
            />
          )}
        />
      </QueryClientProvider>,
    )
  const entry = (id: string, status: string, label: string) => ({
    ...deposit(status, label),
    id,
  })

  it("D1-R8 an off-timeline deposit shows the server's label verbatim as its pill", async () => {
    depositsAnswer = {
      deposits: [entry(DEP, "needs_attention", "Needs attention (server)")],
      unattributed: [],
    }
    signedIn()
    useBankEntryStore.getState().open({
      direction: "deposit",
      target: { kind: "deposit", id: DEP },
    })
    mountFlow("deposit")
    await waitFor(() =>
      expect(document.querySelector("[data-off-timeline]")).not.toBeNull(),
    )
    const pill = document.querySelector("[data-off-timeline] [data-chip]")
    expect(pill?.textContent).toBe("Needs attention (server)")
    expect(pill?.getAttribute("data-chip")).toBe("attention")
  })

  it("D1-R9 the deposit pill colour is our per-status mapping", async () => {
    depositsAnswer = {
      deposits: [
        entry("00000000-0000-4000-8000-0000000000a1", "credited", "Credited"),
        entry(
          "00000000-0000-4000-8000-0000000000a2",
          "needs_attention",
          "Needs attention",
        ),
        entry("00000000-0000-4000-8000-0000000000a3", "returned", "Returned"),
        entry("00000000-0000-4000-8000-0000000000a4", "arrived", "Arrived"),
      ],
      unattributed: [],
    }
    signedIn()
    mountTiles()
    await waitFor(() =>
      expect(document.querySelectorAll("[data-deposit-row]")).toHaveLength(4),
    )
    expect(
      Array.from(
        document.querySelectorAll("[data-deposit-row] [data-chip]"),
      ).map((c) => c.getAttribute("data-chip")),
    ).toEqual(["success", "attention", "neutral", "pending"])
    expect(
      Array.from(document.querySelectorAll("[data-currency-badge]")).map((b) =>
        b.getAttribute("data-currency-badge"),
      ),
    ).toEqual(["usd", "usd", "usd", "usd"])
  })

  it("filter chips group by the server's status", async () => {
    depositsAnswer = {
      deposits: [
        entry("00000000-0000-4000-8000-0000000000a1", "credited", "Credited"),
        entry(
          "00000000-0000-4000-8000-0000000000a2",
          "needs_attention",
          "Needs attention",
        ),
        entry("00000000-0000-4000-8000-0000000000a3", "returned", "Returned"),
        entry("00000000-0000-4000-8000-0000000000a4", "checking", "Checking"),
      ],
      unattributed: [],
    }
    signedIn()
    mountTiles()
    await waitFor(() =>
      expect(document.querySelectorAll("[data-deposit-row]")).toHaveLength(4),
    )
    const rows = () =>
      Array.from(document.querySelectorAll("[data-deposit-row]")).map((r) =>
        r.getAttribute("data-deposit-row")!.slice(-2),
      )
    await click('[data-filter="inProgress"]')
    expect(rows()).toEqual(["a4"])
    await click('[data-filter="completed"]')
    expect(rows()).toEqual(["a1"])
    await click('[data-filter="attention"]')
    expect(rows()).toEqual(["a2"])
    await click('[data-filter="all"]')
    expect(rows()).toEqual(["a1", "a2", "a3", "a4"])
  })

  it("nothing tracked: the empty card, no chips", async () => {
    signedIn()
    mountTiles()
    await waitFor(() =>
      expect(document.querySelector("[data-transfers-empty]")).not.toBeNull(),
    )
    expect(document.querySelector("[data-filter]")).toBeNull()
  })

  it("D1-R5 the singular paymentRail joins the rails row as a name, never a raw copy row", async () => {
    onrampAccounts = {
      accounts: [
        {
          ...usdReady,
          instructions: {
            ...usdReady.instructions,
            paymentRails: ["wire"],
            paymentRail: "ach_push",
          },
        },
        view("eur", "not_requested"),
      ],
    }
    signedIn()
    mountFlow("deposit")
    await waitFor(() =>
      expect(document.querySelector("[data-rails]")).not.toBeNull(),
    )
    expect(
      document.querySelector("[data-rails]")!.getAttribute("data-rails"),
    ).toBe("Wire|ACH")
    expect(text()).not.toContain("ach_push")
  })

  it("the D06 notice names the receiving wallet and the minimum", async () => {
    signedIn()
    mountFlow("deposit")
    await waitFor(() =>
      expect(document.querySelector("[data-alert]")).not.toBeNull(),
    )
    const notice = document.querySelector("[data-alert]")!.textContent ?? ""
    expect(notice).toContain(
      `"wallet":"${A.toLowerCase().slice(0, 6)}…${A.slice(-4)}"`,
    )
    expect(notice).toContain('bank.deposit.instructions.minimum {"amount":"1"}')
  })
})

describe("phase C fix: unmatched redemptions under Needs attention (C-R5)", () => {
  it("shows under All and Needs attention, not under In progress or Completed", async () => {
    unlinkedList = [
      {
        id: "00000000-0000-4000-8000-0000000000e1",
        status: "unlinked_redeem",
        label: "Checking (unmatched, server)",
        tone: "pending",
        detail: "Do not send again.",
        retryable: false,
      },
    ]
    rampsList = [FIXTURE_RAMP_BUILT]
    signedIn()
    render(
      <QueryClientProvider client={client}>
        <BankTransferHistory
          h160={A.toLowerCase()}
          onOpenDeposit={vi.fn()}
          onOpenRamp={vi.fn()}
        />
      </QueryClientProvider>,
    )
    await waitFor(() =>
      expect(document.querySelector("[data-unlinked-redeems]")).not.toBeNull(),
    )
    await click('[data-filter="attention"]')
    expect(document.querySelector("[data-unlinked-redeems]")).not.toBeNull()
    await click('[data-filter="inProgress"]')
    expect(document.querySelector("[data-unlinked-redeems]")).toBeNull()
    await click('[data-filter="completed"]')
    expect(document.querySelector("[data-unlinked-redeems]")).toBeNull()
  })
})

describe("long server labels and repeated headings (visual nits)", () => {
  // The longest label of API doc 5.1 (46 characters).
  const LONGEST = "Cancelled - HOLLAR waiting for mint capacity"

  it("a cash-out row shows the longest 5.1 label in full, wrapping; the amount stays on one line", async () => {
    rampsList = [
      {
        ...FIXTURE_RAMP_BUILT,
        status: "redemption_cancelled",
        label: LONGEST,
        tone: "neutral",
      },
    ]
    signedIn()
    mountFlow("withdraw")
    await waitFor(() =>
      expect(text()).toContain("bank.cashOut.status.viewTransfers"),
    )
    await clickText("bank.cashOut.status.viewTransfers")
    await waitFor(() =>
      expect(document.querySelector("[data-ramp-row]")).not.toBeNull(),
    )
    const pill = document.querySelector("[data-ramp-row] [data-pill-label]")!
    expect(pill.textContent).toBe(LONGEST)
    expect(pill.getAttribute("data-pill-label")).toBe(LONGEST)
    // the pill may wrap (never nowrap or truncated); the amount may not. The
    // stub kit cannot see `sx` (the app's JSX runtime turns it into styles), so
    // the components mirror their white-space in a data attribute.
    expect(pill.getAttribute("data-white-space")).toBe("normal")
    expect(
      document
        .querySelector("[data-ramp-row] [data-row-amount]")
        ?.getAttribute("data-white-space"),
    ).toBe("nowrap")
    // the list step's title is the only heading for the list
    expect(text().split("bank.cashOut.history.title").length - 1).toBe(1)
  })

  it("deposit rows: the same rule, and no repeated heading", async () => {
    depositsAnswer = {
      deposits: [{ ...deposit("needs_attention", LONGEST), id: DEP }],
      unattributed: [],
    }
    signedIn()
    mountFlow("deposit")
    await waitFor(() => expect(text()).toContain("bank.deposit.viewDeposits"))
    await clickText("bank.deposit.viewDeposits")
    await waitFor(() =>
      expect(document.querySelector("[data-deposit-row]")).not.toBeNull(),
    )
    const pill = document.querySelector("[data-deposit-row] [data-pill-label]")!
    expect(pill.textContent).toBe(LONGEST)
    expect(pill.getAttribute("data-white-space")).toBe("normal")
    expect(
      document
        .querySelector("[data-deposit-row] [data-row-amount]")
        ?.getAttribute("data-white-space"),
    ).toBe("nowrap")
    expect(text()).not.toContain("bank.history.title")
  })
})
