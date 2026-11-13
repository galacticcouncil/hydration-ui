// @vitest-environment jsdom
/*
 * Cash-out, rendered end to end: the REAL BankFlow (withdraw) and the REAL
 * createTransaction pipeline (TransactionManager, ReviewMultiTransaction,
 * TransactionProvider, useWrapTransaction, useSignAndSubmit, the strict route
 * and its review components, toasts store). Replaced: the wallet (a stand-in
 * EthereumSigner whose prepared send follows a script and calls back as
 * EthereumSigner.sendPreparedTransaction does; that method is pinned in
 * packages/web3-connect), the UI kit, i18n, fetch (a scripted HBR), and the
 * pipeline's chain reads (fee estimate, payment info, nonce, alerts).
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

const h = vi.hoisted(() => {
  // Node's own (file-less) localStorage shadows jsdom's: a memory Storage, set
  // before the persisted toasts store is created, so its writes can be read.
  const data = new Map<string, string>()
  const storage = {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, String(v)),
    removeItem: (k: string) => void data.delete(k),
    clear: () => data.clear(),
    key: (i: number) => [...data.keys()][i] ?? null,
    get length() {
      return data.size
    },
    dump: () => JSON.stringify(Object.fromEntries(data)),
  }
  Object.defineProperty(globalThis, "localStorage", {
    value: storage,
    configurable: true,
  })
  return {
    storage,
    estimateFeeArgs: [] as unknown[],
    paymentInfoArgs: [] as unknown[],
    channel: [] as unknown[],
    // the EVM binding read: answered at once unless a test holds it
    bindingPending: false,
    last4: "6789" as string | null,
  }
})

// ---- wallet ---------------------------------------------------------------
type Step =
  | { kind: "refused" }
  | { kind: "rejected" }
  | { kind: "failed" }
  | { kind: "sent"; hash: string; receipt: "success" | "reverted" | "unknown" }
  | { kind: "hold" }
  | { kind: "repriced"; hash: string; newHash: string }

const A = "0x1111111111111111111111111111111111111111"
const wallet: {
  account: unknown
  signer: unknown
  listeners: Set<() => void>
} = { account: null, signer: null, listeners: new Set() }
let snapshot = { account: wallet.account, signer: wallet.signer }
const emit = () => {
  snapshot = { account: wallet.account, signer: wallet.signer }
  wallet.listeners.forEach((l) => l())
}
const subscribe = (l: () => void) => {
  wallet.listeners.add(l)
  return () => wallet.listeners.delete(l)
}

type Callbacks = {
  onPrompt: () => void
  onReceipt: (s: string) => void
  onSubmitted: (h: string) => void
  onSuccess: (r: unknown) => void
  onError: (m: string) => void
  onFinalized: (r: unknown) => void
}
class FakeEthSigner {
  __eth = true
  script: Step[] = []
  sent: unknown[] = []
  held: ((step: Step) => void) | null = null
  chainId = "0x3640e"
  getPermit = vi.fn()
  signAndSubmit = vi.fn()
  signAndSubmitDispatch = vi.fn()
  provider = {
    request: vi.fn(async ({ method }: { method: string }) => {
      if (method === "eth_chainId") return this.chainId
      throw new Error(`unexpected ${method}`)
    }),
  }
  constructor(public address: string) {}
  signMessage() {
    return new Promise<string>(() => {})
  }
  sendPreparedTransaction = vi.fn(async (prepared: unknown, o: Callbacks) => {
    this.sent.push(prepared)
    let step = this.script.shift() ?? { kind: "failed" }
    if (step.kind === "refused") {
      o.onError("refused")
      return { kind: "refused", reason: "estimate" }
    }
    o.onPrompt()
    if (step.kind === "hold")
      step = await new Promise<Step>((resolve) => (this.held = resolve))
    if (step.kind === "rejected" || step.kind === "failed") {
      o.onError(step.kind)
      return step.kind === "rejected"
        ? { kind: "rejected" }
        : { kind: "failed", code: null }
    }
    if (step.kind === "repriced") {
      o.onSubmitted(step.hash)
      ;(o as unknown as { onRepriced: (h: string) => void }).onRepriced(
        step.newHash,
      )
      o.onReceipt("success")
      o.onSuccess({ status: "success", blockNumber: 1n })
      return { kind: "sent", hash: step.newHash, receipt: "success" }
    }
    if (step.kind !== "sent") throw new Error("bad script")
    o.onSubmitted(step.hash)
    o.onReceipt(step.receipt)
    if (step.receipt === "success")
      o.onSuccess({ status: "success", blockNumber: 1n })
    else o.onError("receipt")
    return { kind: "sent", hash: step.hash, receipt: step.receipt }
  })
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
  isPolkadotSigner: () => false,
  isSolanaSigner: () => false,
  isSuiSigner: () => false,
  isNearSigner: () => false,
  isZecSigner: () => false,
  useActiveMultisigConfig: () => null,
  requestNetworkSwitch: vi.fn(async () => undefined),
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
vi.mock("@galacticcouncil/ui/assets/images/ErrorStatus.webp", () => ({
  default: "",
}))
vi.mock("@galacticcouncil/ui/assets/images/SuccessStatus.webp", () => ({
  default: "",
}))
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

// ---- the pipeline's chain reads ---------------------------------------------
vi.mock("@/providers/rpcProvider", () => ({
  useRpcProvider: () => ({
    isFork: false,
    isReady: true,
    papi: {},
    papiClient: {},
  }),
}))
vi.mock("@/providers/assetsProvider", () => ({
  useAssets: () => ({
    native: { id: "0", decimals: 12 },
    getAsset: () => ({ id: "0", decimals: 12 }),
    getAssetWithFallback: () => ({ id: "0", decimals: 12, symbol: "HDX" }),
  }),
}))
vi.mock("@/modules/transactions/hooks/useEstimateFee", () => ({
  useEstimateFee: (tx: unknown) => {
    h.estimateFeeArgs.push(tx)
    return { data: undefined, isLoading: false, isError: false }
  },
}))
vi.mock("@/modules/transactions/hooks/useTransactionPaymentInfo", () => ({
  useTransactionPaymentInfo: (tx: unknown) => {
    h.paymentInfoArgs.push(tx)
    return { data: undefined, isLoading: false }
  },
}))
vi.mock("@/modules/transactions/hooks/useNonce", () => ({
  useNonce: () => ({ nonce: 3, isLoading: false, isUsingPermit: true }),
}))
vi.mock("@/modules/transactions/hooks/useTransactionAlerts", () => ({
  useTransactionAlerts: () => ({ alerts: [], flags: [], hasAlerts: false }),
  TransactionAlertFlag: {},
}))
vi.mock("@/modules/transactions/hooks/useIntentToasts", () => ({
  useIntentToasts: () => {},
}))
vi.mock("@/modules/transactions/hooks/useProcessTransactionToasts", () => ({
  useProcessTransactionToasts: () => {},
}))
vi.mock("@/hooks/useRouteBlock", () => ({ useRouteBlock: () => {} }))
vi.mock("@/api/balances", () => ({ MAX_WITHDRAW_ALL_QUERY_KEY: ["maxAll"] }))
vi.mock("@/api/aave", () => ({ AAVE_GAS_LIMIT: 0n }))
vi.mock("@/api/payments", () => ({
  useAccountFeePaymentAssetId: () => ({ data: undefined }),
}))
vi.mock("@/api/evm", async () => {
  const { queryOptions } = await import("@tanstack/react-query")
  return {
    weightToEvmFeeQuery: vi.fn(),
    evmAccountBindingQuery: (_rpc: unknown, address: string) =>
      queryOptions({
        queryKey: ["evm", "accountBinding", address],
        queryFn: () =>
          h.bindingPending
            ? new Promise<boolean>(() => {})
            : Promise.resolve(true),
      }),
  }
})
vi.mock("@/api/transaction", () => ({ paymentInfoQuery: vi.fn() }))
vi.mock("@/api/external/common", () => ({
  getParachainFeeAssetLocation: vi.fn(),
}))
vi.mock(
  "@/modules/transactions/review/ReviewTransactionJsonView/ReviewTransactionJsonView.utils",
  () => ({ decodeTx: vi.fn() }),
)
vi.mock("@/modules/transactions/review/ReviewTransactionJsonView", () => ({
  ReviewTransactionJsonView: () => <i>json-view</i>,
}))
vi.mock("@/modules/transactions/review/ReviewTransactionSummary", () => ({
  ReviewTransactionSummary: () => <i>summary</i>,
}))
vi.mock("@/modules/transactions/review/ReviewTransactionStatus", () => ({
  ReviewTransactionStatus: () => <i>non-strict-status</i>,
}))
vi.mock("@/modules/transactions/review/ReviewTransactionSubmitButton", () => ({
  ReviewTransactionSubmitButton: () => <i>non-strict-submit</i>,
}))
vi.mock(
  "@/modules/transactions/review/ReviewTransactionFeePaymentAssetModal",
  () => ({ ReviewTransactionFeePaymentAssetModal: () => null }),
)
vi.mock("@/modules/transactions/utils/near", () => ({}))
vi.mock("@/modules/transactions/utils/solana", () => ({}))
vi.mock("@/modules/transactions/utils/sui", () => ({}))
vi.mock("@/modules/transactions/utils/zec", () => ({}))
vi.mock("@/config/xcSwap", () => ({ XC_SWAP_CONFIG: {} }))

import { CallType } from "@galacticcouncil/xc-core"

import { BankFlow } from "@/modules/onramp/bank/components/BankFlow"
import {
  buildFixtureOnboarding,
  FIXTURE_QUOTE,
  FIXTURE_RAMP_BUILT,
} from "@/modules/onramp/bank/config/fixtures"
import { useBankCashOutStore } from "@/modules/onramp/bank/store/useBankCashOutStore"
import { useHbrSessionStore } from "@/modules/onramp/bank/store/useHbrSessionStore"
import { TransactionManager } from "@/modules/transactions/TransactionManager"
import { useStrictEvmLedger } from "@/modules/transactions/utils/strictEvm"
import { strictEvmCall } from "@/modules/transactions/utils/strictEvm"
import { useToastsStore } from "@/states/toasts"
import { useTransactionsStore } from "@/states/transactions"
import { logMutationError, logQueryError } from "@/utils/queryErrorLog"

// ---- scripted HBR -------------------------------------------------------------
const TOKEN = "a".repeat(43)
const BANK = "00000000-0000-4000-8000-0000000000b1"
const RAMP = FIXTURE_RAMP_BUILT.id
const APPROVE_DATA = `0x095ea7b3${"00".repeat(20)}aaaa`
const REDEEM_DATA = `0x5f5f5f5f${"11".repeat(40)}`
const APPROVE_HASH = `0x${"a1".repeat(32)}`
const REDEEM_HASH = `0x${"b2".repeat(32)}`
const unsigned = (data: string, from = A) => ({
  chainId: 222222,
  from,
  to: "0x2222222222222222222222222222222222222222",
  data,
  value: "0x0",
})

let buildAnswer: () => Response
let rampStatus: Record<string, unknown> = FIXTURE_RAMP_BUILT
const sent: { method: string; path: string; body?: unknown }[] = []
const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  })
const built =
  (overrides: Record<string, unknown> = {}) =>
  () =>
    json(201, {
      ramp: { ...FIXTURE_RAMP_BUILT, validUntil: "2099-01-01T00:30:00.000Z" },
      approveTx: unsigned(APPROVE_DATA),
      redeemTx: unsigned(REDEEM_DATA),
      quote: FIXTURE_QUOTE.quote,
      validUntil: "2099-01-01T00:30:00.000Z",
      hollarBurn: "25500000000000000000",
      payoutLimit: { refillNeeded: false, minRefillSeconds: null },
      ...overrides,
    })

const fakeFetch = async (url: string, init: RequestInit) => {
  const path = url.replace("https://hbr.test", "")
  const method = init.method ?? "GET"
  const body = init.body ? JSON.parse(init.body as string) : undefined
  sent.push({ method, path, body })
  switch (`${method} ${path}`) {
    case "GET /v1/me":
      return json(200, { h160: A, customer: { id: BANK } })
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
    case "GET /v1/bank-accounts":
      return json(200, {
        bankAccounts: [
          {
            id: BANK,
            externalAccountId: "ea",
            status: "active",
            currency: "usd",
            accountType: "us",
            last4: h.last4,
            bankName: null,
          },
        ],
      })
    case "POST /v1/ramps/quote":
      return json(200, FIXTURE_QUOTE)
    case "POST /v1/ramps":
      return buildAnswer()
    case "GET /v1/ramps":
      return json(200, {
        ramps: [],
        truncated: false,
        unlinkedRedeems: [],
        unlinkedRedeemsTruncated: false,
      })
    case `GET /v1/ramps/${RAMP}`:
      return json(200, { ramp: rampStatus })
    case `POST /v1/ramps/${RAMP}/report`:
      return json(200, {
        ramp: { ...rampStatus, status: "submitted", label: "Checking" },
      })
  }
  return json(404, { error: "not_found" })
}

let queryClient: QueryClient
let signer: FakeEthSigner
const flush = async () => {
  await act(async () => {
    await new Promise((r) => setTimeout(r, 0))
  })
  await act(async () => {})
}
const text = () => document.body.textContent ?? ""
const buttons = () =>
  Array.from(document.querySelectorAll("button")) as HTMLButtonElement[]
const button = (label: string) => {
  const b = buttons().find((x) => x.textContent === label)
  if (!b)
    throw new Error(
      `no button ${label}: ${buttons()
        .map((x) => x.textContent)
        .join("|")}`,
    )
  return b
}
const click = async (label: string) => {
  await act(async () => {
    fireEvent.click(button(label))
  })
  await flush()
}
const reports = () =>
  sent.filter((s) => s.method === "POST" && s.path.endsWith("/report"))

const app = () => (
  <QueryClientProvider client={queryClient}>
    <BankFlow direction="withdraw" />
    <TransactionManager />
  </QueryClientProvider>
)

/** Sign in, enter 25.5, quote, confirm: the review is on screen. */
const toReview = async () => {
  render(app())
  await waitFor(() => expect(text()).toContain("bank.cashOut.title"))
  const input = document.querySelector("input") as HTMLInputElement
  await act(async () => {
    fireEvent.change(input, { target: { value: "25.5" } })
  })
  await click("bank.cashOut.quote.get")
  await waitFor(() =>
    expect(text()).toContain("bank.cashOut.quote.bridgeCredited"),
  )
  await click("bank.cashOut.confirm")
  await waitFor(() => expect(text()).toContain("bank.cashOut.review.title"))
  await flush()
}
/** The review's Sign: the cash-out goes to createTransaction. */
const handOver = async () => {
  await click("bank.cashOut.review.sign")
  await waitFor(() =>
    expect(document.querySelector("[data-modal]")).not.toBeNull(),
  )
}
const signStep = async () => {
  await waitFor(() => expect(button("transaction.sign").disabled).toBe(false))
  await click("transaction.sign")
  await flush()
}

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn(fakeFetch))
  queryClient = new QueryClient({
    queryCache: new QueryCache({ onError: logQueryError }),
    mutationCache: new MutationCache({ onError: logMutationError }),
  })
  vi.spyOn(console, "error").mockImplementation(() => {})
  sent.length = 0
  h.estimateFeeArgs.length = 0
  h.paymentInfoArgs.length = 0
  h.bindingPending = false
  useToastsStore.setState({ toasts: {} })
  h.last4 = "6789"
  buildAnswer = built()
  rampStatus = FIXTURE_RAMP_BUILT
  h.storage.clear()
  useStrictEvmLedger.setState({ entries: {} })
  useBankCashOutStore.setState({ records: {} })
  useTransactionsStore.setState({ transactions: [], pendingTransactions: [] })
  useHbrSessionStore.getState().setSession({
    token: TOKEN,
    h160: A,
    expiresAt: "2099-01-01T00:00:00.000Z",
  })
  signer = new FakeEthSigner(A)
  wallet.account = { rawAddress: A, address: A, isMultisig: false }
  wallet.signer = signer
  emit()
})
afterEach(() => {
  cleanup()
  queryClient.clear()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe("cash-out happy path", () => {
  it("approve, its receipt, then redeem; the report carries the redeem hash only", async () => {
    signer.script = [
      { kind: "sent", hash: APPROVE_HASH, receipt: "success" },
      { kind: "sent", hash: REDEEM_HASH, receipt: "success" },
    ]
    await toReview()
    await handOver()
    expect(
      document.querySelector("[data-step]")!.getAttribute("data-step"),
    ).toBe("bank.cashOut.tx.approveStep")
    await signStep()
    await waitFor(() =>
      expect(
        document.querySelector("[data-step]")?.getAttribute("data-step"),
      ).toBe("bank.cashOut.tx.redeemStep"),
    )
    await signStep()
    await waitFor(() => expect(reports()).toHaveLength(1))
    expect(reports()[0]!.body).toEqual({ txHash: REDEEM_HASH })
    // the wallet saw each prepared transaction once, as given
    expect(signer.sent).toEqual([unsigned(APPROVE_DATA), unsigned(REDEEM_DATA)])
    expect(signer.getPermit).not.toHaveBeenCalled()
    expect(signer.signAndSubmit).not.toHaveBeenCalled()
    expect(signer.signAndSubmitDispatch).not.toHaveBeenCalled()
  })

  it("no approve: the redeem alone, with no sequencing wait", async () => {
    buildAnswer = built({ approveTx: null })
    signer.script = [{ kind: "sent", hash: REDEEM_HASH, receipt: "success" }]
    await toReview()
    await handOver()
    await signStep()
    await waitFor(() => expect(reports()).toHaveLength(1))
    expect(signer.sent).toEqual([unsigned(REDEEM_DATA)])
  })
})

describe("the approve receipt gates the redeem (guarantee 6)", () => {
  it.each(["reverted", "unknown"] as const)(
    "an approve receipt that is %s never reaches the redeem prompt, and offers no Try again",
    async (receipt) => {
      signer.script = [{ kind: "sent", hash: APPROVE_HASH, receipt }]
      await toReview()
      await handOver()
      await signStep()
      await waitFor(() =>
        expect(text()).toContain("transaction.strict.status.checking.title"),
      )
      expect(buttons().map((b) => b.textContent)).not.toContain(
        "transaction.status.error.tryAgain",
      )
      expect(button("modal-close")).toBeDefined()
      expect(signer.sendPreparedTransaction).toHaveBeenCalledTimes(1)
      expect(reports()).toHaveLength(0)
      // close the modal: the redeem was never presented
      await click("modal-close")
      expect(signer.sendPreparedTransaction).toHaveBeenCalledTimes(1)
      // only an observed revert says the approval reverted; an unobserved one reads Checking
      await waitFor(() =>
        expect(text()).toContain(
          receipt === "reverted"
            ? "bank.cashOut.local.approvalReverted"
            : "bank.cashOut.local.approvalChecking",
        ),
      )
    },
  )
})

describe("once (guarantee 5), counted at the signer", () => {
  it("4001 with no hash on the redeem: Try again re-presents the SAME tx once", async () => {
    signer.script = [
      { kind: "sent", hash: APPROVE_HASH, receipt: "success" },
      { kind: "rejected" },
      { kind: "sent", hash: REDEEM_HASH, receipt: "success" },
    ]
    await toReview()
    await handOver()
    await signStep()
    await waitFor(() =>
      expect(
        document.querySelector("[data-step]")?.getAttribute("data-step"),
      ).toBe("bank.cashOut.tx.redeemStep"),
    )
    await signStep()
    await waitFor(() =>
      expect(text()).toContain("transaction.strict.status.declined.title"),
    )
    await click("transaction.status.error.tryAgain")
    await signStep()
    expect(signer.sendPreparedTransaction).toHaveBeenCalledTimes(3)
    expect(signer.sent[1]).toBe(signer.sent[2])
    await waitFor(() => expect(reports()).toHaveLength(1))
    expect(reports()[0]!.body).toEqual({ txHash: REDEEM_HASH })
  })

  it("4001 on the approve (a non-last step): Try again re-presents the approve", async () => {
    signer.script = [
      { kind: "rejected" },
      { kind: "sent", hash: APPROVE_HASH, receipt: "success" },
    ]
    await toReview()
    await handOver()
    await signStep()
    await waitFor(() =>
      expect(text()).toContain("transaction.strict.status.declined.title"),
    )
    await click("transaction.status.error.tryAgain")
    await signStep()
    expect(signer.sent[0]).toBe(signer.sent[1])
  })

  it.each([
    ["a non-4001 error", { kind: "failed" } as Step],
    [
      "a hash with a receipt that is not observed (4001 or not)",
      {
        kind: "sent",
        hash: REDEEM_HASH,
        receipt: "unknown",
      } as Step,
    ],
    [
      "a revert",
      { kind: "sent", hash: REDEEM_HASH, receipt: "reverted" } as Step,
    ],
  ])("%s on the redeem: no Try again, never re-sent", async (_n, step) => {
    signer.script = [
      { kind: "sent", hash: APPROVE_HASH, receipt: "success" },
      step,
    ]
    await toReview()
    await handOver()
    await signStep()
    await waitFor(() =>
      expect(
        document.querySelector("[data-step]")?.getAttribute("data-step"),
      ).toBe("bank.cashOut.tx.redeemStep"),
    )
    await signStep()
    await flush()
    expect(buttons().map((b) => b.textContent)).not.toContain(
      "transaction.status.error.tryAgain",
    )
    expect(signer.sendPreparedTransaction).toHaveBeenCalledTimes(2)
  })

  it("a refusal before the prompt (wrong chain) reads not sent and is never re-presented", async () => {
    buildAnswer = built({ approveTx: null })
    signer.script = [{ kind: "refused" }]
    await toReview()
    await handOver()
    await signStep()
    await waitFor(() =>
      expect(text()).toContain("transaction.strict.status.notSent.title"),
    )
    expect(buttons().map((b) => b.textContent)).not.toContain(
      "transaction.status.error.tryAgain",
    )
    expect(buttons().map((b) => b.textContent)).not.toContain(
      "transaction.sign",
    )
    expect(signer.sendPreparedTransaction).toHaveBeenCalledTimes(1)
  })
})

describe("sender (guarantee 3)", () => {
  it("a server `from` that is not the session wallet is refused before any prompt", async () => {
    const other = "0x3333333333333333333333333333333333333333"
    buildAnswer = built({
      approveTx: null,
      redeemTx: unsigned(REDEEM_DATA, other),
    })
    await toReview()
    await handOver()
    await flush()
    // known before the prompt: Sign is disabled with the reason, nothing is consumed
    expect(text()).toContain("transaction.strict.refusal.sender")
    expect(button("transaction.sign").disabled).toBe(true)
    // (the send's own refusal of a wrong sender is pinned in strictEvm.test.ts)
    expect(signer.sendPreparedTransaction).not.toHaveBeenCalled()
  })
})

describe("local Checking (rule 11)", () => {
  it("holds while the server says built, then the server's label shows", async () => {
    buildAnswer = built({ approveTx: null })
    signer.script = [{ kind: "failed" }]
    await toReview()
    await handOver()
    await signStep()
    await click("modal-close")
    await waitFor(() =>
      expect(text()).toContain("bank.cashOut.localChecking.label"),
    )
    expect(text()).not.toContain("Prepared - not yet seen on chain")
    expect(reports()).toHaveLength(0)
    rampStatus = {
      ...FIXTURE_RAMP_BUILT,
      status: "built_past_deadline",
      label: "Checking",
      detail:
        "The deadline of this transaction has passed by our clock. We are confirming on chain that it was not used. Do not send it again.",
    }
    await act(async () => {
      await queryClient.refetchQueries()
    })
    await waitFor(() =>
      expect(text()).not.toContain("bank.cashOut.localChecking.label"),
    )
    expect(text()).toContain("We are confirming on chain that it was not used")
  })

  it("a declined redeem with no hash keeps the server's label and says nothing was sent", async () => {
    buildAnswer = built({ approveTx: null })
    signer.script = [{ kind: "rejected" }]
    await toReview()
    await handOver()
    await signStep()
    await click("modal-close")
    await waitFor(() => expect(text()).toContain("bank.cashOut.local.declined"))
    expect(text()).toContain("Prepared - not yet seen on chain")
    expect(text()).not.toContain("bank.cashOut.localChecking.label")
  })
})

describe("hash out (guarantee 7)", () => {
  it("a hash the wallet returns after the modal was closed is still reported", async () => {
    buildAnswer = built({ approveTx: null })
    signer.script = [{ kind: "hold" }]
    await toReview()
    await handOver()
    await signStep()
    await click("modal-close")
    expect(document.querySelector("[data-modal]")).toBeNull()
    await act(async () => {
      signer.held!({ kind: "sent", hash: REDEEM_HASH, receipt: "success" })
    })
    await waitFor(() => expect(reports()).toHaveLength(1))
    expect(reports()[0]!.body).toEqual({ txHash: REDEEM_HASH })
  })
})

describe("memory only (guarantee 8)", () => {
  it("no prepared calldata in the query or mutation cache, toasts, synced pending txs or fee reads", async () => {
    const posted: unknown[] = []
    vi.spyOn(BroadcastChannel.prototype, "postMessage").mockImplementation(
      (m: unknown) => {
        posted.push(m)
      },
    )
    signer.script = [
      { kind: "sent", hash: APPROVE_HASH, receipt: "success" },
      { kind: "failed" },
    ]
    await toReview()
    await handOver()
    await signStep()
    await waitFor(() =>
      expect(
        document.querySelector("[data-step]")?.getAttribute("data-step"),
      ).toBe("bank.cashOut.tx.redeemStep"),
    )
    await signStep()
    await flush()
    const needles = [APPROVE_DATA.slice(2, 40), REDEEM_DATA.slice(2, 40)]
    const queries = JSON.stringify(
      queryClient
        .getQueryCache()
        .getAll()
        .map((q) => [q.queryKey, q.state.data]),
      (_k, v) => (typeof v === "bigint" ? v.toString() : v),
    )
    const mutations = JSON.stringify(
      queryClient
        .getMutationCache()
        .getAll()
        .map((m) => [m.options.mutationKey, m.state.data, m.state.variables]),
      (_k, v) =>
        typeof v === "bigint"
          ? v.toString()
          : typeof v === "function"
            ? "fn"
            : v,
    )
    const storage = h.storage.dump()
    const channel = JSON.stringify(posted)
    for (const needle of needles) {
      expect(queries).not.toContain(needle)
      expect(mutations).not.toContain(needle)
      expect(storage).not.toContain(needle)
      expect(channel).not.toContain(needle)
    }
    // the pipeline never fed a strict transaction to a fee or payment-info read
    expect(h.estimateFeeArgs.every((tx) => tx === null)).toBe(true)
    expect(h.paymentInfoArgs.every((tx) => tx === undefined)).toBe(true)
    // the toast keeps the hash
    expect(storage).toContain(APPROVE_HASH)
  })
})

describe("build refusals", () => {
  it("409 ramp_pending shows that ramp and builds nothing", async () => {
    buildAnswer = () =>
      json(409, {
        error: "ramp_pending",
        ramp: { id: RAMP },
        validUntil: "2099-01-01T00:30:00.000Z",
        retryAfter: null,
        nothingBroadcast: true,
      })
    render(app())
    await waitFor(() => expect(text()).toContain("bank.cashOut.title"))
    await act(async () => {
      fireEvent.change(document.querySelector("input")!, {
        target: { value: "25.5" },
      })
    })
    await click("bank.cashOut.quote.get")
    await waitFor(() => expect(text()).toContain("bank.cashOut.confirm"))
    await click("bank.cashOut.confirm")
    await waitFor(() => expect(text()).toContain("bank.cashOut.error.pending"))
    await click("bank.cashOut.error.pendingOpen")
    await waitFor(() =>
      expect(text()).toContain("Prepared - not yet seen on chain"),
    )
    expect(useTransactionsStore.getState().transactions).toHaveLength(0)
  })

  it("503 ramp_build_unavailable: not available on this server, no confirm or refresh", async () => {
    buildAnswer = () =>
      json(503, { error: "ramp_build_unavailable", nothingBroadcast: true })
    render(app())
    await waitFor(() => expect(text()).toContain("bank.cashOut.title"))
    await act(async () => {
      fireEvent.change(document.querySelector("input")!, {
        target: { value: "25.5" },
      })
    })
    await click("bank.cashOut.quote.get")
    await waitFor(() => expect(text()).toContain("bank.cashOut.confirm"))
    await click("bank.cashOut.confirm")
    await waitFor(() =>
      expect(text()).toContain("bank.cashOut.error.notAvailable"),
    )
    expect(buttons().map((b) => b.textContent)).not.toContain(
      "bank.cashOut.confirm",
    )
    const builds = sent.filter(
      (s) => s.method === "POST" && s.path === "/v1/ramps",
    )
    expect(builds).toHaveLength(1)
  })
})

describe("no wrapping (guarantee 2)", () => {
  it("a multisig account is refused before the prompt, with the reason shown", async () => {
    wallet.account = { rawAddress: A, address: A, isMultisig: true }
    emit()
    buildAnswer = built({ approveTx: null })
    await toReview()
    await handOver()
    await waitFor(() =>
      expect(text()).toContain("transaction.strict.wrapRefusal.multisig"),
    )
    expect(button("transaction.sign").disabled).toBe(true)
    expect(signer.sendPreparedTransaction).not.toHaveBeenCalled()
  })
})

describe("non-strict transactions keep master's review", () => {
  it("a plain EVM call shows the master review parts and is fee-estimated with its tx", async () => {
    render(app())
    const tx = { ...strictEvmCall(unsigned(REDEEM_DATA)), type: CallType.Evm }
    await act(async () => {
      void useTransactionsStore
        .getState()
        .createTransaction({ tx })
        .catch(() => undefined)
    })
    await waitFor(() => expect(text()).toContain("non-strict-submit"))
    expect(text()).toContain("json-view")
    expect(text()).not.toContain("transaction.strict.description")
    expect(h.estimateFeeArgs).toContain(tx)
    expect(h.paymentInfoArgs).toContain(tx)
  })
})

// ---- fix round 1 (review 3) ---------------------------------------------------
const sendCount = () => signer.sendPreparedTransaction.mock.calls.length
const stepName = () =>
  document.querySelector("[data-step]")?.getAttribute("data-step")

describe("fix round 1", () => {
  it("B-2 (B5): a second cash-out of the SAME amount (same approve bytes) can be signed", async () => {
    signer.script = [
      { kind: "sent", hash: APPROVE_HASH, receipt: "success" },
      { kind: "sent", hash: REDEEM_HASH, receipt: "success" },
      { kind: "sent", hash: `0x${"c3".repeat(32)}`, receipt: "success" },
      { kind: "sent", hash: `0x${"d4".repeat(32)}`, receipt: "success" },
    ]
    await toReview()
    await handOver()
    await signStep()
    await waitFor(() => expect(stepName()).toBe("bank.cashOut.tx.redeemStep"))
    await signStep()
    await waitFor(() => expect(reports()).toHaveLength(1))
    expect(sendCount()).toBe(2)
    const RAMP_B = "00000000-0000-4000-8000-00000000bb02"
    const REDEEM_B = `0x5f5f5f5f${"22".repeat(40)}`
    buildAnswer = built({
      ramp: {
        ...FIXTURE_RAMP_BUILT,
        id: RAMP_B,
        validUntil: "2099-01-01T00:30:00.000Z",
      },
      redeemTx: unsigned(REDEEM_B),
    })
    await click("bank.cashOut.status.back")
    await waitFor(() => expect(text()).toContain("bank.cashOut.title"))
    const realNow = Date.now
    vi.spyOn(Date, "now").mockImplementation(() => realNow() + 25_000)
    // re-render past the quote cool-down
    for (const value of ["25.50", "25.5"])
      await act(async () => {
        fireEvent.change(document.querySelector("input")!, {
          target: { value },
        })
      })
    await click("bank.cashOut.quote.get")
    await waitFor(() => expect(text()).toContain("bank.cashOut.confirm"))
    await click("bank.cashOut.confirm")
    await waitFor(() => expect(text()).toContain("bank.cashOut.review.title"))
    await flush()
    await handOver()
    expect(stepName()).toBe("bank.cashOut.tx.approveStep")
    await signStep()
    await waitFor(() => expect(stepName()).toBe("bank.cashOut.tx.redeemStep"))
    await signStep()
    expect(sendCount()).toBe(4)
    // the same approve bytes went out once per ramp
    expect(signer.sent[2]).toEqual(unsigned(APPROVE_DATA))
    expect(signer.sent[3]).toEqual(unsigned(REDEEM_B))
  })

  it("R10 (B3): a double click on the review Sign hands over ONE transaction (the ref is cleared)", async () => {
    buildAnswer = built({ approveTx: null })
    await toReview()
    const b = button("bank.cashOut.review.sign")
    await act(async () => {
      fireEvent.click(b)
      fireEvent.click(b)
    })
    await flush()
    expect(useTransactionsStore.getState().transactions).toHaveLength(1)
  })

  it("R12: Sign stays disabled while the binding read is pending (unknown is never ok)", async () => {
    h.bindingPending = true
    buildAnswer = built({ approveTx: null })
    signer.script = [{ kind: "sent", hash: REDEEM_HASH, receipt: "success" }]
    await toReview()
    await handOver()
    await flush()
    expect(button("transaction.sign").disabled).toBe(true)
    expect(text()).not.toContain("transaction.strict.wrapRefusal")
    expect(sendCount()).toBe(0)
  })

  it("a speed-up of the redeem reports the NEW hash too", async () => {
    const NEW = `0x${"e5".repeat(32)}`
    buildAnswer = built({ approveTx: null })
    signer.script = [{ kind: "repriced", hash: REDEEM_HASH, newHash: NEW }]
    await toReview()
    await handOver()
    await signStep()
    await waitFor(() => expect(reports()).toHaveLength(2))
    expect(reports().map((r) => r.body)).toEqual([
      { txHash: REDEEM_HASH },
      { txHash: NEW },
    ])
  })

  it("a cancelled redeem (receipt not followed) shows no success toast", async () => {
    buildAnswer = built({ approveTx: null })
    signer.script = [{ kind: "sent", hash: REDEEM_HASH, receipt: "unknown" }]
    await toReview()
    await handOver()
    await signStep()
    await waitFor(() =>
      expect(text()).toContain("bank.cashOut.localChecking.label"),
    )
    const toasts = Object.values(useToastsStore.getState().toasts).flat()
    const mine = toasts.filter((x) => x.meta?.txHash === REDEEM_HASH)
    expect(mine.length).toBeGreaterThan(0)
    expect(mine.some((x) => x.variant === "success")).toBe(false)
    expect(mine.some((x) => x.title === "bank.cashOut.tx.success")).toBe(false)
  })

  it("a bank account without last4 reads its currency only, no '••'", async () => {
    h.last4 = null
    render(app())
    await waitFor(() => expect(text()).toContain("bank.cashOut.title"))
    expect(text()).toContain("bank.cashOut.form.accountNoLast4.usd")
    expect(text()).not.toContain('"last4"')
  })
})
