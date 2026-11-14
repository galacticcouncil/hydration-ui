import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import {
  hbrSessionAccess,
  liveSessionFor,
  useHbrSessionStore,
} from "@/modules/onramp/bank/store/useHbrSessionStore"
import {
  classifyCreateBankAccountError,
  classifyRemoveBankAccount,
  isBankAccountSubmissionDone,
} from "@/modules/onramp/bank/utils/bankAccounts"
import { createHbrService } from "@/modules/onramp/bank/utils/createHbrService"
import {
  HbrApiError,
  HbrNetworkError,
  HbrTimeoutError,
} from "@/modules/onramp/bank/utils/hbrErrors"
import { createHbrFixtureService } from "@/modules/onramp/bank/utils/hbrFixtureService"
import {
  HBR_READ_TIMEOUT_MS,
  HBR_WRITE_TIMEOUT_MS,
} from "@/modules/onramp/bank/utils/hbrService"
import {
  classifyBankError,
  classifyCreateCustomerError,
  getOpenRails,
} from "@/modules/onramp/bank/utils/onboarding"
import { classifyOnrampError } from "@/modules/onramp/bank/utils/onramp"
import { classifySignError } from "@/modules/onramp/bank/utils/signing"

vi.mock("@galacticcouncil/web3-connect", () => ({
  EIP1193_USER_REJECTED: 4001,
  getEip1193ErrorCode: () => null,
}))

const TOKEN = "A".repeat(43)
const OTHER_TOKEN = "B".repeat(43)
const H160 = "0x5aaeb6053f3e94c9b9a09f33669435e7ef1beaed"
const SIGNATURE = `0x${"11".repeat(65)}`

// The same wiring the app uses (hooks/useHbr.ts), against the real store.
const session = hbrSessionAccess

const signIn = (token = TOKEN) =>
  useHbrSessionStore
    .getState()
    .setSession({ token, h160: H160, expiresAt: "2026-10-23T00:00:00.000Z" })

const jsonResponse = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  })

beforeEach(() => useHbrSessionStore.getState().clear())

describe("HBR HTTP client session", () => {
  it("a 401 discards the token and is not repeated", async () => {
    signIn()
    const fetchFn = vi.fn(async () =>
      jsonResponse(401, { error: "unauthorized" }),
    )
    const service = createHbrService({ baseUrl: "/hbr", session, fetchFn })

    const error = await service
      .forWallet(H160)
      .getMe()
      .catch((e: unknown) => e)

    expect(error).toBeInstanceOf(HbrApiError)
    expect((error as HbrApiError).status).toBe(401)
    expect(useHbrSessionStore.getState().session).toBeNull()
    expect(fetchFn).toHaveBeenCalledTimes(1)
  })

  it("a late 401 of an older token keeps the newer session", async () => {
    signIn(TOKEN)
    const fetchFn = vi.fn(async () => {
      signIn(OTHER_TOKEN) // a new sign-in lands while the old call is in flight
      return jsonResponse(401, { error: "unauthorized" })
    })
    const service = createHbrService({ baseUrl: "/hbr", session, fetchFn })

    await service
      .forWallet(H160)
      .getMe()
      .catch(() => undefined)

    expect(useHbrSessionStore.getState().session?.token).toBe(OTHER_TOKEN)
  })

  it("sends the bearer token, no credentials and refuses redirects", async () => {
    signIn()
    const fetchFn = vi.fn(async (..._args: Parameters<typeof fetch>) =>
      jsonResponse(200, { h160: H160, customer: null }),
    )
    const service = createHbrService({
      baseUrl: "https://hbr.example.org/",
      session,
      fetchFn,
    })

    await expect(service.forWallet(H160).getMe()).resolves.toEqual({
      h160: H160,
      customer: null,
    })
    const [url, init] = fetchFn.mock.calls[0] ?? []
    expect(url).toBe("https://hbr.example.org/v1/me")
    expect(init?.headers).toEqual({ Authorization: `Bearer ${TOKEN}` })
    expect(init?.redirect).toBe("error")
    expect(init?.credentials).toBe("omit")
  })

  it("without a token nothing is sent", async () => {
    const fetchFn = vi.fn()
    const service = createHbrService({ baseUrl: "/hbr", session, fetchFn })

    await expect(
      service.forWallet(H160).getOnboarding(),
    ).rejects.toBeInstanceOf(HbrApiError)
    expect(fetchFn).not.toHaveBeenCalled()
  })

  it("sign-out treats a 401 as done", async () => {
    signIn()
    const fetchFn = vi.fn(async () =>
      jsonResponse(401, { error: "unauthorized" }),
    )
    const service = createHbrService({ baseUrl: "/hbr", session, fetchFn })

    await expect(
      service.forWallet(H160).closeSession(),
    ).resolves.toBeUndefined()
  })
})

