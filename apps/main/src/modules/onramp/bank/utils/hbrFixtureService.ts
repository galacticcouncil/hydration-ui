import { getAddress } from "viem"

import {
  buildFixtureOnboarding,
  FIXTURE_BANK_ACCOUNTS,
  FIXTURE_CREATE_BANK_ACCOUNT,
  FIXTURE_CUSTOMER_ID,
  FIXTURE_DELETE_BANK_ACCOUNT,
  FIXTURE_DEPOSITS,
  FIXTURE_ONBOARDING_SEQUENCE,
  FIXTURE_ONRAMP_ACCOUNTS,
  FIXTURE_QUOTE,
  FIXTURE_RAMP_BUILD_REFUSAL,
  FIXTURE_RAMP_BUILT,
  FIXTURE_RAMPS,
  FIXTURE_UNBOUND_ONBOARDING,
  renderFixtureBindMessage,
  renderFixtureLoginMessage,
} from "@/modules/onramp/bank/config/fixtures"
import {
  bindChallengeResponseSchema,
  bindVerifyResponseSchema,
  challengeRequestSchema,
  challengeResponseSchema,
  createBankAccountRequestSchema,
  createBankAccountResponseSchema,
  createCustomerRequestSchema,
  createCustomerResponseSchema,
  CustomerType,
  deleteBankAccountResponseSchema,
  depositsResponseSchema,
  listBankAccountsResponseSchema,
  listRampsResponseSchema,
  meResponseSchema,
  onboardingResponseSchema,
  onrampAccountRequestSchema,
  onrampAccountResponseSchema,
  onrampAccountsResponseSchema,
  rampQuoteResponseSchema,
  rampReportRequestSchema,
  rampRequestSchema,
  rampResponseSchema,
  sessionRequestSchema,
  sessionResponseSchema,
} from "@/modules/onramp/bank/config/schemas"
import { HbrApiError } from "@/modules/onramp/bank/utils/hbrErrors"
import {
  HbrService,
  HbrSessionAccess,
  NO_SESSION,
} from "@/modules/onramp/bank/utils/hbrService"

const LOGIN_TTL_MS = 10 * 60_000 // DEFAULT_LOGIN_TTL_MS (walletSession.mjs)
const SESSION_TTL_MS = 12 * 60 * 60_000 // SESSION_ABSOLUTE_TTL_MS (walletSession.mjs)

type WalletState = {
  customerType: CustomerType | null
  bound: boolean
  onboardingReads: number
}

const randomBytes = (length: number) =>
  crypto.getRandomValues(new Uint8Array(length))

const randomHex32 = () =>
  `0x${Array.from(randomBytes(32), (b) => b.toString(16).padStart(2, "0")).join("")}`

