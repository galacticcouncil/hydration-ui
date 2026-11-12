import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryObserver,
} from "@tanstack/react-query"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import {
  hbrBindWalletMutation,
  hbrCreateCustomerMutation,
  hbrMeQuery,
  hbrOnboardingQuery,
  hbrSignInMutation,
  hbrSignOutMutation,
} from "@/modules/onramp/bank/hooks/hbrQueries"
import {
  hbrSessionAccess,
  useHbrSessionStore,
} from "@/modules/onramp/bank/store/useHbrSessionStore"
import { createHbrService } from "@/modules/onramp/bank/utils/createHbrService"
import { HbrApiError } from "@/modules/onramp/bank/utils/hbrErrors"
import { createHbrFixtureService } from "@/modules/onramp/bank/utils/hbrFixtureService"
import type { HbrService } from "@/modules/onramp/bank/utils/hbrService"
import { classifySignError } from "@/modules/onramp/bank/utils/signing"
import { logMutationError, logQueryError } from "@/utils/queryErrorLog"

vi.mock("@galacticcouncil/web3-connect", () => ({
  EIP1193_USER_REJECTED: 4001,
  getEip1193ErrorCode: () => null,
}))

const A = "0x5aaeb6053f3e94c9b9a09f33669435e7ef1beaed"
const B = "0x0000000000000000000000000000000000000b0b"
const SIGNATURE = `0x${"11".repeat(65)}`
const BEARER_LINK = "https://bridge.example/kyc?token=secret-bearer"
const ONBOARDING = {
  customer: { id: "00000000-0000-4000-8000-000000000001", type: "individual" },
  bound: true,
  status: "tos_pending",
  links: {
    kyc: { url: BEARER_LINK, readable: true },
    tos: { url: BEARER_LINK, readable: true },
  },
  rails: {
    usd: { offrampAvailable: false, readable: true, gate: "x" },
    eur: { offrampAvailable: false, readable: true, gate: "x" },
  },
}

// The QueryClient exactly as apps/main/src/App.tsx builds it.
const appQueryClient = () =>
  new QueryClient({
    queryCache: new QueryCache({ onError: logQueryError }),
    mutationCache: new MutationCache({ onError: logMutationError }),
  })

const setSession = (h160: string, token: string) =>
  useHbrSessionStore
    .getState()
    .setSession({ token, h160, expiresAt: "2026-10-23T00:00:00.000Z" })

const jsonResponse = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  })

const runMutation = (
  client: QueryClient,
  options: object,
  variables?: unknown,
) =>
  client
    .getMutationCache()
    .build(client, options as never)
    .execute(variables as never)

let consoleError: ReturnType<typeof vi.spyOn>
const logged = () =>
  consoleError.mock.calls
    .map((args: unknown[]) =>
      args
        .map((a) => {
          try {
            return JSON.stringify(a) ?? String(a)
          } catch {
            return String(a)
          }
        })
        .join(" | "),
    )
    .join("\n")

beforeEach(() => {
  useHbrSessionStore.getState().clear()
  consoleError = vi.spyOn(console, "error").mockImplementation(() => {})
})
afterEach(() => {
  consoleError.mockRestore()
  vi.useRealTimers()
})