describe("HBR fixture service", () => {
  it("is chosen when no API base is configured", () => {
    expect(createHbrService({ baseUrl: undefined, session }).mode).toBe(
      "fixture",
    )
    expect(createHbrService({ baseUrl: "/hbr", session }).mode).toBe("http")
  })

  it("walks the whole onboarding: sign-in, customer (bound by the sign-in's link grant, #132), KYC pending to approved", async () => {
    const service = createHbrFixtureService({ session, delayMs: 0 })

    const challenge = await service.createChallenge(H160)
    expect(challenge.message).toContain(
      "0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed",
    )
    const opened = await service.openSession({
      nonce: challenge.nonce,
      signature: SIGNATURE,
    })
    useHbrSessionStore.getState().setSession(opened)
    expect((await service.forWallet(H160).getMe()).customer).toBeNull()

    await expect(service.forWallet(H160).getOnboarding()).rejects.toMatchObject(
      {
        status: 404,
        code: "customer_not_found",
      },
    )
    expect(challenge.message).toContain(
      "this also links it to the ramp account you open with it before this message expires",
    )
    await service.forWallet(H160).createCustomer("business")
    // One signature: the create bound the new wallet; the bind says already_bound.
    expect((await service.forWallet(H160).getMe()).customer).not.toBeNull()
    await expect(
      service.forWallet(H160).createBindChallenge(),
    ).rejects.toMatchObject({ status: 409, code: "already_bound" })

    const reads = []
    for (let i = 0; i < 4; i++)
      reads.push(await service.forWallet(H160).getOnboarding())
    expect(reads.map((r) => r.status)).toEqual([
      "tos_pending",
      "kyc_under_review",
      "active",
      "active",
    ])
    expect(reads.map((r) => getOpenRails(r.rails).usd)).toEqual([
      false,
      false,
      true,
      true,
    ])
    expect(reads[0]?.customer.type).toBe("business")
  })

  it("an expired grant binds nothing; a wallet that already had a customer at sign-in gets no grant and binds with the two-step v3 bind", async () => {
    vi.useFakeTimers({ toFake: ["Date"] })
    try {
      vi.setSystemTime(new Date("2026-11-14T12:00:00.000Z"))
      const service = createHbrFixtureService({ session, delayMs: 0 })
      const open = async () => {
        const challenge = await service.createChallenge(H160)
        useHbrSessionStore.getState().setSession(
          await service.openSession({
            nonce: challenge.nonce,
            signature: SIGNATURE,
          }),
        )
      }
      await open()
      // the create comes when the signed message has expired: no bind
      vi.setSystemTime(new Date("2026-11-14T12:10:00.000Z"))
      await service.forWallet(H160).createCustomer("individual")
      expect((await service.forWallet(H160).getMe()).customer).toBeNull()
      // a new sign-in of a wallet with a customer holds no grant
      await open()
      await service.forWallet(H160).createCustomer("individual")
      expect((await service.forWallet(H160).getMe()).customer).toBeNull()
      const bind = await service.forWallet(H160).createBindChallenge()
      expect(bind.message.split("\n")[0]).toBe(
        "Hydration Ramp wallet binding (v3)",
      )
      await service
        .forWallet(H160)
        .verifyBind({ nonce: bind.nonce, signature: SIGNATURE })
      expect((await service.forWallet(H160).getMe()).customer).not.toBeNull()
    } finally {
      vi.useRealTimers()
    }
  })

  it("refuses a reused sign-in nonce and an unknown token", async () => {
    const service = createHbrFixtureService({ session, delayMs: 0 })
    const challenge = await service.createChallenge(H160)
    const body = { nonce: challenge.nonce, signature: SIGNATURE }
    await service.openSession(body)
    await expect(service.openSession(body)).rejects.toMatchObject({
      status: 401,
    })

    signIn(OTHER_TOKEN)
    await expect(service.forWallet(H160).getMe()).rejects.toMatchObject({
      status: 401,
    })
    expect(useHbrSessionStore.getState().session).toBeNull()
  })

  it("hands out no transaction: the build is refused", async () => {
    const service = createHbrFixtureService({ session, delayMs: 0 })
    const challenge = await service.createChallenge(H160)
    useHbrSessionStore.getState().setSession(
      await service.openSession({
        nonce: challenge.nonce,
        signature: SIGNATURE,
      }),
    )
    await service.forWallet(H160).createCustomer("individual")
    await expect(
      service.forWallet(H160).buildRamp({
        bankAccountId: "00000000-0000-4000-8000-0000000000b1",
        usdcAmount: "25",
      }),
    ).rejects.toMatchObject({ status: 503, code: "ramp_build_unavailable" })
  })
})

