// @vitest-environment jsdom
/*
 * The cash-out on the fixture service (owner decision 2026-11-24): a
 * display-only demonstration. Rendered with the REAL BankFlow (withdraw),
 * hooks, stores and the REAL fixture service (no API base, so `mode` is
 * "fixture"), with its delay set to 0. Replaced: the wallet (a stand-in whose
 * provider counts every request), the UI kit, i18n, fetch (fails the test if
 * called) and createTransaction (a spy in the transactions store).
 *
 * Pins invariants 1 (nothing reaches a wallet), 3 (one condition, the
 * service's mode), 4 (the tester is told) and 5 (nothing a real session
 * could mistake). 2a and 2b are pinned in hbrService.test.ts and
 * cashOut.test.ts; 6 (http unchanged) in cashOut.render.test.tsx.
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
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest"

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
    dump: () => JSON.stringify(Object.fromEntries(data)),
  }
  Object.defineProperty(globalThis, "localStorage", {
    value: s,
    configurable: true,
  })
  return s
})

const w = vi.hoisted(() => ({
  account: null as unknown,
  signer: null as unknown,
  listeners: new Set<() => void>(),
  snapshot: { account: null as unknown, signer: null as unknown },
  requestNetworkSwitch: null as unknown as (...a: unknown[]) => unknown,
}))
const emit = () => {
  w.snapshot = { account: w.account, signer: w.signer }
  w.listeners.forEach((l) => l())
}
const subscribe = (l: () => void) => {
  w.listeners.add(l)
  return () => w.listeners.delete(l)
}

// The wallet: on another chain than the build's, so a real review would read
// it and offer the network switch. Every request it gets is counted.
class FakeEthSigner {
  __eth = true
  provider = { request: vi.fn(async () => "0x1") }
  signMessage = vi.fn(() => new Promise<string>(() => {}))
  sendPreparedTransaction = vi.fn()
  constructor(public address: string) {}
}

vi.mock("@galacticcouncil/web3-connect", () => {
  w.requestNetworkSwitch = vi.fn(async () => undefined)
  return {
    useAccount: () => ({
      account: useSyncExternalStore(subscribe, () => w.snapshot).account,
    }),
    useWallet: () => ({
      signer: useSyncExternalStore(subscribe, () => w.snapshot).signer,
    }),
    isEthereumSigner: (s: unknown) =>
      !!s && (s as { __eth?: boolean }).__eth === true,
    requestNetworkSwitch: w.requestNetworkSwitch,
    getEip1193ErrorCode: () => null,
    EIP1193_USER_REJECTED: 4001,
    useWeb3ConnectModal: () => ({ toggle: () => {} }),
    WalletMode: { EVM: "evm" },
  }
})
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
// No VITE_HBR_API_URL: the app's service is the fixture service.
vi.mock("@/config/env", () => ({ ENV: { VITE_BANK_FLOW_ENABLED: true } }))
// The real fixture service, without its 300 ms answer delay.
vi.mock("@/modules/onramp/bank/utils/createHbrService", async () => {
  const fixture = await vi.importActual<
    typeof import("@/modules/onramp/bank/utils/hbrFixtureService")
  >("@/modules/onramp/bank/utils/hbrFixtureService")
  return {
    createHbrService: (args: {
      session: Parameters<typeof fixture.createHbrFixtureService>[0]["session"]
    }) =>
      fixture.createHbrFixtureService({ session: args.session, delayMs: 0 }),
  }
})

import { BankFlow } from "@/modules/onramp/bank/components/BankFlow"
import { FIXTURE_DEMO_RAMP_WALK } from "@/modules/onramp/bank/config/fixtures"
import { useHbrService } from "@/modules/onramp/bank/hooks/useHbr"
import { useBankCashOutStore } from "@/modules/onramp/bank/store/useBankCashOutStore"
import { useHbrSessionStore } from "@/modules/onramp/bank/store/useHbrSessionStore"
import { useStrictEvmLedger } from "@/modules/transactions/utils/strictEvm"
import { useTransactionsStore } from "@/states/transactions"
import { logMutationError, logQueryError } from "@/utils/queryErrorLog"

const A = "0x1111111111111111111111111111111111111111"
const ACH = {
  clientRequestId: "00000000-0000-4000-8000-0000000000a1",
  rail: "ach" as const,
  bankName: "<placeholder bank>",
  accountNumber: "1234567890",
  routingNumber: "123456789",
  checkingOrSavings: "checking" as const,
  address: {
    streetLine1: "<placeholder>",
    city: "<placeholder>",
    state: "NY",
    postalCode: "<placeholder>",
    country: "USA",
  },
}

let client: QueryClient
let signer: FakeEthSigner
const createTransaction = vi.fn(async () => undefined)
const fetchFn = vi.fn(async () => {
  throw new Error("the fixture service sent a request")
})

const flush = async () => {
  await act(async () => {
    await new Promise((r) => setTimeout(r, 0))
  })
  await act(async () => {})
}
const text = () => document.body.textContent ?? ""
const labels = () =>
  Array.from(document.querySelectorAll("button")).map((b) => b.textContent)
const click = async (label: string) => {
  const b = Array.from(document.querySelectorAll("button")).find(
    (x) => x.textContent === label,
  )
  if (!b) throw new Error(`no button ${label}: ${labels().join("|")}`)
  await act(async () => {
    fireEvent.click(b)
  })
  await flush()
}

// One fixture wallet, signed in, active, with one bank account: the state a
// tester reaches on the preview before W01.
beforeAll(async () => {
  const service = useHbrService()
  const challenge = await service.createChallenge(A)
  useHbrSessionStore.getState().setSession(
    await service.openSession({
      nonce: challenge.nonce,
      signature: `0x${"11".repeat(65)}`,
    }),
  )
  const api = service.forWallet(A)
  await api.createCustomer("individual")
  // the fixture's onboarding reads: tos_pending, under review, then active
  await api.getOnboarding()
  await api.getOnboarding()
  await api.createBankAccount(ACH)
})

const setUp = () => {
  vi.stubGlobal("fetch", fetchFn)
  vi.spyOn(console, "error").mockImplementation(() => {})
  client = new QueryClient({
    queryCache: new QueryCache({ onError: logQueryError }),
    mutationCache: new MutationCache({ onError: logMutationError }),
  })
  createTransaction.mockClear()
  useTransactionsStore.setState({ createTransaction })
  useBankCashOutStore.setState({ records: {} })
  useStrictEvmLedger.setState({ entries: {} })
  signer = new FakeEthSigner(A)
  w.account = { rawAddress: A, address: A, isMultisig: false }
  w.signer = signer
  emit()
}
afterEach(() => {
  cleanup()
  client.clear()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

/** W01 -> W02 -> W05 -> Confirm: the demonstration's review is on screen. */
const toReview = async () => {
  render(
    <QueryClientProvider client={client}>
      <BankFlow direction="withdraw" />
    </QueryClientProvider>,
  )
  await waitFor(() => expect(document.querySelector("input")).not.toBeNull())
  await act(async () => {
    fireEvent.change(document.querySelector("input")!, {
      target: { value: "25.5" },
    })
  })
  await click("bank.flow.continue")
  await waitFor(() => expect(text()).toContain("bank.accounts.title"))
  await waitFor(() => expect(labels()).toContain("bank.flow.continue"))
  await click("bank.flow.continue")
  await waitFor(() => expect(labels()).toContain("bank.cashOut.confirm"))
  await click("bank.cashOut.confirm")
  await waitFor(() => expect(text()).toContain("bank.cashOut.review.title"))
  await flush()
}

