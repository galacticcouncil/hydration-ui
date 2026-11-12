import z from "zod/v4"

import {
  bindChallengeResponseSchema,
  bindVerifyRequestSchema,
  bindVerifyResponseSchema,
  challengeRequestSchema,
  ChallengeResponse,
  challengeResponseSchema,
  createBankAccountRequestSchema,
  createBankAccountResponseSchema,
  createCustomerRequestSchema,
  createCustomerResponseSchema,
  CustomerType,
  deleteBankAccountResponseSchema,
  depositsResponseSchema,
  errorBodySchema,
  listBankAccountsResponseSchema,
  listRampsResponseSchema,
  meResponseSchema,
  onboardingResponseSchema,
  onrampAccountRequestSchema,
  onrampAccountResponseSchema,
  onrampAccountsResponseSchema,
  OnrampCurrency,
  rampBuildResponseSchema,
  rampQuoteResponseSchema,
  rampReportRequestSchema,
  rampRequestSchema,
  rampResponseSchema,
  sessionRequestSchema,
  sessionResponseSchema,
} from "@/modules/onramp/bank/config/schemas"
import {
  HbrApiError,
  HbrNetworkError,
  HbrResponseError,
} from "@/modules/onramp/bank/utils/hbrErrors"

type Out<S extends z.ZodType> = z.output<S>
type In<S extends z.ZodType> = z.input<S>
type Signed = { nonce: string; signature: string }

/** One method per `/v1` route of the HBR API (API doc section 4). */
export type HbrService = {
  readonly mode: "http" | "fixture"
  createChallenge: (h160: string) => Promise<ChallengeResponse>
  openSession: (body: Signed) => Promise<Out<typeof sessionResponseSchema>>
  /** Resolves on 204 and on 401 (a 401 after logout counts as done). */
  closeSession: () => Promise<void>
  getMe: () => Promise<Out<typeof meResponseSchema>>
  createCustomer: (
    type: CustomerType,
  ) => Promise<Out<typeof createCustomerResponseSchema>>
  createBindChallenge: () => Promise<Out<typeof bindChallengeResponseSchema>>
  verifyBind: (body: Signed) => Promise<Out<typeof bindVerifyResponseSchema>>
  getOnboarding: () => Promise<Out<typeof onboardingResponseSchema>>
  createBankAccount: (
    body: In<typeof createBankAccountRequestSchema>,
  ) => Promise<Out<typeof createBankAccountResponseSchema>>
  listBankAccounts: () => Promise<Out<typeof listBankAccountsResponseSchema>>
  deleteBankAccount: (
    id: string,
  ) => Promise<Out<typeof deleteBankAccountResponseSchema>>
  quoteRamp: (
    body: In<typeof rampRequestSchema>,
  ) => Promise<Out<typeof rampQuoteResponseSchema>>
  buildRamp: (
    body: In<typeof rampRequestSchema>,
  ) => Promise<Out<typeof rampBuildResponseSchema>>
  reportRamp: (
    id: string,
    txHash: string,
  ) => Promise<Out<typeof rampResponseSchema>>
  listRamps: () => Promise<Out<typeof listRampsResponseSchema>>
  getRamp: (id: string) => Promise<Out<typeof rampResponseSchema>>
  requestOnrampAccount: (
    currency: OnrampCurrency,
  ) => Promise<Out<typeof onrampAccountResponseSchema>>
  listOnrampAccounts: () => Promise<Out<typeof onrampAccountsResponseSchema>>
  retryOnrampAccount: (
    currency: OnrampCurrency,
  ) => Promise<Out<typeof onrampAccountResponseSchema>>
  listDeposits: () => Promise<Out<typeof depositsResponseSchema>>
}

/** Where the service reads the bearer token and reports that it died. */
export type HbrSessionAccess = {
  getToken: () => string | null
  /** Called with the token a 401 refused; the caller discards it and returns to sign-in. */
  onUnauthorized: (token: string | null) => void
}

type RequestOptions<S extends z.ZodType | null> = {
  auth: boolean
  body?: unknown
  schema: S
}

// Path segments the client puts in a URL are our own row ids or a currency.
const segment = (value: string) => encodeURIComponent(value)

