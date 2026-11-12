import z from "zod/v4"

/**
 * Wire schemas of the HBR API (hydration-ramp `docs/api/README.md`, section 4,
 * every `/v1` route). Unknown fields are stripped, not refused, so a newer
 * server can add fields. An enum value this app does not know parses to
 * "unknown", never to a guess (an unknown state fails closed: it reads
 * "Checking" and offers no action).
 */

export const UNKNOWN = "unknown" as const

const failClosed = <const T extends readonly [string, ...string[]]>(
  values: T,
) =>
  z
    .string()
    .transform((v): T[number] | typeof UNKNOWN =>
      (values as readonly string[]).includes(v) ? (v as T[number]) : UNKNOWN,
    )

const uuid = z.string().regex(/^[0-9a-f-]{36}$/)
const isoTime = z.string()
const h160 = z.string().regex(/^0x[0-9a-fA-F]{40}$/)
const hex32 = z.string().regex(/^0x[0-9a-f]{64}$/)
const signature = z.string().regex(/^0x[0-9a-fA-F]{130}$/)
// USDC base units (6 dp) as a decimal string; never parsed as a float.
const baseUnits = z.string().regex(/^\d+$/)
const nullableString = z.string().nullable()

export const errorBodySchema = z.object({ error: z.string() })

// ---- Auth --------------------------------------------------------------

export const challengeRequestSchema = z.strictObject({ h160 })
export const challengeResponseSchema = z.object({
  nonce: hex32,
  message: z.string().min(1),
  expiresAt: isoTime,
})

export const sessionRequestSchema = z.strictObject({
  nonce: hex32,
  signature,
})
export const sessionResponseSchema = z.object({
  token: z.string().regex(/^[A-Za-z0-9_-]{43}$/),
  expiresAt: isoTime,
  h160,
})

export const meResponseSchema = z.object({
  h160,
  customer: z.object({ id: uuid }).nullable(),
})

// ---- Customer and onboarding ------------------------------------------

export const CUSTOMER_TYPES = ["individual", "business"] as const
export type CustomerType = (typeof CUSTOMER_TYPES)[number]

export const createCustomerRequestSchema = z.strictObject({
  type: z.enum(CUSTOMER_TYPES),
})
const customerSchema = z.object({
  id: uuid,
  type: failClosed(CUSTOMER_TYPES),
})
export const createCustomerResponseSchema = z.object({
  customer: customerSchema,
})

export const bindChallengeResponseSchema = z.object({
  nonce: hex32,
  message: z.string().min(1),
})
export const bindVerifyRequestSchema = sessionRequestSchema
export const bindVerifyResponseSchema = z.object({
  customer: z.object({ id: uuid }),
  h160,
  chain: z.string(),
})

// `deriveBridgeCustomerStatus` (hydration-ramp server/lib/bridge/bridgeStatus.mjs)
// plus "unknown" from the onboarding route. A stage, never an availability.
export const ONBOARDING_STAGES = [
  "tos_pending",
  "kyc_not_started",
  "kyc_incomplete",
  "kyc_under_review",
  "kyc_rejected",
  "customer_paused",
  "endorsement_pending",
  "active",
] as const

// A hosted link is a bearer link: keep it only when readable and https.
const hostedLinkSchema = z
  .object({ url: nullableString, readable: z.boolean() })
  .transform(({ url, readable }) =>
    readable && url !== null && url.startsWith("https://")
      ? { url, readable: true as const }
      : { url: null, readable: false as const },
  )

const railSchema = z.object({
  offrampAvailable: z.boolean(),
  readable: z.boolean(),
  // A fixed code token; only "ok" means available. No copy is built on it.
  gate: nullableString,
})

export const onboardingResponseSchema = z.object({
  customer: customerSchema,
  bound: z.boolean(),
  status: failClosed(ONBOARDING_STAGES),
  links: z.object({ kyc: hostedLinkSchema, tos: hostedLinkSchema }),
  rails: z.object({ usd: railSchema, eur: railSchema }),
})

// ---- Bank accounts -----------------------------------------------------