/** No wallet, signer, provider or transaction call of any kind. */
const expectNothingReachedAWallet = () => {
  expect(createTransaction).not.toHaveBeenCalled()
  expect(signer.provider.request).not.toHaveBeenCalled()
  expect(signer.signMessage).not.toHaveBeenCalled()
  expect(signer.sendPreparedTransaction).not.toHaveBeenCalled()
  expect(w.requestNetworkSwitch).not.toHaveBeenCalled()
  expect(fetchFn).not.toHaveBeenCalled()
}

describe("fixture service: the cash-out is a demonstration", () => {
  it("invariants 1, 3, 4: the review shows the build, says it is a demonstration, and reaches no wallet", async () => {
    setUp()
    await toReview()
    // the build: binding quote, valid-until and the two steps
    expect(text()).toContain("bank.cashOut.quote.bridgeCredited")
    // R5: the valid-until stays, worded without signing
    expect(text()).toContain("bank.cashOut.review.demoValidUntil")
    expect(text()).not.toContain("bank.cashOut.review.validUntil")
    expect(text()).toContain("bank.cashOut.review.stepApprove")
    expect(text()).toContain("bank.cashOut.review.stepRedeem")
    // the tester is told; the button is not signing; no network switch
    expect(text()).toContain("bank.cashOut.review.demoNote")
    expect(text()).not.toContain("bank.cashOut.review.once")
    expect(labels()).toContain("bank.cashOut.review.demoContinue")
    expect(labels()).not.toContain("bank.cashOut.review.sign")
    expect(labels()).not.toContain("bank.cashOut.review.switchNetwork")
    expectNothingReachedAWallet()

    await click("bank.cashOut.review.demoContinue")
    await flush()
    expectNothingReachedAWallet()
  })

  it("invariant 5: the demonstration records nothing a later session could read as a send", async () => {
    setUp()
    await toReview()
    await click("bank.cashOut.review.demoContinue")
    await flush()
    expect(useBankCashOutStore.getState().records).toEqual({})
    expect(useStrictEvmLedger.getState().entries).toEqual({})
    expect(useTransactionsStore.getState().transactions).toEqual([])
    expect(storage.dump()).not.toMatch(/cashOut|strictEvm|0x0{40}/i)
  })

  it("invariant 4: the status says it is a demonstration and walks to Paid over successive reads", async () => {
    setUp()
    await toReview()
    await click("bank.cashOut.review.demoContinue")
    await waitFor(() =>
      expect(document.querySelector("[data-cash-out-status]")).not.toBeNull(),
    )
    expect(text()).toContain("bank.cashOut.status.demoNote")
    const seen: string[] = []
    for (let i = 0; i < FIXTURE_DEMO_RAMP_WALK.length + 2; i++) {
      await waitFor(() =>
        expect(text()).toContain("bank.cashOut.status.amount"),
      )
      const step = FIXTURE_DEMO_RAMP_WALK.find((s) => text().includes(s.label))
      if (step && seen.at(-1) !== step.label) seen.push(step.label)
      if (step?.status === "paid") break
      await act(async () => {
        await client.refetchQueries({ type: "active" })
      })
      await flush()
    }
    expect(seen.at(-1)).toBe("Paid")
    // it advanced over the reads, never backwards
    expect(seen.length).toBeGreaterThan(2)
    const order = FIXTURE_DEMO_RAMP_WALK.map((s) => s.label as string)
    expect(seen.map((l) => order.indexOf(l))).toEqual(
      [...seen.map((l) => order.indexOf(l))].sort((a, b) => a - b),
    )
    expect(text()).toContain("bank.cashOut.status.demoNote")
    expectNothingReachedAWallet()
  })

  it.each([
    ["Not now", "bank.cashOut.review.leave"],
    ["the header Back", "header-back"],
  ])(
    "fix round 1: %s reaches no wallet, records nothing, and the cash-out stays prepared",
    async (_label, button) => {
      setUp()
      await toReview()
      await click(button)
      await waitFor(() =>
        expect(document.querySelector("[data-cash-out-status]")).not.toBeNull(),
      )
      expectNothingReachedAWallet()
      expect(useBankCashOutStore.getState().records).toEqual({})
      expect(useStrictEvmLedger.getState().entries).toEqual({})
      expect(useTransactionsStore.getState().transactions).toEqual([])
      expect(text()).toContain("bank.cashOut.status.demoNote")
      // R7: only Continue starts the walk; reads keep it at its prepared label
      for (let i = 0; i < 4; i++) {
        await act(async () => {
          await client.refetchQueries({ type: "active" })
        })
        await flush()
      }
      expect(text()).toContain(FIXTURE_DEMO_RAMP_WALK[0].label)
      expect(text()).not.toContain(FIXTURE_DEMO_RAMP_WALK[1].label)
      expectNothingReachedAWallet()
    },
  )

  it("fix round 1 (R6): the withdrawals list says it is a demonstration", async () => {
    setUp()
    await toReview()
    await click("bank.cashOut.review.demoContinue")
    await waitFor(() =>
      expect(document.querySelector("[data-cash-out-status]")).not.toBeNull(),
    )
    await click("bank.cashOut.status.viewTransfers")
    await waitFor(() =>
      expect(document.querySelector("[data-ramp-row]")).not.toBeNull(),
    )
    expect(text()).toContain("bank.cashOut.history.demoNote")
    expectNothingReachedAWallet()
  })
})