export const createHbrHttpService = (args: {
  baseUrl: string
  session: HbrSessionAccess
  fetchFn?: typeof fetch
}): HbrService => {
  const baseUrl = args.baseUrl.replace(/\/+$/, "")
  const fetchFn = args.fetchFn ?? ((...a) => fetch(...a))
  const { session } = args

  async function request<S extends z.ZodType>(
    method: string,
    path: string,
    options: RequestOptions<S>,
  ): Promise<z.output<S>>
  async function request(
    method: string,
    path: string,
    options: RequestOptions<null>,
  ): Promise<undefined>
  async function request(
    method: string,
    path: string,
    options: RequestOptions<z.ZodType | null>,
  ): Promise<unknown> {
    const headers: Record<string, string> = {}
    let token: string | null = null
    if (options.auth) {
      token = session.getToken()
      if (!token) {
        // Nothing sent: there is no session to use.
        session.onUnauthorized(null)
        throw new HbrApiError(401, "unauthorized")
      }
      headers.Authorization = `Bearer ${token}`
    }
    if (options.body !== undefined) headers["Content-Type"] = "application/json"

    let res: Response
    try {
      res = await fetchFn(`${baseUrl}${path}`, {
        method,
        headers,
        body:
          options.body === undefined ? undefined : JSON.stringify(options.body),
        cache: "no-store",
        credentials: "omit",
        // The token never follows a redirect to another host.
        redirect: "error",
      })
    } catch {
      throw new HbrNetworkError()
    }

    // Rule 12: a 401 ends the session; the call is not repeated with this token.
    if (res.status === 401 && options.auth) session.onUnauthorized(token)

    if (!res.ok) {
      const json: unknown = await res.json().catch(() => null)
      const code = errorBodySchema.safeParse(json).data?.error ?? "unknown"
      throw new HbrApiError(res.status, code, json)
    }
    if (options.schema === null) return undefined

    const json: unknown = await res.json().catch(() => undefined)
    const parsed = options.schema.safeParse(json)
    if (!parsed.success) throw new HbrResponseError(res.status)
    return parsed.data
  }

  return {
    mode: "http",
    createChallenge: (h160) =>
      request("POST", "/v1/auth/challenge", {
        auth: false,
        body: challengeRequestSchema.parse({ h160 }),
        schema: challengeResponseSchema,
      }),
    openSession: (body) =>
      request("POST", "/v1/auth/session", {
        auth: false,
        body: sessionRequestSchema.parse(body),
        schema: sessionResponseSchema,
      }),
    closeSession: async () => {
      try {
        await request("DELETE", "/v1/auth/session", {
          auth: true,
          schema: null,
        })
      } catch (error) {
        if (error instanceof HbrApiError && error.status === 401) return
        throw error
      }
    },
    getMe: () =>
      request("GET", "/v1/me", { auth: true, schema: meResponseSchema }),
    createCustomer: (type) =>
      request("POST", "/v1/customers", {
        auth: true,
        body: createCustomerRequestSchema.parse({ type }),
        schema: createCustomerResponseSchema,
      }),
    createBindChallenge: () =>
      request("POST", "/v1/customers/me/bind/challenge", {
        auth: true,
        body: {},
        schema: bindChallengeResponseSchema,
      }),
    verifyBind: (body) =>
      request("POST", "/v1/customers/me/bind/verify", {
        auth: true,
        body: bindVerifyRequestSchema.parse(body),
        schema: bindVerifyResponseSchema,
      }),
    getOnboarding: () =>
      request("GET", "/v1/customers/me/onboarding", {
        auth: true,
        schema: onboardingResponseSchema,
      }),
    createBankAccount: (body) =>
      request("POST", "/v1/bank-accounts", {
        auth: true,
        body: createBankAccountRequestSchema.parse(body),
        schema: createBankAccountResponseSchema,
      }),
    listBankAccounts: () =>
      request("GET", "/v1/bank-accounts", {
        auth: true,
        schema: listBankAccountsResponseSchema,
      }),
    deleteBankAccount: (id) =>
      request("DELETE", `/v1/bank-accounts/${segment(id)}`, {
        auth: true,
        schema: deleteBankAccountResponseSchema,
      }),
    quoteRamp: (body) =>
      request("POST", "/v1/ramps/quote", {
        auth: true,
        body: rampRequestSchema.parse(body),
        schema: rampQuoteResponseSchema,
      }),
    buildRamp: (body) =>
      request("POST", "/v1/ramps", {
        auth: true,
        body: rampRequestSchema.parse(body),
        schema: rampBuildResponseSchema,
      }),
    reportRamp: (id, txHash) =>
      request("POST", `/v1/ramps/${segment(id)}/report`, {
        auth: true,
        body: rampReportRequestSchema.parse({ txHash }),
        schema: rampResponseSchema,
      }),
    listRamps: () =>
      request("GET", "/v1/ramps", {
        auth: true,
        schema: listRampsResponseSchema,
      }),
    getRamp: (id) =>
      request("GET", `/v1/ramps/${segment(id)}`, {
        auth: true,
        schema: rampResponseSchema,
      }),
    requestOnrampAccount: (currency) =>
      request("POST", "/v1/onramp/accounts", {
        auth: true,
        body: onrampAccountRequestSchema.parse({ currency }),
        schema: onrampAccountResponseSchema,
      }),
    listOnrampAccounts: () =>
      request("GET", "/v1/onramp/accounts", {
        auth: true,
        schema: onrampAccountsResponseSchema,
      }),
    retryOnrampAccount: (currency) =>
      request("POST", `/v1/onramp/accounts/${segment(currency)}/retry`, {
        auth: true,
        schema: onrampAccountResponseSchema,
      }),
    listDeposits: () =>
      request("GET", "/v1/onramp/deposits", {
        auth: true,
        schema: depositsResponseSchema,
      }),
  }
}