// 32 random bytes as unpadded base64url: 43 characters, the server's token shape.
const randomToken = () =>
  btoa(String.fromCharCode(...randomBytes(32)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "")

/**
 * An in-memory stand-in for the HBR server, used when `VITE_HBR_API_URL` is
 * unset (the testnet app, API doc rule 18). It walks the onboarding of
 * section 2 per wallet: sign-in, customer, bind, then KYC pending, under
 * review and approved over three onboarding reads. It never verifies a
 * signature and never hands out a transaction: the off-ramp build answers
 * `503 ramp_build_unavailable` as a server that builds no redeem does.
 */
export const createHbrFixtureService = (args: {
  session: HbrSessionAccess
  delayMs?: number
}): HbrService => {
  const { session } = args
  const delayMs = args.delayMs ?? 300
  const wallets = new Map<string, WalletState>()
  const sessions = new Map<string, string>()
  const challenges = new Map<
    string,
    { h160: string; kind: "login" | "bind"; expiresAt: number }
  >()

  const settle = () =>
    delayMs > 0
      ? new Promise<void>((resolve) => setTimeout(resolve, delayMs))
      : Promise.resolve()

  const walletOf = (h160: string): WalletState => {
    const known = wallets.get(h160)
    if (known) return known
    const fresh = { customerType: null, bound: false, onboardingReads: 0 }
    wallets.set(h160, fresh)
    return fresh
  }

  const authed = async (expected: string) => {
    await settle()
    const token = session.getToken(expected.toLowerCase())
    if (!token) throw new HbrApiError(401, NO_SESSION)
    const h160 = sessions.get(token)
    if (h160 !== expected.toLowerCase()) {
      session.onUnauthorized(token)
      throw new HbrApiError(401, "unauthorized", { error: "unauthorized" })
    }
    return { h160, wallet: walletOf(h160) }
  }

  const refuse = (status: number, error: string, extra = {}): never => {
    throw new HbrApiError(status, error, { error, ...extra })
  }

  const withCustomer = async (expected: string) => {
    const ctx = await authed(expected)
    if (!ctx.wallet.customerType) refuse(404, "customer_not_found")
    return ctx
  }

  const takeChallenge = (
    nonce: string,
    kind: "login" | "bind",
    h160?: string,
  ) => {
    const challenge = challenges.get(nonce)
    challenges.delete(nonce)
    if (
      !challenge ||
      challenge.kind !== kind ||
      challenge.expiresAt < Date.now() ||
      (h160 !== undefined && challenge.h160 !== h160)
    )
      return null
    return challenge
  }

  const challengeWindow = () => {
    const now = Date.now()
    return {
      issuedAt: new Date(now).toISOString(),
      expiresAtMs: now + LOGIN_TTL_MS,
      expiresAt: new Date(now + LOGIN_TTL_MS).toISOString(),
    }
  }

  return {
    mode: "fixture",
    createChallenge: async (h160) => {
      await settle()
      const parsed = challengeRequestSchema.safeParse({ h160 })
      if (!parsed.success) return refuse(400, "bad_request")
      const lower = h160.toLowerCase()
      const nonce = randomHex32()
      const w = challengeWindow()
      challenges.set(nonce, {
        h160: lower,
        kind: "login",
        expiresAt: w.expiresAtMs,
      })
      return challengeResponseSchema.parse({
        nonce,
        message: renderFixtureLoginMessage({
          checksumAddress: getAddress(lower),
          nonce,
          issuedAt: w.issuedAt,
          expiresAt: w.expiresAt,
        }),
        expiresAt: w.expiresAt,
      })
    },
    openSession: async (body) => {
      await settle()
      if (!sessionRequestSchema.safeParse(body).success)
        return refuse(400, "bad_request")
      const challenge = takeChallenge(body.nonce, "login")
      if (!challenge) return refuse(401, "unauthorized")
      const token = randomToken()
      sessions.set(token, challenge.h160)
      return sessionResponseSchema.parse({
        token,
        expiresAt: new Date(Date.now() + SESSION_TTL_MS).toISOString(),
        h160: challenge.h160,
      })
    },
    forWallet: (forH160) => ({
      closeSession: async () => {
        await settle()
        const token = session.getToken(forH160.toLowerCase())
        if (token) sessions.delete(token)
      },
      getMe: async () => {
        const { h160, wallet } = await authed(forH160)
        return meResponseSchema.parse({
          h160,
          customer: wallet.bound ? { id: FIXTURE_CUSTOMER_ID } : null,
        })
      },
      createCustomer: async (type) => {
        const { wallet } = await authed(forH160)
        if (!createCustomerRequestSchema.safeParse({ type }).success)
          return refuse(400, "bad_request")
        wallet.customerType ??= type
        return createCustomerResponseSchema.parse({
          customer: { id: FIXTURE_CUSTOMER_ID, type: wallet.customerType },
        })
      },
      createBindChallenge: async () => {
        const { h160, wallet } = await authed(forH160)
        if (!wallet.customerType) return refuse(409, "customer_required")
        if (wallet.bound) return refuse(409, "already_bound")
        const nonce = randomHex32()
        const w = challengeWindow()
        challenges.set(nonce, { h160, kind: "bind", expiresAt: w.expiresAtMs })
        return bindChallengeResponseSchema.parse({
          nonce,
          message: renderFixtureBindMessage({
            address: h160,
            nonce,
            issuedAt: w.issuedAt,
            expiresAt: w.expiresAt,
          }),
        })
      },
      verifyBind: async (body) => {
        const { h160, wallet } = await authed(forH160)
        if (!sessionRequestSchema.safeParse(body).success)
          return refuse(400, "bad_request")
        if (!wallet.customerType) return refuse(409, "customer_required")
        if (wallet.bound) return refuse(409, "already_bound")
        if (!takeChallenge(body.nonce, "bind", h160))
          return refuse(422, "bind_refused")
        wallet.bound = true
        return bindVerifyResponseSchema.parse({
          customer: { id: FIXTURE_CUSTOMER_ID },
          h160,
          chain: "hydration",
        })
      },
      getOnboarding: async () => {
        const { wallet } = await withCustomer(forH160)
        const type = wallet.customerType ?? "individual"
        if (!wallet.bound) {
          return onboardingResponseSchema.parse(
            buildFixtureOnboarding({
              type,
              bound: false,
              ...FIXTURE_UNBOUND_ONBOARDING,
            }),
          )
        }
        const [first, second, last] = FIXTURE_ONBOARDING_SEQUENCE
        const step = [first, second][wallet.onboardingReads] ?? last
        wallet.onboardingReads += 1
        return onboardingResponseSchema.parse(
          buildFixtureOnboarding({ type, bound: true, ...step }),
        )
      },
      createBankAccount: async (body) => {
        await withCustomer(forH160)
        if (!createBankAccountRequestSchema.safeParse(body).success)
          return refuse(400, "bad_request")
        return createBankAccountResponseSchema.parse(
          FIXTURE_CREATE_BANK_ACCOUNT,
        )
      },
      listBankAccounts: async () => {
        await withCustomer(forH160)
        return listBankAccountsResponseSchema.parse(FIXTURE_BANK_ACCOUNTS)
      },
      deleteBankAccount: async () => {
        await withCustomer(forH160)
        return deleteBankAccountResponseSchema.parse(
          FIXTURE_DELETE_BANK_ACCOUNT,
        )
      },
      quoteRamp: async (body) => {
        await withCustomer(forH160)
        if (!rampRequestSchema.safeParse(body).success)
          return refuse(400, "bad_request", { nothingBroadcast: true })
        return rampQuoteResponseSchema.parse(FIXTURE_QUOTE)
      },
      buildRamp: async () => {
        await withCustomer(forH160)
        return refuse(503, FIXTURE_RAMP_BUILD_REFUSAL.error, {
          nothingBroadcast: FIXTURE_RAMP_BUILD_REFUSAL.nothingBroadcast,
        })
      },
      reportRamp: async (_id, txHash) => {
        await withCustomer(forH160)
        if (!rampReportRequestSchema.safeParse({ txHash }).success)
          return refuse(400, "invalid_tx_hash")
        return refuse(404, "ramp_not_found")
      },
      listRamps: async () => {
        await withCustomer(forH160)
        return listRampsResponseSchema.parse(FIXTURE_RAMPS)
      },
      getRamp: async (id) => {
        await withCustomer(forH160)
        if (id !== FIXTURE_RAMP_BUILT.id) return refuse(404, "ramp_not_found")
        return rampResponseSchema.parse({ ramp: FIXTURE_RAMP_BUILT })
      },
      requestOnrampAccount: async (currency) => {
        await withCustomer(forH160)
        if (!onrampAccountRequestSchema.safeParse({ currency }).success)
          return refuse(400, "bad_request")
        const account = FIXTURE_ONRAMP_ACCOUNTS.accounts.find(
          (a) => a.currency === currency,
        )
        return onrampAccountResponseSchema.parse({ account })
      },
      listOnrampAccounts: async () => {
        await withCustomer(forH160)
        return onrampAccountsResponseSchema.parse(FIXTURE_ONRAMP_ACCOUNTS)
      },
      retryOnrampAccount: async () => {
        await withCustomer(forH160)
        return refuse(409, "retry_not_allowed", { reason: "not_held" })
      },
      listDeposits: async () => {
        await withCustomer(forH160)
        return depositsResponseSchema.parse(FIXTURE_DEPOSITS)
      },
    }),
  }
}
