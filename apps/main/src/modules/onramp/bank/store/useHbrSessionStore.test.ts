import {
  MutationCache,
  MutationObserver,
  QueryCache,
  QueryClient,
} from "@tanstack/react-query"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { hbrSignOutMutation } from "@/modules/onramp/bank/hooks/hbrQueries"
import {
  hbrSessionAccess,
  readStoredSession,
  useHbrSessionStore,
} from "@/modules/onramp/bank/store/useHbrSessionStore"
import { createHbrService } from "@/modules/onramp/bank/utils/createHbrService"
import { createHbrFixtureService } from "@/modules/onramp/bank/utils/hbrFixtureService"
import type { HbrService } from "@/modules/onramp/bank/utils/hbrService"
import { logMutationError, logQueryError } from "@/utils/queryErrorLog"

const A = "0x5aaeb6053f3e94c9b9a09f33669435e7ef1beaed"
const B = "0x0000000000000000000000000000000000000b0b"
const TOKEN_A = "A".repeat(43)
const FUTURE = "2099-01-01T00:00:00.000Z"
const SIGNATURE = `0x${"11".repeat(65)}`

// A sessionStorage stand-in whose every write is visible to the test.
const makeStorage = () => {
  const data = new Map<string, string>()
  return {
    data,
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, String(v)),
    removeItem: (k: string) => void data.delete(k),
    clear: () => data.clear(),
    key: (i: number) => [...data.keys()][i] ?? null,
    get length() {
      return data.size
    },
  }
}
let storage = makeStorage()

/** A reload in the same tab: memory is gone, sessionStorage stays. */
const reload = () => useHbrSessionStore.setState({ session: null })

beforeEach(() => {
  storage = makeStorage()
  vi.stubGlobal("sessionStorage", storage)
  useHbrSessionStore.setState({ session: null })
})
afterEach(() => vi.unstubAllGlobals())

