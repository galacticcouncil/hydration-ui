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

// D1-R4: after the local clear, one best-effort DELETE with the captured token.
describe("the guard revokes at the server, best effort", () => {
  const deletes = () =>
    vi
      .mocked(fetch)
      .mock.calls.filter(
        ([url, init]) =>
          String(url).endsWith("/v1/auth/session") &&
          (init as RequestInit | undefined)?.method === "DELETE",
      )

  it("a disconnect sends one DELETE with the token, after the local clear", async () => {
    let sessionAtDelete: unknown = "unset"
    vi.mocked(fetch).mockImplementation(async (_url, init) => {
      if ((init as RequestInit | undefined)?.method === "DELETE")
        sessionAtDelete = useHbrSessionStore.getState().session
      return new Response(null, { status: 204 })
    })
    await setWallet(A)
    mountGuardOnly()
    signIn(A)
    await setWallet(null)
    await act(async () => {})
    expect(deletes()).toHaveLength(1)
    const headers = new Headers(
      (deletes()[0]![1] as RequestInit | undefined)?.headers,
    )
    expect(headers.get("Authorization")).toBe(`Bearer ${"a".repeat(43)}`)
    expect(sessionAtDelete).toBeNull()
  })

  it("a failing DELETE is ignored: no retry, the session stays cleared", async () => {
    vi.mocked(fetch).mockImplementation(async () => {
      throw new TypeError("network")
    })
    await setWallet(A)
    mountGuardOnly()
    signIn(A)
    await setWallet(B)
    await act(async () => {})
    expect(deletes()).toHaveLength(1)
    expect(useHbrSessionStore.getState().session).toBeNull()
  })

  it("no session, no DELETE", async () => {
    await setWallet(A)
    mountGuardOnly()
    await setWallet(null)
    await act(async () => {})
    expect(deletes()).toHaveLength(0)
  })
})
