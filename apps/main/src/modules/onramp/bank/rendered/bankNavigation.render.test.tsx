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
import {
  buildFixtureOnboarding,
  FIXTURE_BANK_ACCOUNTS,
  FIXTURE_RAMP_BUILT,
} from "@/modules/onramp/bank/config/fixtures"
import { useBankEntryStore } from "@/modules/onramp/bank/store/useBankEntryStore"
import { useHbrSessionStore } from "@/modules/onramp/bank/store/useHbrSessionStore"
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
        unlinkedRedeems: [],
        unlinkedRedeemsTruncated: false,
      })
    case `GET /v1/ramps/${FIXTURE_RAMP_BUILT.id}`:
      return json(200, {
        ramp: { ...FIXTURE_RAMP_BUILT, label: "Checking (server)" },
      })
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
    expect(text()).toContain("bank.signIn.title")
    expect(stepper()?.getAttribute("data-step")).toBe("bank.step.verify")
  })

  it("withdraw steps are Verify, Amount, Bank account, Review, Transfer", async () => {
    signedIn()
    mountFlow("withdraw")
    await waitFor(() => expect(stepper()).not.toBeNull())
    expect(stepper()?.getAttribute("data-steps")).toBe(
      "bank.step.verify|bank.step.amount|bank.step.bankAccount|bank.step.review|bank.step.transfer",
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
  const desc = () =>
    document.querySelector("[data-header-description]")?.textContent ?? ""
  const toCashOut = async () => {
    signedIn()
    rampsList = [{ ...FIXTURE_RAMP_BUILT, label: "Checking (server)" }]
    bankAccounts = { bankAccounts: [X] }
    mountFlow("withdraw")
    await waitFor(() =>
      expect(
        Array.from(document.querySelectorAll("button")).find(
          (b) => b.textContent === "bank.flow.continue",
        )?.disabled,
      ).toBe(false),
    )
    await clickText("bank.flow.continue")
    await waitFor(() => expect(text()).toContain("bank.cashOut.title"))
  }

  it("c1 the list reorders after Continue: still X's cash-out, and a ramp's status stays", async () => {
    await toCashOut()
    expect(desc()).toContain("1234")
    await waitFor(() => expect(text()).toContain("bank.cashOut.history.open"))
    await clickText("bank.cashOut.history.open")
    await waitFor(() =>
      expect(document.querySelector("[data-cash-out-status]")).not.toBeNull(),
    )
    bankAccounts = { bankAccounts: [Y, X] }
    await act(async () => {
      await client.refetchQueries({ queryKey: ["hbr"] })
    })
    await flush()
    expect(document.querySelector("[data-cash-out-status]")).not.toBeNull()
    expect(text()).toContain("Checking (server)")
    expect(text()).not.toContain("9999")
  })

  it("c2 the chosen account leaves the list: the cash-out of X stays, no jump to the picker", async () => {
    await toCashOut()
    bankAccounts = { bankAccounts: [Y] }
    await act(async () => {
      await client.refetchQueries({ queryKey: ["hbr"] })
    })
    await flush()
    expect(text()).toContain("bank.cashOut.title")
    expect(desc()).toContain("1234")
    expect(text()).not.toContain("bank.accounts.title")
  })
})
