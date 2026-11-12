import { describe, expect, it } from "vitest"

import {
  buildFixtureOnboarding,
  FIXTURE_ADDRESS,
  FIXTURE_BANK_ACCOUNTS,
  FIXTURE_CREATE_BANK_ACCOUNT,
  FIXTURE_CUSTOMER_ID,
  FIXTURE_DELETE_BANK_ACCOUNT,
  FIXTURE_DEPOSITS,
  FIXTURE_ONBOARDING_SEQUENCE,
  FIXTURE_ONRAMP_ACCOUNTS,
  FIXTURE_QUOTE,
  FIXTURE_RAMP_BUILT,
  FIXTURE_RAMPS,
  FIXTURE_UNBOUND_ONBOARDING,
  renderFixtureBindMessage,
  renderFixtureLoginMessage,
} from "@/modules/onramp/bank/config/fixtures"
import {
  bindChallengeResponseSchema,
  bindVerifyResponseSchema,
  challengeResponseSchema,
  createBankAccountResponseSchema,
  createCustomerResponseSchema,
  deleteBankAccountResponseSchema,
  depositsResponseSchema,
  listBankAccountsResponseSchema,
  listRampsResponseSchema,
  meResponseSchema,
  onboardingResponseSchema,
  onrampAccountsResponseSchema,
  onrampAccountViewSchema,
  rampBuildResponseSchema,
  rampQuoteResponseSchema,
  rampResponseSchema,
  sessionResponseSchema,
} from "@/modules/onramp/bank/config/schemas"

const NONCE = `0x${"ab".repeat(32)}`
const TIME = "2026-10-22T12:00:00.000Z"
const CHECKSUM_ADDRESS = "0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed"

describe("HBR fixtures parse with their route's schema", () => {
  it("auth, customer and bind", () => {
    expect(
      challengeResponseSchema.safeParse({
        nonce: NONCE,
        message: renderFixtureLoginMessage({
          checksumAddress: CHECKSUM_ADDRESS,
          nonce: NONCE,
          issuedAt: TIME,
          expiresAt: TIME,
        }),
        expiresAt: TIME,
      }).success,
    ).toBe(true)
    expect(
      sessionResponseSchema.safeParse({
        token: "a".repeat(43),
        expiresAt: TIME,
        h160: FIXTURE_ADDRESS,
      }).success,
    ).toBe(true)
    expect(
      meResponseSchema.safeParse({
        h160: FIXTURE_ADDRESS,
        customer: { id: FIXTURE_CUSTOMER_ID },
      }).success,
    ).toBe(true)
    expect(
      createCustomerResponseSchema.parse({
        customer: { id: FIXTURE_CUSTOMER_ID, type: "individual" },
      }).customer.type,
    ).toBe("individual")
    expect(
      bindChallengeResponseSchema.safeParse({
        nonce: NONCE,
        message: renderFixtureBindMessage({
          address: FIXTURE_ADDRESS,
          nonce: NONCE,
          issuedAt: TIME,
          expiresAt: TIME,
        }),
      }).success,
    ).toBe(true)
    expect(
      bindVerifyResponseSchema.safeParse({
        customer: { id: FIXTURE_CUSTOMER_ID },
        h160: FIXTURE_ADDRESS,
        chain: "hydration",
      }).success,
    ).toBe(true)
  })

  it("the login message keeps the doc's 11 lines", () => {
    const message = renderFixtureLoginMessage({
      checksumAddress: CHECKSUM_ADDRESS,
      nonce: NONCE,
      issuedAt: TIME,
      expiresAt: TIME,
    })
    expect(message.split("\n")).toHaveLength(11)
  })

  it("every onboarding read of the fixture sequence", () => {
    for (const step of [
      FIXTURE_UNBOUND_ONBOARDING,
      ...FIXTURE_ONBOARDING_SEQUENCE,
    ]) {
      const parsed = onboardingResponseSchema.parse(
        buildFixtureOnboarding({ type: "business", bound: true, ...step }),
      )
      expect(parsed.status).toBe(step.status)
      expect(parsed.links.kyc.readable).toBe(true)
    }
  })

  it("bank accounts, ramps and on-ramp", () => {
    expect(
      createBankAccountResponseSchema.safeParse(FIXTURE_CREATE_BANK_ACCOUNT)
        .success,
    ).toBe(true)
    expect(
      listBankAccountsResponseSchema.parse(FIXTURE_BANK_ACCOUNTS)
        .bankAccounts[0]?.status,
    ).toBe("active")
    expect(
      deleteBankAccountResponseSchema.parse(FIXTURE_DELETE_BANK_ACCOUNT).status,
    ).toBe("deactivated")
    expect(
      rampResponseSchema.parse({ ramp: FIXTURE_RAMP_BUILT }).ramp.status,
    ).toBe("built")
    expect(rampQuoteResponseSchema.safeParse(FIXTURE_QUOTE).success).toBe(true)
    expect(listRampsResponseSchema.safeParse(FIXTURE_RAMPS).success).toBe(true)
    const accounts = onrampAccountsResponseSchema.parse(
      FIXTURE_ONRAMP_ACCOUNTS,
    ).accounts
    expect(accounts.map((a) => a.status)).toEqual(["ready", "not_requested"])
    expect(accounts[0]?.instructions).not.toBeNull()
    expect(depositsResponseSchema.safeParse(FIXTURE_DEPOSITS).success).toBe(
      true,
    )
  })

  it("the build answer of API doc 4, its hex placeholders filled for the test", () => {
    const tx = {
      chainId: 222222,
      from: FIXTURE_ADDRESS,
      to: FIXTURE_ADDRESS,
      data: "0x",
      value: "0x0",
    }
    const parsed = rampBuildResponseSchema.parse({
      ramp: FIXTURE_RAMP_BUILT,
      approveTx: null,
      redeemTx: tx,
      ...FIXTURE_QUOTE,
      validUntil: FIXTURE_RAMP_BUILT.validUntil,
      hollarBurn: "25500000000000000000",
    })
    expect(parsed.redeemTx).toEqual(tx)
  })
})