describe("HBR calls are bound to the session's wallet", () => {
  const WALLET_B = "0x0000000000000000000000000000000000000b0b"

  it("a session matches its own wallet in any case, never another", () => {
    signIn()
    const live = useHbrSessionStore.getState().session
    expect(liveSessionFor(live, H160.toUpperCase().replace("0X", "0x"))).toBe(
      live,
    )
    expect(liveSessionFor(live, WALLET_B)).toBeNull()
    expect(liveSessionFor(null, H160)).toBeNull()
  })

  it("a call made for wallet A under B's session sends nothing and keeps B's session", async () => {
    useHbrSessionStore.getState().setSession({
      token: OTHER_TOKEN,
      h160: WALLET_B,
      expiresAt: "2026-10-23T00:00:00.000Z",
    })
    const fetchFn = vi.fn()
    const service = createHbrService({ baseUrl: "/hbr", session, fetchFn })

    await expect(service.forWallet(H160).getMe()).rejects.toMatchObject({
      status: 401,
    })
    await expect(service.forWallet(H160).getOnboarding()).rejects.toMatchObject(
      { status: 401 },
    )
    expect(fetchFn).not.toHaveBeenCalled()
    expect(useHbrSessionStore.getState().session?.token).toBe(OTHER_TOKEN)
  })
})

describe("HBR fixture service, stage 2 walk", () => {
  const signedIn = async () => {
    const service = createHbrFixtureService({ session, delayMs: 0 })
    const challenge = await service.createChallenge(H160)
    useHbrSessionStore.getState().setSession(
      await service.openSession({
        nonce: challenge.nonce,
        signature: SIGNATURE,
      }),
    )
    const api = service.forWallet(H160)
    // #132: the create binds the new wallet (the sign-in's link grant)
    await api.createCustomer("individual")
    return api
  }
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

  it("adds, lists and removes a bank account; a retry converges", async () => {
    const api = await signedIn()
    expect((await api.listBankAccounts()).bankAccounts).toEqual([])
    const created = await api.createBankAccount(ACH)
    expect((await api.createBankAccount(ACH)).bankAccount.id).toBe(
      created.bankAccount.id,
    )
    await expect(
      api.createBankAccount({ ...ACH, accountNumber: "1234567891" }),
    ).rejects.toMatchObject({ code: "client_request_id_reused" })
    const listed = (await api.listBankAccounts()).bankAccounts
    expect(listed).toHaveLength(1)
    expect(listed[0]).toMatchObject({ currency: "usd", last4: "7890" })
    await api.deleteBankAccount(created.bankAccount.id)
    expect((await api.listBankAccounts()).bankAccounts).toEqual([])
  })

  it("walks on-ramp pending to ready, EUR refused then re-armed, and deposits", async () => {
    const api = await signedIn()
    expect((await api.listDeposits()).deposits).toEqual([])
    await api.requestOnrampAccount("usd")
    const eur = await api.requestOnrampAccount("eur")
    expect(eur.account).toMatchObject({
      status: "refused",
      retryAllowed: true,
    })

    const statuses = []
    for (let i = 0; i < 3; i++)
      statuses.push((await api.listOnrampAccounts()).accounts[0]?.status)
    expect(statuses).toEqual(["preparing", "preparing", "ready"])

    expect((await api.retryOnrampAccount("eur")).account.status).toBe(
      "preparing",
    )
    const deposits = await api.listDeposits()
    expect(new Set(deposits.deposits.map((d) => d.status))).toEqual(
      new Set([
        "waiting_deposit_limit",
        "credited",
        "queued_on_hydration",
        "received_by_bridge",
        "checking",
        "needs_attention",
      ]),
    )
  })
})

