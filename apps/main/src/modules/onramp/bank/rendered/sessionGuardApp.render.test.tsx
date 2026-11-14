// @vitest-environment jsdom
/*
 * Review 4a delta 1: the session guard pinned through the REAL App component
 * (replaces the App.tsx text check). Rendered: App.tsx itself, the REAL
 * HbrSessionGuard it mounts, the session store and its sessionStorage entry.
 * Replaced: the wallet (an account store standing in for web3-connect, whose
 * `account` is restored synchronously from localStorage on a page load), the
 * router, theme, data-provider and toaster shells, i18n and the portfolio
 * persister. A route-level mount, a second mount or a removed mount turns
 * these red.
 */
import { act, cleanup, render } from "@testing-library/react"
import { ReactNode, useSyncExternalStore } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const wallet = vi.hoisted(() => {
  const listeners = new Set<() => void>()
  let account: { address: string; rawAddress: string } | null = null
  return {
    get: () => account,
    set: (a: string | null) => {
      account = a ? { address: a, rawAddress: a } : null
      listeners.forEach((l) => l())
    },
    subscribe: (l: () => void) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
  }
})
vi.mock("@galacticcouncil/web3-connect", () => ({
  useAccount: () => ({
    account: useSyncExternalStore(wallet.subscribe, wallet.get),
  }),
}))
const Pass = vi.hoisted(
  () =>
    ({ children }: { children?: ReactNode }) =>
      children ?? null,
)
vi.mock("@galacticcouncil/ui/fonts.css", () => ({}))
vi.mock("@/utils/appUpdate", () => ({}))
vi.mock("@galacticcouncil/ui/theme", () => ({ ThemeProvider: Pass }))
vi.mock("@radix-ui/react-tooltip", () => ({ Provider: Pass }))
vi.mock("@tanstack/react-router", () => ({
  createRouter: () => ({}),
  RouterProvider: () => null,
}))
vi.mock("sonner", () => ({ Toaster: () => null }))
vi.mock("@/api/portfolio", () => ({ setupPortfolioPersistence: () => {} }))
vi.mock("@/components/DataProviderSelect/DataProviderResolver", () => ({
  DataProviderResolver: Pass,
}))
vi.mock("@/components/Page404", () => ({ Page404: () => null }))
vi.mock("@/components/RouteError", () => ({ RouteError: () => null }))
vi.mock("@/i18n", () => ({ default: {} }))
vi.mock("react-i18next", () => ({ I18nextProvider: Pass }))
vi.mock("@/modules/layout/hooks/useRemoveInitialLoader", () => ({
  useRemoveInitialLoader: () => {},
}))
vi.mock("@/modules/tutorials/utils/resetTutorials", () => ({
  applyResetTutorialsParam: () => {},
}))
vi.mock("@/routeTree.gen", () => ({ routeTree: {} }))
vi.mock("@/config/env", () => ({
  ENV: { VITE_HBR_API_URL: "https://hbr.test" },
}))

import { App } from "@/App"
import { useHbrSessionStore } from "@/modules/onramp/bank/store/useHbrSessionStore"

const A = "0x1111111111111111111111111111111111111111"
const B = "0x2222222222222222222222222222222222222222"
const signIn = (h160: string) =>
  useHbrSessionStore.getState().setSession({
    token: "a".repeat(43),
    h160,
    expiresAt: "2099-01-01T00:00:00.000Z",
  })
const stored = () =>
  Array.from({ length: sessionStorage.length }, (_, i) => sessionStorage.key(i))
const setWallet = (a: string | null) => act(async () => wallet.set(a))
const live = () => useHbrSessionStore.getState().session?.h160 ?? null

beforeEach(() => {
  useHbrSessionStore.getState().clear()
  sessionStorage.clear()
  wallet.set(null)
})
afterEach(() => cleanup())

describe("App mounts the session guard: the session ends with the wallet", () => {
  it("disconnect, then reconnect the same wallet: the session is gone", async () => {
    await setWallet(A)
    render(<App />)
    signIn(A)
    await setWallet(null)
    expect(live()).toBeNull()
    expect(stored()).toEqual([])
    await setWallet(A)
    expect(live()).toBeNull()
    expect(stored()).toEqual([])
  })

  it("switch A -> B -> A: the session is gone at the first switch and stays gone", async () => {
    await setWallet(A)
    render(<App />)
    signIn(A)
    await setWallet(B)
    expect(live()).toBeNull()
    expect(stored()).toEqual([])
    await setWallet(A)
    expect(live()).toBeNull()
    expect(stored()).toEqual([])
  })

  it("page load, wallet restored synchronously (web3-connect persist): the stored session is kept", async () => {
    signIn(A)
    useHbrSessionStore.setState({ session: null }) // a reload: memory empty, sessionStorage kept
    wallet.set(A)
    render(<App />)
    await act(async () => {})
    expect(stored()).toEqual([`hbr-session:${A}`])
  })

  it("page load, wallet reconnected after the first render (null, then A): the stored session is kept", async () => {
    signIn(A)
    useHbrSessionStore.setState({ session: null })
    render(<App />)
    await setWallet(A)
    expect(stored()).toEqual([`hbr-session:${A}`])
  })

  it("page load as B with A's entry stored: switching to A clears it (A must sign again)", async () => {
    signIn(A)
    useHbrSessionStore.setState({ session: null })
    wallet.set(B)
    render(<App />)
    await act(async () => {})
    await setWallet(A)
    expect(stored()).toEqual([])
  })
})