const addressBase = {
  streetLine1: z.string(),
  streetLine2: z.string().optional(),
  city: z.string(),
  postalCode: z.string(),
  country: z.string().regex(/^[A-Z]{3}$/),
}

export const createBankAccountRequestSchema = z.discriminatedUnion("rail", [
  z.strictObject({
    clientRequestId: uuid,
    rail: z.literal("ach"),
    bankName: z.string(),
    accountNumber: z.string().regex(/^\d{4,17}$/),
    routingNumber: z.string().regex(/^\d{9}$/),
    checkingOrSavings: z.enum(["checking", "savings"]),
    address: z.strictObject({
      ...addressBase,
      state: z.string().regex(/^[A-Z]{2}$/),
    }),
  }),
  z.strictObject({
    clientRequestId: uuid,
    rail: z.literal("sepa"),
    iban: z.string(),
    bic: z.string().regex(/^[A-Z0-9]{8}([A-Z0-9]{3})?$/),
    bankName: z.string().optional(),
    address: z.strictObject(addressBase),
  }),
])

export const createBankAccountResponseSchema = z.object({
  bankAccount: z.object({ id: uuid, externalAccountId: z.string() }),
})

export const listBankAccountsResponseSchema = z.object({
  bankAccounts: z.array(
    z.object({
      id: uuid,
      externalAccountId: z.string(),
      // "unknown" is a failed read: never treat it as inactive.
      status: failClosed(["active", "inactive"]),
      currency: failClosed(["usd", "eur"]).nullable(),
      accountType: failClosed(["us", "iban"]).nullable(),
      last4: nullableString,
      bankName: nullableString,
    }),
  ),
})

export const deleteBankAccountResponseSchema = z.object({
  status: failClosed(["deactivated", "deactivation_pending"]),
  bankAccount: z.object({ id: uuid, state: z.string() }),
})

// ---- Off-ramp ----------------------------------------------------------

// Every status of the label tables (API doc 5.1 and 5.2). The label, tone
// and detail are always shown as the server sent them (rules 2 and 13).
export const RAMP_STATUSES = [
  "built",
  "submitted",
  "uncertain",
  "burn_observed",
  "disputed",
  "credited",
  "unpayable",
  "unpayable_in_parts",
  "redemption_cancelled",
  "cancelled_remint_queued",
  "returned_remint_queued",
  "remint_cancelled",
  "redeem_returned",
  "payout_observed",
  "reminted",
  "returned_reminted",
  "redeem_reverted",
  "expired",
  "built_past_deadline",
  "attribution_ambiguous",
  "fee_limit_checking",
  "late_burn_checking",
  "bridge_unknown",
  "bridge_awaiting_funds",
  "bridge_in_review",
  "bridge_funds_received",
  "bridge_payment_submitted",
  "paid",
  "bridge_canceled",
  "bridge_error",
  "bridge_undeliverable",
  "bridge_returned",
  "bridge_needs_attention",
  "bridge_refund_in_flight",
  "bridge_refund_failed",
  "bridge_refunded",
  "parts_partly_refunded",
  "unlinked_redeem",
  "unlinked_redeem_foreign_recipient",
  "unlinked_redeem_unreadable",
] as const

export const UNLINKED_STATUSES = [
  "unlinked_redeem",
  "unlinked_redeem_foreign_recipient",
  "unlinked_redeem_unreadable",
  "linked_to_ramp",
] as const

export const TONES = ["pending", "attention", "neutral", "success"] as const

const labelled = {
  label: z.string(),
  tone: failClosed(TONES),
  detail: nullableString,
  // `false` in every row of the server's tables; never read for an action.
  retryable: z.boolean(),
}

export const rampViewSchema = z.object({
  id: uuid,
  bankAccountId: uuid,
  usdcAmount: baseUnits,
  validUntil: isoTime,
  createdAt: isoTime.nullable(),
  status: failClosed(RAMP_STATUSES),
  ...labelled,
  unlinkedRedeemId: uuid.nullable(),
})

export const unlinkedRedeemViewSchema = z.object({
  id: uuid,
  status: failClosed(UNLINKED_STATUSES),
  ...labelled,
  rampId: uuid.optional(),
})