describe("the HBR session token in sessionStorage", () => {
  it("a reload with the same wallet keeps the session", () => {
    useHbrSessionStore
      .getState()
      .setSession({ token: TOKEN_A, h160: A, expiresAt: FUTURE })
    reload()
    expect(hbrSessionAccess.getToken(A)).toBe(TOKEN_A)
    expect(readStoredSession(A.toUpperCase().replace("0X", "0x"))).toEqual({
      token: TOKEN_A,
      h160: A,
      expiresAt: FUTURE,
    })
  })

  it("another wallet's stored token is ignored", () => {
    useHbrSessionStore
      .getState()
      .setSession({ token: TOKEN_A, h160: A, expiresAt: FUTURE })
    reload()
    expect(hbrSessionAccess.getToken(B)).toBeNull()
    expect(readStoredSession(B)).toBeNull()
    // An entry stored under B's key but naming A is not B's either.
    storage.setItem(
      `hbr-session:${B}`,
      JSON.stringify({ token: TOKEN_A, h160: A, expiresAt: FUTURE }),
    )
    expect(hbrSessionAccess.getToken(B)).toBeNull()
  })

  it("a 401 clears storage", async () => {
    useHbrSessionStore
      .getState()
      .setSession({ token: TOKEN_A, h160: A, expiresAt: FUTURE })
    reload()
    const fetchFn = vi.fn(
      async () =>
        new Response(JSON.stringify({ error: "unauthorized" }), {
          status: 401,
        }),
    )
    const service = createHbrService({
      baseUrl: "/hbr",
      session: hbrSessionAccess,
      fetchFn,
    })
    await service
      .forWallet(A)
      .getMe()
      .catch(() => {})
    expect(fetchFn).toHaveBeenCalledTimes(1)
    expect(storage.data.size).toBe(0)
    expect(hbrSessionAccess.getToken(A)).toBeNull()
  })

  it("sign-out clears storage, whatever DELETE answers", async () => {
    useHbrSessionStore
      .getState()
      .setSession({ token: TOKEN_A, h160: A, expiresAt: FUTURE })
    reload() // signed in from storage only
    const service = {
      forWallet: () => ({
        closeSession: async () => {
          throw new Error("network down")
        },
      }),
    } as unknown as HbrService
    const client = new QueryClient()
    await new MutationObserver(client, hbrSignOutMutation(service, client, A))
      .mutate()
      .catch(() => {})
    expect(storage.data.size).toBe(0)
    expect(hbrSessionAccess.getToken(A)).toBeNull()
  })

  it.each([
    [
      "expired",
      { token: TOKEN_A, h160: A, expiresAt: "2000-01-01T00:00:00.000Z" },
    ],
    ["malformed token", { token: "short", h160: A, expiresAt: FUTURE }],
    [
      "an extra field",
      { token: TOKEN_A, h160: A, expiresAt: FUTURE, customer: "x" },
    ],
  ])("an entry that is %s is dropped", (_name, entry) => {
    storage.setItem(`hbr-session:${A}`, JSON.stringify(entry))
    expect(hbrSessionAccess.getToken(A)).toBeNull()
    expect(storage.data.size).toBe(0)
  })

  it("an entry that does not parse is dropped", () => {
    storage.setItem(`hbr-session:${A}`, "{not json")
    expect(readStoredSession(A)).toBeNull()
    expect(storage.data.size).toBe(0)
  })

  it("storage throwing falls back to memory and never throws", () => {
    const throwing = {
      getItem: () => {
        throw new Error("SecurityError")
      },
      setItem: () => {
        throw new Error("QuotaExceededError")
      },
      removeItem: () => {
        throw new Error("SecurityError")
      },
      key: () => {
        throw new Error("SecurityError")
      },
      get length(): number {
        throw new Error("SecurityError")
      },
    }
    vi.stubGlobal("sessionStorage", throwing)
    const store = useHbrSessionStore.getState()
    expect(() =>
      store.setSession({ token: TOKEN_A, h160: A, expiresAt: FUTURE }),
    ).not.toThrow()
    expect(hbrSessionAccess.getToken(A)).toBe(TOKEN_A)
    expect(() => store.discardToken(TOKEN_A)).not.toThrow()
    expect(hbrSessionAccess.getToken(A)).toBeNull()
    expect(() => store.clear()).not.toThrow()
    expect(() => readStoredSession(A)).not.toThrow()

    // And with no sessionStorage at all.
    vi.stubGlobal("sessionStorage", undefined)
    useHbrSessionStore
      .getState()
      .setSession({ token: TOKEN_A, h160: A, expiresAt: FUTURE })
    expect(hbrSessionAccess.getToken(A)).toBe(TOKEN_A)
  })

  it("nothing else is written to storage, and the token reaches no cache", async () => {
    const service = createHbrFixtureService({
      session: hbrSessionAccess,
      delayMs: 0,
    })
    const challenge = await service.createChallenge(A)
    const opened = await service.openSession({
      nonce: challenge.nonce,
      signature: SIGNATURE,
    })
    useHbrSessionStore.getState().setSession(opened)
    const api = service.forWallet(A)
    await api.createCustomer("individual")
    const bind = await api.createBindChallenge()
    await api.verifyBind({ nonce: bind.nonce, signature: SIGNATURE })
    for (let i = 0; i < 3; i++) await api.getOnboarding()
    await api.requestOnrampAccount("usd")
    await api.listOnrampAccounts()

    expect([...storage.data.keys()]).toEqual([`hbr-session:${A}`])
    const entry = JSON.parse(storage.data.get(`hbr-session:${A}`)!)
    expect(Object.keys(entry).sort()).toEqual(["expiresAt", "h160", "token"])

    const client = new QueryClient({
      queryCache: new QueryCache({ onError: logQueryError }),
      mutationCache: new MutationCache({ onError: logMutationError }),
    })
    client.setQueryData(["hbr", A, "me"], await api.getMe())
    const cached = JSON.stringify(
      client
        .getQueryCache()
        .getAll()
        .map((q) => q.state),
    )
    expect(cached).not.toContain(opened.token)
  })
})
