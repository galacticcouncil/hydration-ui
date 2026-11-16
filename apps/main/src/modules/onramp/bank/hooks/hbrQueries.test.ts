import { readdirSync, readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"

import {
  MutationCache,
  MutationObserver,
  QueryCache,
  QueryClient,
  QueryObserver,
} from "@tanstack/react-query"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { FIXTURE_ONRAMP_VIEWS } from "@/modules/onramp/bank/config/fixtures"
import {
  hbrBankAccountsQuery,
  hbrBindWalletMutation,
  hbrCreateBankAccountMutation,
  hbrCreateCustomerMutation,
  hbrOnboardingQuery,
  hbrOnrampAccountsQuery,
  hbrPendingFilter,
  hbrRequestOnrampAccountMutation,
  hbrRetryOnrampAccountMutation,
  hbrSignInMutation,
} from "@/modules/onramp/bank/hooks/hbrQueries"
import * as hbrQueries from "@/modules/onramp/bank/hooks/hbrQueries"
import {
  hbrSessionAccess,
  useHbrSessionStore,
} from "@/modules/onramp/bank/store/useHbrSessionStore"
import { createHbrService } from "@/modules/onramp/bank/utils/createHbrService"
import { HbrApiError } from "@/modules/onramp/bank/utils/hbrErrors"
import { createHbrFixtureService } from "@/modules/onramp/bank/utils/hbrFixtureService"
import type { HbrService } from "@/modules/onramp/bank/utils/hbrService"
import {
  HBR_QUERY_KEY_PREFIX,
  hbrQueryKeys,
} from "@/modules/onramp/bank/utils/queryKeys"
import { classifySignError } from "@/modules/onramp/bank/utils/signing"
import {
  logMutationError,
  logQueryError,
  SENSITIVE_KEY_ROOTS,
} from "@/utils/queryErrorLog"

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

  it("a sensitive error is logged as name and message, never the server body it carries", async () => {
    const client = appQueryClient()
    await runMutation(client, {
      mutationKey: [HBR_QUERY_KEY_PREFIX, "anything"],
      mutationFn: async () => {
        throw new HbrApiError(400, "bad_request", { value: "echoed-secret" })
      },
    }).catch(() => {})

    expect(logged()).toContain("bad_request")
    expect(logged()).not.toContain("echoed-secret")
  })

  it("a mutation under the HBR key root logs no variables, factory or not", async () => {
    const client = appQueryClient()
    await runMutation(
      client,
      {
        mutationKey: [HBR_QUERY_KEY_PREFIX, "anything"],
        mutationFn: async () => {
          throw new HbrApiError(503, "unavailable")
        },
      },
      "secret-variable",
    ).catch(() => {})

    expect(consoleError).toHaveBeenCalled()
    expect(logged()).not.toContain("secret-variable")
  })

  // A TEXT scan of the bank module's non-test sources. It sees: any import from
  // "@tanstack/react-query" (type-only imports excepted) outside hbrQueries.ts
  // and useHbr.ts, a namespace or aliased import in useHbr.ts, and in useHbr.ts
  // any `useQuery`/`useMutation`/`queryOptions`/`mutationOptions` call, with or
  // without whitespace before the paren, whose argument is not an `hbr*Query(`
  // or `hbr*Mutation(` factory call. Bound: it does not see react-query reached
  // through another module that re-exports it, or code outside this directory;
  // such a query or mutation is still kept out of the log and the persister
  // only if its key is under SENSITIVE_KEY_ROOTS. A dynamic
  // `import("@tanstack/react-query")` is not seen either.
  it("react-query is reached only through hbrQueries.ts factories and useHbr.ts hooks", () => {
    const root = fileURLToPath(new URL("..", import.meta.url))
    const sources = readdirSync(root, { recursive: true, encoding: "utf8" })
      .filter((f) => /\.tsx?$/.test(f) && !/\.test\.tsx?$/.test(f))
      .map((f) => ({ f, text: readFileSync(`${root}/${f}`, "utf8") }))
    const importRe =
      /import\s+(type\s+)?([^;]*?)\s+from\s+["']@tanstack\/react-query["']/g
    const offenders: string[] = []
    for (const { f, text } of sources) {
      const isFactories = f.endsWith("hooks/hbrQueries.ts")
      const isHooks = f.endsWith("hooks/useHbr.ts")
      for (const [, typeOnly, names = ""] of text.matchAll(importRe)) {
        if (typeOnly || isFactories) continue
        if (!isHooks) offenders.push(`${f}: imports react-query`)
        else if (/\*|\bas\b/.test(names))
          offenders.push(`${f}: namespace or aliased react-query import`)
      }
      if (/require\(\s*["']@tanstack\/react-query/.test(text))
        offenders.push(`${f}: requires react-query`)
      if (
        isHooks &&
        /\b(use(Suspense)?(Query|Queries|Mutation|InfiniteQuery)|queryOptions|mutationOptions)\s*\((?!\s*hbr[A-Z]\w*(Query|Mutation)\()/.test(
          text,
        )
      )
        offenders.push(`${f}: a react-query call without an hbr factory`)
    }
    expect(offenders).toEqual([])
  })

  it("a failed bank account create logs no bank detail", async () => {
    setSession(A, "A".repeat(43))
    const fetchFn = vi.fn(async () =>
      jsonResponse(502, { error: "outcome_unknown" }),
    )
    const service = createHbrService({
      baseUrl: "/hbr",
      session: hbrSessionAccess,
      fetchFn,
    })
    const client = appQueryClient()

    await runMutation(
      client,
      hbrCreateBankAccountMutation(service, client, A),
      {
        clientRequestId: "00000000-0000-4000-8000-0000000000a1",
        rail: "sepa",
        iban: "DE89370400440532013000",
        bic: "COBADEFFXXX",
        address: {
          streetLine1: "Secret Street 1",
          city: "Secret City",
          postalCode: "10115",
          country: "DEU",
        },
      },
    ).catch(() => {})

    expect(consoleError).toHaveBeenCalled()
    expect(logged()).toContain("outcome_unknown")
    for (const secret of [
      "DE89370400440532013000",
      "Secret Street",
      "COBADEFF",
    ])
      expect(logged()).not.toContain(secret)
  })

  it("a body the request schema refuses is not sent and its values are not logged (reviewer Z1)", async () => {
    setSession(A, "A".repeat(43))
    const fetchFn = vi.fn()
    const service = createHbrService({
      baseUrl: "/hbr",
      session: hbrSessionAccess,
      fetchFn,
    })
    const client = appQueryClient()
    await runMutation(
      client,
      hbrCreateBankAccountMutation(service, client, A),
      {
        clientRequestId: "00000000-0000-4000-8000-0000000000a1",
        rail: "sepa",
        iban: "DE89370400440532013000",
        bic: "SECRETBIC!!",
        address: {
          streetLine1: "<placeholder>",
          city: "<placeholder>",
          postalCode: "10115",
          country: "deu-SECRETCOUNTRY",
        },
      },
    ).catch(() => {})

    expect(fetchFn).not.toHaveBeenCalled()
    expect(logged()).not.toContain("SECRETBIC")
    expect(logged()).not.toContain("SECRETCOUNTRY")
  })

  it("a failed on-ramp poll after a ready read logs no deposit instruction", async () => {
    setSession(A, "A".repeat(43))
    const ready = {
      accounts: [
        {
          ...FIXTURE_ONRAMP_VIEWS.ready("usd"),
          instructions: {
            accountNumber: "SECRET-ACCOUNT-111",
            routingNumber: "SECRET-ROUTING-222",
            bankName: "<placeholder>",
            beneficiaryName: "<placeholder>",
          },
        },
        FIXTURE_ONRAMP_VIEWS.notRequested("eur"),
      ],
    }
    const fetchFn = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(200, ready))
      .mockResolvedValueOnce(jsonResponse(429, { error: "rate_limited" }))
    const service = createHbrService({
      baseUrl: "/hbr",
      session: hbrSessionAccess,
      fetchFn,
    })
    const client = appQueryClient()
    const options = hbrOnrampAccountsQuery(service, A)

    await client.fetchQuery(options)
    await client.fetchQuery({ ...options, staleTime: 0 }).catch(() => {})

    expect(consoleError).toHaveBeenCalled()
    expect(logged()).not.toContain("SECRET-")
  })

  it("an HBR key fetched outside the factories logs no data (fetchQuery)", async () => {
    const client = appQueryClient()
    let call = 0
    const queryFn = async () => {
      call += 1
      if (call === 1) return ONBOARDING
      throw new HbrApiError(429, "rate_limited")
    }
    const queryKey = hbrQueryKeys.onboarding(A)
    await client.fetchQuery({ queryKey, queryFn, retry: false })
    await client
      .fetchQuery({ queryKey, queryFn, retry: false, staleTime: 0 })
      .catch(() => {})

    expect(consoleError).toHaveBeenCalled()
    expect(logged()).not.toContain("secret-bearer")
  })

  it("setQueryData on an HBR key followed by a failing fetch logs no data", async () => {
    const client = appQueryClient()
    const queryKey = hbrQueryKeys.onboarding(A)
    client.setQueryData(queryKey, ONBOARDING)
    await client
      .fetchQuery({
        queryKey,
        queryFn: async () => {
          throw new HbrApiError(502, "bridge_unavailable")
        },
        retry: false,
        staleTime: 0,
      })
      .catch(() => {})

    expect(consoleError).toHaveBeenCalled()
    expect(logged()).not.toContain("secret-bearer")
  })

  it("every query and mutation factory exported by hbrQueries is under the HBR key root and never pauses", () => {
    // Any argument shape: a proxy that answers every property and call, and
    // reads as an address string where a key needs one.
    const anything: unknown = new Proxy(() => {}, {
      get: (_t, prop) =>
        prop === Symbol.toPrimitive
          ? () => A
          : prop === "toLowerCase"
            ? () => A
            : anything,
      apply: () => anything,
    })
    const factories = Object.entries(hbrQueries).filter(
      ([name, value]) =>
        typeof value === "function" && /^hbr.*(Query|Mutation)$/.test(name),
    )
    expect(factories.length).toBeGreaterThan(0)
    for (const [name, factory] of factories) {
      const options = (
        factory as (...a: unknown[]) => {
          queryKey?: unknown[]
          mutationKey?: unknown[]
          networkMode?: string
        }
      )(anything, anything, A, anything, anything)
      const key = options.queryKey ?? options.mutationKey
      // Keyed under the root, and never paused (a paused mutation is persisted).
      expect([name, key?.[0], options.networkMode]).toEqual([
        name,
        HBR_QUERY_KEY_PREFIX,
        "always",
      ])
    }
  })

  it("the HBR key root is a sensitive root of the global log", () => {
    expect(SENSITIVE_KEY_ROOTS.has(HBR_QUERY_KEY_PREFIX)).toBe(true)
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

describe("bank data is not kept after the screen (rule 5)", () => {
  const dropped = async (
    options: ReturnType<
      typeof hbrOnrampAccountsQuery | typeof hbrBankAccountsQuery
    >,
  ) => {
    const client = appQueryClient()
    const observer = new QueryObserver(client, options as never)
    const unsubscribe = observer.subscribe(() => {})
    await vi.waitFor(() =>
      expect(client.getQueryData(options.queryKey)).toBeDefined(),
    )
    unsubscribe()
    await vi.advanceTimersByTimeAsync(1)
    return client.getQueryCache().find({ queryKey: options.queryKey })
  }

  it("the on-ramp accounts query (deposit instructions) is dropped once unobserved", async () => {
    vi.useFakeTimers()
    const service = {
      forWallet: () => ({
        listOnrampAccounts: async () => ({ accounts: [] }),
      }),
    } as unknown as HbrService
    expect(await dropped(hbrOnrampAccountsQuery(service, A))).toBe(undefined)
  })

  it("the bank-accounts list is dropped once unobserved", async () => {
    vi.useFakeTimers()
    const service = {
      forWallet: () => ({
        listBankAccounts: async () => ({ bankAccounts: [] }),
      }),
    } as unknown as HbrService
    expect(await dropped(hbrBankAccountsQuery(service, A))).toBe(undefined)
  })
})

describe("the on-ramp accounts query polls by status and backs off", () => {
  it("wires getOnrampPollInterval and reads nothing on window focus", () => {
    const options = hbrOnrampAccountsQuery({} as HbrService, A)
    const interval = options.refetchInterval as (q: unknown) => number
    const state = (data: unknown, error: unknown) => ({
      state: { data, error },
    })
    const preparing = {
      accounts: [{ currency: "usd", status: "preparing" }],
    }
    expect(interval(state(preparing, null))).toBe(15_000)
    expect(interval(state({ accounts: [] }, null))).toBe(20_000)
    expect(
      interval(state(preparing, new HbrApiError(429, "rate_limited"))),
    ).toBe(60_000)
    expect(options.refetchOnWindowFocus).toBe(false)
  })
})

describe("the on-ramp accounts query function", () => {
  it("every call of the on-ramp accounts query function is one request", async () => {
    const answer = { accounts: [] }
    const list = vi.fn(async () => answer)
    const service = {
      forWallet: () => ({ listOnrampAccounts: list }),
    } as unknown as HbrService
    const queryFn = hbrOnrampAccountsQuery(service, A).queryFn as unknown as (
      ctx: unknown,
    ) => Promise<unknown>
    const ctx = { client: appQueryClient(), queryKey: [], meta: undefined }
    const results = await Promise.all(
      Array.from({ length: 8 }, () => queryFn(ctx)),
    )
    expect(list).toHaveBeenCalledTimes(8)
    expect(results.every((r) => r === answer)).toBe(true)

    const failure = new HbrApiError(502, "bridge_unavailable")
    list.mockRejectedValueOnce(failure)
    await expect(queryFn(ctx)).rejects.toBe(failure)
  })
})

describe("one in-flight on-ramp action per currency, across a remount", () => {
  it("a pending re-arm for USD is seen by a new observer (a tab round-trip), not for EUR", async () => {
    setSession(A, "A".repeat(43))
    let release: () => void = () => {}
    const held = new Promise<void>((resolve) => {
      release = resolve
    })
    const service = {
      forWallet: () => ({
        retryOnrampAccount: async () => {
          await held
          return { account: {} }
        },
      }),
    } as unknown as HbrService
    const client = appQueryClient()
    const first = new MutationObserver(
      client,
      hbrRetryOnrampAccountMutation(service, client, A),
    )
    void first.mutate("usd").catch(() => {})
    // The tab is switched away and back: the first observer is gone.
    first.reset()

    const usd = hbrPendingFilter(A, "retryOnrampAccount", "usd")
    const eur = hbrPendingFilter(A, "retryOnrampAccount", "eur")
    expect(client.isMutating(usd)).toBe(1)
    expect(client.isMutating(eur)).toBe(0)

    release()
    await vi.waitFor(() => expect(client.isMutating(usd)).toBe(0))
  })

  it("the pending filter names the factories' own mutation keys", () => {
    const client = appQueryClient()
    const service = {} as HbrService
    for (const [factory, action] of [
      [hbrRetryOnrampAccountMutation, "retryOnrampAccount"],
      [hbrRequestOnrampAccountMutation, "requestOnrampAccount"],
      [hbrCreateBankAccountMutation, "createBankAccount"],
    ] as const)
      expect(factory(service, client, A).mutationKey).toEqual(
        hbrPendingFilter(A, action).mutationKey,
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
        message: "Hydration Ramp wallet binding (v3)",
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