export const rampRequestSchema = z.strictObject({
  bankAccountId: uuid,
  usdcAmount: z.string().regex(/^(0|[1-9]\d*)(\.\d{1,6})?$/),
})

export const quoteSchema = z.object({
  usdcAmount: baseUnits,
  psmFee: baseUnits,
  vaultPayout: baseUnits,
  developerFee: baseUnits,
  bridgeCredited: baseUnits,
  floor: baseUnits,
})

export const payoutLimitSchema = z.object({
  refillNeeded: z.boolean(),
  // A LOWER bound in seconds (`payoutLimitOut`, rampRoutes.mjs), or null.
  minRefillSeconds: baseUnits.nullable(),
})

// Sent to the wallet exactly as given; no field is ever edited.
export const unsignedTxSchema = z.object({
  chainId: z.number().int().positive(),
  from: h160,
  to: h160,
  data: z.string().regex(/^0x([0-9a-fA-F]{2})*$/),
  value: z.string().regex(/^0x[0-9a-fA-F]+$/),
})

export const rampBuildResponseSchema = z.object({
  ramp: rampViewSchema,
  approveTx: unsignedTxSchema.nullable(),
  redeemTx: unsignedTxSchema,
  quote: quoteSchema,
  validUntil: isoTime,
  hollarBurn: baseUnits,
  payoutLimit: payoutLimitSchema,
})

export const rampQuoteResponseSchema = z.object({
  quote: quoteSchema,
  payoutLimit: payoutLimitSchema,
})

export const rampReportRequestSchema = z.strictObject({
  txHash: z.string().regex(/^0x[0-9a-fA-F]{64}$/),
})

export const rampResponseSchema = z.object({ ramp: rampViewSchema })

export const listRampsResponseSchema = z.object({
  ramps: z.array(rampViewSchema),
  truncated: z.boolean(),
  unlinkedRedeems: z.array(unlinkedRedeemViewSchema),
  unlinkedRedeemsTruncated: z.boolean(),
})

// ---- On-ramp -----------------------------------------------------------

export const ONRAMP_CURRENCIES = ["usd", "eur"] as const
export type OnrampCurrency = (typeof ONRAMP_CURRENCIES)[number]

export const ONRAMP_ACCOUNT_STATUSES = [
  "not_requested",
  "preparing",
  "checking",
  "waiting_rail",
  "refused",
  "needs_attention",
  "ready",
] as const

export const onrampAccountRequestSchema = z.strictObject({
  currency: z.enum(ONRAMP_CURRENCIES),
})

const instructionText = z.string().min(1)
const paymentRails = z.array(z.string()).min(1)

// INSTRUCTION_FIELDS (hydration-ramp server/lib/onramp/onrampAccountView.mjs).
export const usdInstructionsSchema = z.object({
  accountNumber: instructionText,
  routingNumber: instructionText,
  bankName: instructionText,
  beneficiaryName: instructionText,
  bankAddress: instructionText.optional(),
  beneficiaryAddress: instructionText.optional(),
  paymentRail: instructionText.optional(),
  paymentRails: paymentRails.optional(),
})
export const eurInstructionsSchema = z.object({
  iban: instructionText,
  bic: instructionText,
  accountHolderName: instructionText,
  bankName: instructionText,
  bankAddress: instructionText.optional(),
  beneficiaryName: instructionText.optional(),
  beneficiaryAddress: instructionText.optional(),
  paymentRails: paymentRails.optional(),
})

/**
 * Instructions are kept only on a `ready` view whose instructions parse for
 * its own currency (rule 5). A `ready` view whose instructions do not parse
 * reads "checking", so no bank details are ever shown from a doubtful answer.
 */
