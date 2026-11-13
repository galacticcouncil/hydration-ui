// @vitest-environment jsdom
/*
 * Review 4a B3: the bank session ends on a wallet disconnect or change, with
 * or without a bank screen mounted. Rendered: the REAL HbrSessionGuard (as
 * App.tsx mounts it), the session store with its sessionStorage entry, the
 * query cache, and the REAL BankFlow for the sign-in that follows. Replaced:
 * the wallet, the UI kit, i18n and fetch.
 */
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { act, cleanup, render, waitFor } from "@testing-library/react"
import { useSyncExternalStore } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

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
  useTranslation: () => ({ t: (k: string) => k }),
  initReactI18next: { type: "3rdParty", init: () => {} },
}))
vi.mock("@/i18n", () => ({ default: { t: (k: string) => k } }))
vi.mock("@/config/env", () => ({
  ENV: { VITE_HBR_API_URL: "https://hbr.test" },
}))

import { BankFlow } from "@/modules/onramp/bank/components/BankFlow"
import { HbrSessionGuard } from "@/modules/onramp/bank/components/HbrSessionGuard"
import { useHbrSessionStore } from "@/modules/onramp/bank/store/useHbrSessionStore"
import { hbrQueryKeys } from "@/modules/onramp/bank/utils/queryKeys"

const A = "0x1111111111111111111111111111111111111111"
const B = "0x2222222222222222222222222222222222222222"

let client: QueryClient
const setWallet = (w: string | null) =>
  act(() => {
    walletState.account = w ? { rawAddress: w, address: w } : null
    walletState.signer = w ? new FakeEthSigner(w) : null
    emit()
  })
const signIn = (w: string) =>
  useHbrSessionStore.getState().setSession({
    token: "a".repeat(43),
    h160: w,
    expiresAt: "2099-01-01T00:00:00.000Z",
  })
const stored = () =>
  Array.from({ length: sessionStorage.length }, (_, i) =>
    sessionStorage.key(i),
  ).filter((k) => k?.startsWith("hbr-session:"))
const mountGuardOnly = () =>
  render(
    <QueryClientProvider client={client}>
      <HbrSessionGuard />
    </QueryClientProvider>,
  )

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response("{}", { status: 404 })),
  )
  client = new QueryClient()
  useHbrSessionStore.getState().clear()
  sessionStorage.clear()
  walletState.account = null
  walletState.signer = null
  emit()
})
afterEach(() => {
  cleanup()
  client.clear()
  vi.unstubAllGlobals()
})

describe("HbrSessionGuard: the session ends with the wallet (review 4a B3)", () => {
  it("disconnect with no bank screen: memory, sessionStorage and HBR queries cleared", async () => {
    await setWallet(A)
    mountGuardOnly()
    signIn(A)
    client.setQueryData(hbrQueryKeys.me(A), { h160: A })
    expect(stored()).toHaveLength(1)
    await setWallet(null)
    expect(useHbrSessionStore.getState().session).toBeNull()
    expect(stored()).toEqual([])
    expect(client.getQueryCache().findAll({ queryKey: ["hbr"] })).toEqual([])
  })

  it("disconnect, then reconnect the same wallet: sign-in is required", async () => {
    await setWallet(A)
    mountGuardOnly()
    signIn(A)
    await setWallet(null)
    await setWallet(A)
    expect(useHbrSessionStore.getState().session).toBeNull()
    render(
      <QueryClientProvider client={client}>
        <BankFlow direction="deposit" />
      </QueryClientProvider>,
    )
    await waitFor(() =>
      expect(document.body.textContent).toContain("bank.signIn.cta"),
    )
  })

  it("switch A -> B -> A with no bank screen: sign-in is required for A", async () => {
    await setWallet(A)
    mountGuardOnly()
    signIn(A)
    await setWallet(B)
    expect(useHbrSessionStore.getState().session).toBeNull()
    expect(stored()).toEqual([])
    await setWallet(A)
    expect(useHbrSessionStore.getState().session).toBeNull()
    expect(stored()).toEqual([])
  })

  it("a page load (no account, then the reconnected wallet) keeps the stored session", async () => {
    signIn(A)
    mountGuardOnly()
    await setWallet(A)
    expect(useHbrSessionStore.getState().session?.h160).toBe(A)
    expect(stored()).toHaveLength(1)
  })
})

// A TEXT check of App.tsx: it sees that the guard is rendered inside the app's
// QueryClientProvider, before the router. Bound: it does not render the app.
describe("App.tsx mounts the guard once, at the root", () => {
  it("renders <HbrSessionGuard /> inside QueryClientProvider, outside any route", async () => {
    const { readFileSync } = await import("node:fs")
    // vitest runs from apps/main
    const app = readFileSync("src/App.tsx", "utf8")
    const provider = app.indexOf("<QueryClientProvider client={queryClient}>")
    const guard = app.indexOf("<HbrSessionGuard />")
    const router = app.indexOf("<RouterProvider")
    expect(provider).toBeGreaterThan(-1)
    expect(guard).toBeGreaterThan(provider)
    expect(router).toBeGreaterThan(guard)
  })
})