describe("the global react-query error log never prints HBR data", () => {
  it("a failed onboarding poll after a good read logs key and error, not the bearer links", async () => {
    setSession(A, "A".repeat(43))
    const fetchFn = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(200, ONBOARDING))
      .mockResolvedValueOnce(jsonResponse(429, { error: "rate_limited" }))
    const service = createHbrService({
      baseUrl: "/hbr",
      session: hbrSessionAccess,
      fetchFn,
    })
    const client = appQueryClient()
    const options = hbrOnboardingQuery(service, A)

    await client.fetchQuery(options)
    await client.fetchQuery({ ...options, staleTime: 0 }).catch(() => {})

    expect(consoleError).toHaveBeenCalled()
    expect(logged()).toContain("rate_limited")
    expect(logged()).not.toContain("secret-bearer")
  })

  it("a failed HBR mutation logs no variables", async () => {
    setSession(A, "A".repeat(43))
    const fetchFn = vi.fn(async () =>
      jsonResponse(503, { error: "unavailable" }),
    )
    const service = createHbrService({
      baseUrl: "/hbr",
      session: hbrSessionAccess,
      fetchFn,
    })
    const client = appQueryClient()
    const options = {
      ...hbrCreateCustomerMutation(service, client, A),
      mutationFn: async (_secret: string) => {
        throw new HbrApiError(503, "unavailable")
      },
    }

    await runMutation(client, options, "secret-variable").catch(() => {})

    expect(consoleError).toHaveBeenCalled()
    expect(logged()).not.toContain("secret-variable")
  })

  it("every HBR query and mutation factory carries the sensitive marker", () => {
    const service = createHbrFixtureService({
      session: hbrSessionAccess,
      delayMs: 0,
    })
    const client = appQueryClient()
    const signer = { signMessage: async () => SIGNATURE }
    for (const options of [
      hbrMeQuery(service, A),
      hbrOnboardingQuery(service, A),
      hbrSignInMutation(service, A, signer),
      hbrSignOutMutation(service, client, A),
      hbrCreateCustomerMutation(service, client, A),
      hbrBindWalletMutation(service, client, A, signer),
    ])
      expect(options.meta).toEqual({ sensitive: true })
  })

  it("a query without the marker keeps today's log (the whole query)", async () => {
    const client = appQueryClient()
    await client
      .fetchQuery({
        queryKey: ["other"],
        queryFn: async () => {
          throw new Error("boom")
        },
        retry: false,
      })
      .catch(() => {})
    const [, , query] = consoleError.mock.calls[0] ?? []
    expect(query).toBe(client.getQueryCache().find({ queryKey: ["other"] }))
  })
})

describe("onboarding answers are not kept after the screen", () => {
  it("the onboarding query is dropped once no observer holds it", async () => {
    vi.useFakeTimers()
    setSession(A, "A".repeat(43))
    const service = {
      forWallet: () => ({ getOnboarding: async () => ONBOARDING }),
    } as unknown as HbrService
    const client = appQueryClient()
    const options = hbrOnboardingQuery(service, A)
    const observer = new QueryObserver(client, options)
    const unsubscribe = observer.subscribe(() => {})
    await vi.waitFor(() =>
      expect(client.getQueryData(options.queryKey)).toBeDefined(),
    )

    unsubscribe()
    await vi.advanceTimersByTimeAsync(1)

    expect(client.getQueryCache().find({ queryKey: options.queryKey })).toBe(
      undefined,
    )
  })
})

describe("sign-in and bind stay with the wallet they started for", () => {
  it("a session the server opened for another wallet is not kept", async () => {
    const service = createHbrFixtureService({
      session: hbrSessionAccess,
      delayMs: 0,
    })
    const other = {
      ...service,
      openSession: async () => ({
        token: "C".repeat(43),
        expiresAt: "2026-10-23T00:00:00.000Z",
        h160: B,
      }),
    }
    const client = appQueryClient()
    const signer = { signMessage: async () => SIGNATURE }

    const error = await runMutation(
      client,
      hbrSignInMutation(other, A, signer),
    ).catch((e: unknown) => e)

    expect(useHbrSessionStore.getState().session).toBeNull()
    expect(classifySignError(error)).toBe("unknown")
  })

  it("a bind started under A is not sent once the session is B's", async () => {
    setSession(A, "A".repeat(43))
    const sent: { path: string; auth: string | undefined }[] = []
    const fetchFn = vi.fn(async (url: string, init?: RequestInit) => {
      const headers = (init?.headers ?? {}) as Record<string, string>
      sent.push({ path: String(url), auth: headers.Authorization })
      return jsonResponse(200, {
        nonce: `0x${"ab".repeat(32)}`,
        message: "Hydration Ramp wallet binding (v2)",
      })
    })
    const service = createHbrService({
      baseUrl: "/hbr",
      session: hbrSessionAccess,
      fetchFn: fetchFn as unknown as typeof fetch,
    })
    // The user switches to B and signs in while A's bind signature is open.
    const signer = {
      signMessage: async () => {
        setSession(B, "B".repeat(43))
        return SIGNATURE
      },
    }
    const client = appQueryClient()

    const error = await runMutation(
      client,
      hbrBindWalletMutation(service, client, A, signer),
    ).catch((e: unknown) => e)

    expect(sent.map((s) => s.path)).toEqual([
      "/hbr/v1/customers/me/bind/challenge",
    ])
    expect(sent.some((s) => s.auth?.includes("B".repeat(43)))).toBe(false)
    expect(error).toMatchObject({ status: 401 })
    expect(useHbrSessionStore.getState().session?.h160).toBe(B)
  })
})