describe("unknown enum values fail closed", () => {
  const onboarding = (patch: object) =>
    onboardingResponseSchema.parse({
      ...buildFixtureOnboarding({
        type: "individual",
        bound: true,
        status: "active",
        gate: "ok",
      }),
      ...patch,
    })

  it("an unknown onboarding stage and customer type read unknown", () => {
    const parsed = onboarding({
      status: "fully_approved_v2",
      customer: { id: FIXTURE_CUSTOMER_ID, type: "trust" },
    })
    expect(parsed.status).toBe("unknown")
    expect(parsed.customer.type).toBe("unknown")
  })

  it("an unknown ramp status reads unknown and keeps the server's label verbatim", () => {
    const { ramp } = rampResponseSchema.parse({
      ramp: {
        ...FIXTURE_RAMP_BUILT,
        status: "teleported",
        label: "Paid",
        tone: "celebrate",
      },
    })
    expect(ramp.status).toBe("unknown")
    expect(ramp.tone).toBe("unknown")
    expect(ramp.label).toBe("Paid")
  })

  it("an unknown bank-account, deposit and on-ramp status read unknown", () => {
    const account = listBankAccountsResponseSchema.parse({
      bankAccounts: [
        { ...FIXTURE_BANK_ACCOUNTS.bankAccounts[0], status: "frozen" },
      ],
    }).bankAccounts[0]
    expect(account?.status).toBe("unknown")

    const deposit = depositsResponseSchema.parse({
      deposits: [{ ...FIXTURE_DEPOSITS.deposits[0], status: "minted_twice" }],
      unattributed: [],
    }).deposits[0]
    expect(deposit?.status).toBe("unknown")

    const view = onrampAccountViewSchema.parse({
      ...FIXTURE_ONRAMP_ACCOUNTS.accounts[0],
      status: "ready_v2",
    })
    expect(view.status).toBe("unknown")
    expect(view.instructions).toBeNull()
  })

  it("a ready view whose instructions do not parse reads checking with none", () => {
    const view = onrampAccountViewSchema.parse({
      ...FIXTURE_ONRAMP_ACCOUNTS.accounts[0],
      instructions: { iban: "<placeholder>" },
    })
    expect(view.status).toBe("checking")
    expect(view.onrampAvailable).toBe(false)
    expect(view.instructions).toBeNull()
  })

  it("instructions on a view that is not ready are dropped", () => {
    const view = onrampAccountViewSchema.parse({
      ...FIXTURE_ONRAMP_ACCOUNTS.accounts[0],
      status: "preparing",
    })
    expect(view.status).toBe("preparing")
    expect(view.instructions).toBeNull()
  })

  it("an unreadable or non-https hosted link carries no url", () => {
    const parsed = onboarding({
      links: {
        kyc: { url: "https://example.org/", readable: false },
        tos: { url: "http://example.org/", readable: true },
      },
    })
    expect(parsed.links.kyc).toEqual({ url: null, readable: false })
    expect(parsed.links.tos).toEqual({ url: null, readable: false })
  })
})
