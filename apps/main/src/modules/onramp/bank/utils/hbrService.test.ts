import { beforeEach, describe, expect, it, vi } from "vitest"

import {
  hbrSessionAccess,
  liveSessionFor,
  useHbrSessionStore,
} from "@/modules/onramp/bank/store/useHbrSessionStore"
import { createHbrService } from "@/modules/onramp/bank/utils/createHbrService"
import { HbrApiError } from "@/modules/onramp/bank/utils/hbrErrors"
import { createHbrFixtureService } from "@/modules/onramp/bank/utils/hbrFixtureService"
import { getOpenRails } from "@/modules/onramp/bank/utils/onboarding"

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

  it("walks the whole onboarding: sign-in, customer, bind, KYC pending to approved", async () => {
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
    await service.forWallet(H160).createCustomer("business")
    expect((await service.forWallet(H160).getOnboarding()).bound).toBe(false)

    const bind = await service.forWallet(H160).createBindChallenge()
    await service
      .forWallet(H160)
      .verifyBind({ nonce: bind.nonce, signature: SIGNATURE })

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
    await api.createCustomer("individual")
    const bind = await api.createBindChallenge()
    await api.verifyBind({ nonce: bind.nonce, signature: SIGNATURE })
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
    expect(eur.account).toMatchObject({ status: "refused", retryAllowed: true })

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