export const onrampAccountViewSchema = z
  .object({
    currency: failClosed(ONRAMP_CURRENCIES),
    status: failClosed(ONRAMP_ACCOUNT_STATUSES),
    onrampAvailable: z.boolean(),
    retryAllowed: z.boolean(),
    reason: nullableString.optional(),
    gate: nullableString.optional(),
    instructions: z.unknown().optional(),
    minimumDeposit: baseUnits.optional(),
  })
  .transform(({ instructions, minimumDeposit, ...view }) => {
    const parsed =
      view.status !== "ready"
        ? null
        : view.currency === "usd"
          ? usdInstructionsSchema.safeParse(instructions)
          : view.currency === "eur"
            ? eurInstructionsSchema.safeParse(instructions)
            : null
    if (parsed?.success && minimumDeposit !== undefined) {
      return {
        ...view,
        instructions: parsed.data,
        minimumDeposit,
      }
    }
    return {
      ...view,
      status: view.status === "ready" ? ("checking" as const) : view.status,
      onrampAvailable: false,
      instructions: null,
      minimumDeposit: null,
    }
  })

export const onrampAccountResponseSchema = z.object({
  account: onrampAccountViewSchema,
})
export const onrampAccountsResponseSchema = z.object({
  accounts: z.array(onrampAccountViewSchema),
})

export const DEPOSIT_STATUSES = [
  "received_by_bridge",
  "sent_to_base",
  "arrived",
  "depositing",
  "waiting_deposit_limit",
  "queued_on_hydration",
  "credited",
  "returned",
  "checking",
  "needs_attention",
] as const

const progressSchema = z.object({
  arrived: baseUnits,
  deposited: baseUnits,
  waiting: baseUnits,
  credited: baseUnits,
})

const depositLabelled = {
  status: failClosed(DEPOSIT_STATUSES),
  label: z.string(),
  // A code token, not copy (API doc 4, GET /v1/onramp/deposits).
  detail: nullableString,
  progress: progressSchema,
}

export const depositEntrySchema = z.object({
  id: uuid,
  currency: failClosed(ONRAMP_CURRENCIES),
  amount: z.string(),
  bridgeState: z.string(),
  receivedAt: isoTime.nullable(),
  ...depositLabelled,
})

export const unattributedEntrySchema = z.object({
  txHash: z.string().nullable(),
  beforeDeployment: z.boolean().optional(),
  ...depositLabelled,
})

export const depositsResponseSchema = z.object({
  deposits: z.array(depositEntrySchema),
  unattributed: z.array(unattributedEntrySchema),
})

// ---- Types -------------------------------------------------------------

export type ChallengeResponse = z.infer<typeof challengeResponseSchema>
export type SessionResponse = z.infer<typeof sessionResponseSchema>
export type MeResponse = z.infer<typeof meResponseSchema>
export type CreateCustomerResponse = z.infer<
  typeof createCustomerResponseSchema
>
export type BindChallengeResponse = z.infer<typeof bindChallengeResponseSchema>
export type BindVerifyResponse = z.infer<typeof bindVerifyResponseSchema>
export type OnboardingResponse = z.infer<typeof onboardingResponseSchema>
export type OnboardingStage = OnboardingResponse["status"]
export type CreateBankAccountRequest = z.infer<
  typeof createBankAccountRequestSchema
>
export type CreateBankAccountResponse = z.infer<
  typeof createBankAccountResponseSchema
>
export type ListBankAccountsResponse = z.infer<
  typeof listBankAccountsResponseSchema
>
export type DeleteBankAccountResponse = z.infer<
  typeof deleteBankAccountResponseSchema
>
export type RampRequest = z.infer<typeof rampRequestSchema>
export type RampView = z.infer<typeof rampViewSchema>
export type RampBuildResponse = z.infer<typeof rampBuildResponseSchema>
export type RampQuoteResponse = z.infer<typeof rampQuoteResponseSchema>
export type RampResponse = z.infer<typeof rampResponseSchema>
export type ListRampsResponse = z.infer<typeof listRampsResponseSchema>
export type OnrampAccountView = z.infer<typeof onrampAccountViewSchema>
export type OnrampAccountResponse = z.infer<typeof onrampAccountResponseSchema>
export type OnrampAccountsResponse = z.infer<
  typeof onrampAccountsResponseSchema
>
export type DepositsResponse = z.infer<typeof depositsResponseSchema>