describe("HBR HTTP client timeouts", () => {
  afterEach(() => vi.useRealTimers())

  const hung = () =>
    vi.fn(
      (_url: RequestInfo | URL, _init?: RequestInit) =>
        new Promise<Response>(() => {}),
    )

  it("a hung GET fails as HbrTimeoutError after HBR_READ_TIMEOUT_MS, not before", async () => {
    vi.useFakeTimers()
    signIn()
    const fetchFn = hung()
    const service = createHbrService({ baseUrl: "/hbr", session, fetchFn })
    const outcome = service
      .forWallet(H160)
      .listOnrampAccounts()
      .catch((e: unknown) => e)
    await vi.advanceTimersByTimeAsync(HBR_READ_TIMEOUT_MS - 1)
    let settled = false
    void outcome.then(() => (settled = true))
    await Promise.resolve()
    expect(settled).toBe(false)
    await vi.advanceTimersByTimeAsync(1)
    const error = await outcome
    expect(error).toBeInstanceOf(HbrTimeoutError)
    expect(error).toBeInstanceOf(HbrNetworkError)
    expect(fetchFn.mock.calls[0]?.[1]?.signal?.aborted).toBe(true)
  })

  it("a hung POST or DELETE fails as HbrTimeoutError after HBR_WRITE_TIMEOUT_MS", async () => {
    vi.useFakeTimers()
    signIn()
    const service = createHbrService({
      baseUrl: "/hbr",
      session,
      fetchFn: hung(),
    })
    let postDone = false
    let delDone = false
    const post = service
      .forWallet(H160)
      .requestOnrampAccount("usd")
      .catch((e: unknown) => e)
      .finally(() => (postDone = true))
    const del = service
      .forWallet(H160)
      .deleteBankAccount("00000000-0000-4000-8000-0000000000b1")
      .catch((e: unknown) => e)
      .finally(() => (delDone = true))
    // Past the read timeout, a write is still waiting.
    await vi.advanceTimersByTimeAsync(HBR_READ_TIMEOUT_MS + 1000)
    await vi.advanceTimersByTimeAsync(0)
    expect([postDone, delDone]).toEqual([false, false])
    await vi.advanceTimersByTimeAsync(
      HBR_WRITE_TIMEOUT_MS - HBR_READ_TIMEOUT_MS,
    )
    expect(await post).toBeInstanceOf(HbrTimeoutError)
    expect(await del).toBeInstanceOf(HbrTimeoutError)
  })

  it("a body that never finishes also times out", async () => {
    vi.useFakeTimers()
    signIn()
    const fetchFn = vi.fn(async () => {
      const res = new Response(null, { status: 200 })
      Object.defineProperty(res, "json", {
        value: () => new Promise(() => {}),
      })
      return res
    })
    const service = createHbrService({ baseUrl: "/hbr", session, fetchFn })
    const outcome = service
      .forWallet(H160)
      .getMe()
      .catch((e: unknown) => e)
    await vi.advanceTimersByTimeAsync(HBR_READ_TIMEOUT_MS)
    expect(await outcome).toBeInstanceOf(HbrTimeoutError)
  })
})

describe("a timed-out write reads as unknown, never failed or not sent", () => {
  const timeout = new HbrTimeoutError(HBR_WRITE_TIMEOUT_MS)

  it("bank-account create: uncertain, and the clientRequestId is kept for the retry", () => {
    expect(classifyCreateBankAccountError(timeout)).toEqual({
      kind: "uncertain",
    })
    expect(isBankAccountSubmissionDone(timeout)).toBe(false)
  })

  it("every other mutation reads could not confirm", () => {
    expect(classifyOnrampError(timeout)).toEqual({ kind: "unconfirmed" })
    expect(classifyRemoveBankAccount({ error: timeout })).toBe("unconfirmed")
    expect(classifySignError(timeout)).toBe("unconfirmed")
    expect(classifyCreateCustomerError(timeout)).toBe("uncertain")
  })

  it("a timed-out read is a failed read (instructions hidden)", () => {
    const read = new HbrTimeoutError(HBR_READ_TIMEOUT_MS)
    expect(classifyBankError(read)).toBe("unavailable")
  })
})
