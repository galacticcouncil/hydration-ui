/**
 * Fixture answers of the HBR API for the testnet app, which runs on fixtures
 * only until a production HBR exists (API doc rule 18). Every value comes
 * from hydration-ramp `docs/api/README.md` (section named per fixture) or from
 * the server code named beside it; ids and addresses are the doc's own
 * placeholders. Nothing here is a real customer, account or address.
 */

// API doc 1, "Example values": placeholder ids.
export const FIXTURE_CUSTOMER_ID = "00000000-0000-4000-8000-000000000001"
export const FIXTURE_BANK_ACCOUNT_ID = "00000000-0000-4000-8000-0000000000b1"
export const FIXTURE_EXTERNAL_ACCOUNT_ID =
  "00000000-0000-4000-8000-0000000000c1"
export const FIXTURE_RAMP_ID = "00000000-0000-4000-8000-0000000000d1"
export const FIXTURE_UNLINKED_ID = "00000000-0000-4000-8000-0000000000e1"
export const FIXTURE_DEPOSIT_ID = "00000000-0000-4000-8000-0000000000f1"
// API doc 1: the EIP-55 specification test address.
export const FIXTURE_ADDRESS = "0x5aaeb6053f3e94c9b9a09f33669435e7ef1beaed"
// API doc 4, POST /v1/auth/challenge: the example domain and URI.
export const FIXTURE_APP_ORIGIN = "https://app.example.org"
// API doc 4, GET /v1/customers/me/onboarding: the example link.
export const FIXTURE_HOSTED_LINK = "https://example.org/"

/**
 * The sign-in message, as `renderLoginMessage` renders it (hydration-ramp
 * server/lib/identity/walletSession.mjs, template version 2 since #132: the
 * statement carries the link consent; `Version: 1` is EIP-4361's; example in
 * API doc 4, POST /v1/auth/challenge): 11 lines joined by "\n".
 */
export const renderFixtureLoginMessage = (args: {
  checksumAddress: string
  nonce: string
  issuedAt: string
  expiresAt: string
}) =>
  [
    "app.example.org wants you to sign in with your Ethereum account:",
    args.checksumAddress,
    "",
    "Sign in to the Hydration ramp. If this wallet has no ramp account yet, this also links it to the ramp account you open with it before this message expires, for cash-outs, bank deposits and refunds. Signing this message does not move funds or approve any transaction.",
    "",
    `URI: ${FIXTURE_APP_ORIGIN}`,
    "Version: 1",
    "Chain ID: 222222",
    `Nonce: ${args.nonce}`,
    `Issued At: ${args.issuedAt}`,
    `Expiration Time: ${args.expiresAt}`,
  ].join("\n")

/**
 * The bind message, as `renderBindMessage` renders it (hydration-ramp
 * server/lib/identity/walletBinding.mjs, version 3 since #132; example in API doc 4,
 * POST /v1/customers/me/bind/challenge).
 */
export const renderFixtureBindMessage = (args: {
  address: string
  nonce: string
  issuedAt: string
  expiresAt: string
}) =>
  [
    "Hydration Ramp wallet binding (v3)",
    `URI: ${FIXTURE_APP_ORIGIN}`,
    "",
    "Purpose: link this wallet to your ramp account for cash-outs, bank deposits and refunds.",
    "Signing this message does not move funds or approve any transaction.",
    "",
    "Account (Bridge customer id): <placeholder>",
    `Wallet address: ${args.address}`,
    "Chain id: 222222",
    `Nonce: ${args.nonce}`,
    `Issued at: ${args.issuedAt}`,
    `Expires at: ${args.expiresAt}`,
  ].join("\n")

/**
 * Onboarding reads after the bind, in order; the last one repeats. The first
 * and last are the measured local answers (hydration-ramp
 * docs/runbooks/local-app-test-server.md section 5: `tos_pending` with gate
 * `endorsement_not_approved`, then `active` with gate `ok`); the middle one is
 * the doc's `kyc_under_review` stage (API doc 4, onboarding) with the same
 * closed gate, so the testnet app shows the "under review" screen.
 */
export const FIXTURE_ONBOARDING_SEQUENCE = [
  { status: "tos_pending", gate: "endorsement_not_approved" },
  { status: "kyc_under_review", gate: "endorsement_not_approved" },
  { status: "active", gate: "ok" },
] as const

// A customer not yet bound: the stage of a newly created customer (API doc 4,
// onboarding: "tos_pending (a newly created customer ...)") and the gate of a
// customer with no endorsement (`railAnswer`, bridgeStatus.mjs).
export const FIXTURE_UNBOUND_ONBOARDING = {
  status: "tos_pending",
  gate: "endorsement_absent",
} as const

export const buildFixtureOnboarding = (args: {
  type: string
  bound: boolean
  status: string
  gate: string
}) => {
  const open = args.gate === "ok"
  const rail = { offrampAvailable: open, readable: true, gate: args.gate }
  return {
    customer: { id: FIXTURE_CUSTOMER_ID, type: args.type },
    bound: args.bound,
    status: args.status,
    links: {
      kyc: { url: FIXTURE_HOSTED_LINK, readable: true },
      tos: { url: FIXTURE_HOSTED_LINK, readable: true },
    },
    rails: { usd: { ...rail }, eur: { ...rail } },
  }
}

// ---- Stage 2 and 3 routes: the doc's own examples ---------------------

// API doc 4, POST /v1/bank-accounts (201).
export const FIXTURE_CREATE_BANK_ACCOUNT = {
  bankAccount: {
    id: FIXTURE_BANK_ACCOUNT_ID,
    externalAccountId: FIXTURE_EXTERNAL_ACCOUNT_ID,
  },
}

// API doc 4, GET /v1/bank-accounts.
export const FIXTURE_BANK_ACCOUNTS = {
  bankAccounts: [
    {
      id: FIXTURE_BANK_ACCOUNT_ID,
      externalAccountId: FIXTURE_EXTERNAL_ACCOUNT_ID,
      status: "active",
      currency: "usd",
      accountType: "us",
      last4: "1234",
      bankName: "<placeholder bank>",
    },
  ],
}

// API doc 4, DELETE /v1/bank-accounts/:id (200).
export const FIXTURE_DELETE_BANK_ACCOUNT = {
  status: "deactivated",
  bankAccount: { id: FIXTURE_BANK_ACCOUNT_ID, state: "revoked" },
}

// API doc 4, POST /v1/ramps (201): the `ramp` and `quote` of the example.
export const FIXTURE_RAMP_BUILT = {
  id: FIXTURE_RAMP_ID,
  bankAccountId: FIXTURE_BANK_ACCOUNT_ID,
  usdcAmount: "25500000",
  validUntil: "2026-10-22T12:30:00.000Z",
  createdAt: "2026-10-22T12:00:00.000Z",
  status: "built",
  label: "Prepared - not yet seen on chain",
  tone: "pending",
  detail: null,
  retryable: false,
  unlinkedRedeemId: null,
}

export const FIXTURE_QUOTE = {
  quote: {
    usdcAmount: "25500000",
    psmFee: "12750",
    vaultPayout: "25487250",
    developerFee: "0",
    bridgeCredited: "25487250",
    floor: "2000000",
  },
  payoutLimit: { refillNeeded: false, minRefillSeconds: null },
}

// API doc 4, GET /v1/ramps.
export const FIXTURE_RAMPS = {
  ramps: [
    {
      ...FIXTURE_RAMP_BUILT,
      status: "submitted",
      label: "Checking",
    },
  ],
  truncated: false,
  unlinkedRedeems: [
    {
      id: FIXTURE_UNLINKED_ID,
      status: "unlinked_redeem",
      label: "Checking",
      tone: "attention",
      detail:
        "We saw a redemption from your wallet that we have not matched to an off-ramp yet. We are checking it. Do not send again.",
      retryable: false,
    },
  ],
  unlinkedRedeemsTruncated: false,
}

// API doc rule 16: what a server that builds no redeem answers. The fixture
// service never hands out a transaction a wallet could send.
export const FIXTURE_RAMP_BUILD_REFUSAL = {
  error: "ramp_build_unavailable",
  nothingBroadcast: true,
}

// API doc 4, GET /v1/onramp/accounts.
export const FIXTURE_ONRAMP_ACCOUNTS = {
  accounts: [
    {
      currency: "usd",
      status: "ready",
      onrampAvailable: true,
      retryAllowed: false,
      instructions: {
        accountNumber: "<placeholder>",
        routingNumber: "<placeholder>",
        bankName: "<placeholder>",
        beneficiaryName: "<placeholder>",
        paymentRails: ["<rail token>"],
      },
      minimumDeposit: "1000000",
    },
    {
      currency: "eur",
      status: "not_requested",
      onrampAvailable: false,
      retryAllowed: false,
    },
  ],
}

// API doc 4, GET /v1/onramp/deposits: the example entry.
export const FIXTURE_DEPOSITS = {
  deposits: [
    {
      id: FIXTURE_DEPOSIT_ID,
      currency: "usd",
      amount: "100.00",
      bridgeState: "payment_processed",
      receivedAt: "2026-10-22T12:00:00.000Z",
      status: "waiting_deposit_limit",
      label: "Waiting for deposit limit",
      detail: null,
      progress: {
        arrived: "100000000",
        deposited: "40000000",
        waiting: "60000000",
        credited: "0",
      },
    },
  ],
  unattributed: [],
}

// ---- Stage 2: stateful bank accounts, on-ramp accounts and deposits ----

/**
 * A listed bank account as the local test server answers it after a create
 * (hydration-ramp docs/runbooks/local-app-test-server.md section 5: `status:
 * "active"`, `currency`, `accountType`, `last4` the last 4 digits submitted
 * for ACH and `null` for SEPA, `bankName` `null`).
 */
export const buildFixtureBankAccount = (args: {
  id: string
  externalAccountId: string
  rail: "ach" | "sepa"
  accountNumber?: string
}) => ({
  id: args.id,
  externalAccountId: args.externalAccountId,
  status: "active",
  currency: args.rail === "ach" ? "usd" : "eur",
  accountType: args.rail === "ach" ? "us" : "iban",
  last4:
    args.rail === "ach" && args.accountNumber
      ? args.accountNumber.slice(-4)
      : null,
  bankName: null,
})

// Payment rail tokens measured on Bridge's sandbox (hbr-bridge-xyz skill,
// section 6: USD `ach_push`, `fednow`, `wire`; EUR `sepa`).
const USD_RAILS = ["ach_push", "fednow", "wire"]
const EUR_RAILS = ["sepa"]

/**
 * On-ramp account views (API doc 4, GET /v1/onramp/accounts; statuses of
 * section 5.4). Instructions use the doc's `<placeholder>` values and its
 * per-currency field sets (`INSTRUCTION_FIELDS`, onrampAccountView.mjs).
 */
export const FIXTURE_ONRAMP_VIEWS = {
  notRequested: (currency: "usd" | "eur") => ({
    currency,
    status: "not_requested",
    onrampAvailable: false,
    retryAllowed: false,
  }),
  preparing: (currency: "usd" | "eur") => ({
    currency,
    status: "preparing",
    onrampAvailable: false,
    retryAllowed: false,
  }),
  // Section 5.4: `refused` carries `reason` (null allowed); rule 6: a refused
  // account within the re-arm budget reads `retryAllowed: true`.
  refused: (currency: "usd" | "eur") => ({
    currency,
    status: "refused",
    onrampAvailable: false,
    retryAllowed: true,
    reason: null,
  }),
  ready: (currency: "usd" | "eur") => ({
    currency,
    status: "ready",
    onrampAvailable: true,
    retryAllowed: false,
    instructions:
      currency === "usd"
        ? {
            accountNumber: "<placeholder>",
            routingNumber: "<placeholder>",
            bankName: "<placeholder>",
            beneficiaryName: "<placeholder>",
            paymentRails: USD_RAILS,
          }
        : {
            iban: "<placeholder>",
            bic: "<placeholder>",
            accountHolderName: "<placeholder>",
            bankName: "<placeholder>",
            paymentRails: EUR_RAILS,
          },
    // API doc 4: HBR's default flush minimum, 1 USDC.
    minimumDeposit: "1000000",
  }),
}

const deposit = (
  n: string,
  fields: {
    currency?: "usd" | "eur"
    amount: string
    bridgeState: string
    receivedAt: string | null
    status: string
    label: string
    detail: string | null
    progress: [string, string, string]
  },
) => ({
  id: `00000000-0000-4000-8000-0000000000${n}`,
  currency: fields.currency ?? "usd",
  amount: fields.amount,
  bridgeState: fields.bridgeState,
  receivedAt: fields.receivedAt,
  status: fields.status,
  label: fields.label,
  detail: fields.detail,
  progress: {
    arrived: fields.progress[0],
    deposited: fields.progress[1],
    // `waiting` = arrived - deposited (progressOf, depositAttribution.mjs).
    waiting: (
      BigInt(fields.progress[0]) - BigInt(fields.progress[1])
    ).toString(),
    credited: fields.progress[2],
  },
})

/**
 * Deposits in several statuses. Each status and detail is one the server
 * derives (`chainStatus` and `BEFORE_ARRIVAL`, hydration-ramp
 * server/lib/onramp/depositAttribution.mjs); labels are `DEPOSIT_LABELS`
 * (API doc 5.3); the `waiting_deposit_limit` entry is the doc's own example.
 */
export const FIXTURE_DEPOSIT_HISTORY = {
  deposits: [
    FIXTURE_DEPOSITS.deposits[0],
    deposit("f2", {
      amount: "250.00",
      bridgeState: "payment_processed",
      receivedAt: "2026-10-21T09:30:00.000Z",
      status: "credited",
      label: "Credited",
      detail: null,
      progress: ["250000000", "250000000", "250000000"],
    }),
    deposit("f3", {
      amount: "50.00",
      bridgeState: "payment_processed",
      receivedAt: "2026-10-22T08:00:00.000Z",
      status: "queued_on_hydration",
      label: "Queued on Hydration",
      detail: null,
      progress: ["50000000", "50000000", "0"],
    }),
    deposit("f4", {
      amount: "75.00",
      bridgeState: "funds_received",
      receivedAt: "2026-10-22T11:00:00.000Z",
      status: "received_by_bridge",
      label: "Received by Bridge",
      detail: null,
      progress: ["0", "0", "0"],
    }),
    // An ACH deposit still `funds_scheduled`: no Bridge receipt time yet.
    deposit("f5", {
      amount: "20.00",
      bridgeState: "funds_scheduled",
      receivedAt: null,
      status: "checking",
      label: "Checking",
      detail: "funds_scheduled",
      progress: ["0", "0", "0"],
    }),
    deposit("f6", {
      amount: "0.50",
      bridgeState: "payment_processed",
      receivedAt: "2026-10-20T15:00:00.000Z",
      status: "needs_attention",
      label: "Needs attention",
      detail: "below_flush_minimum",
      progress: ["500000", "0", "0"],
    }),
    deposit("f7", {
      currency: "eur",
      amount: "90.00",
      bridgeState: "payment_processed",
      receivedAt: "2026-10-19T10:00:00.000Z",
      status: "credited",
      label: "Credited",
      detail: null,
      progress: ["97000000", "97000000", "97000000"],
    }),
  ],
  // USDC on the forwarder with no Bridge delivery naming it (API doc 4).
  unattributed: [
    {
      txHash: `0x${"00".repeat(31)}01`,
      status: "arrived",
      label: "Arrived",
      detail: null,
      progress: {
        arrived: "3000000",
        deposited: "0",
        waiting: "3000000",
        credited: "0",
      },
    },
  ],
}

// ---- Stage 3: cash-out --------------------------------------------------

// hydration-ramp server/lib/ramp/redeemBuilder.mjs `computeQuote`: the PSM fee
// rounds DOWN on the amount, the developer fee is zero at launch, FLOOR is 2
// USDC. redeemFeeBps 5 is the live vault value measured 2026-11-05 (hydration-
// ramp CLAUDE.md); it reproduces the doc example (25.5 USDC -> fee 12750).
export const FIXTURE_REDEEM_FEE_BPS = 5n
export const FIXTURE_FLOOR = 2_000_000n

/** The fixture quote for `usdcAmount` (a request decimal string), or null below the floor. */
export const buildFixtureQuote = (usdcAmount: string) => {
  const [whole = "0", fraction = ""] = usdcAmount.split(".")
  const amount = BigInt(whole) * 1_000_000n + BigInt(fraction.padEnd(6, "0"))
  const psmFee = (amount * FIXTURE_REDEEM_FEE_BPS) / 10_000n
  const vaultPayout = amount - psmFee
  if (vaultPayout < FIXTURE_FLOOR) return null
  return {
    quote: {
      usdcAmount: amount.toString(),
      psmFee: psmFee.toString(),
      vaultPayout: vaultPayout.toString(),
      developerFee: "0",
      bridgeCredited: vaultPayout.toString(),
      floor: FIXTURE_FLOOR.toString(),
    },
    payoutLimit: FIXTURE_QUOTE.payoutLimit,
  }
}

// Cash-outs in several statuses, so the status screens can be seen on
// fixtures. Label, tone and detail are rows of API doc 5.1, verbatim.
const rampRow = (
  n: number,
  status: string,
  label: string,
  tone: string,
  detail: string | null,
  usdcAmount: string,
) => ({
  ...FIXTURE_RAMP_BUILT,
  id: `00000000-0000-4000-8000-0000000000${(0xd2 + n).toString(16)}`,
  usdcAmount,
  createdAt: `2026-10-${20 - n}T12:00:00.000Z`,
  validUntil: `2026-10-${20 - n}T12:30:00.000Z`,
  status,
  label,
  tone,
  detail,
})

export const FIXTURE_RAMP_LIST = [
  rampRow(0, "submitted", "Checking", "pending", null, "25500000"),
  rampRow(
    1,
    "credited",
    "Queued on Base",
    "pending",
    "A queue position is not a payout date.",
    "100000000",
  ),
  rampRow(
    2,
    "bridge_payment_submitted",
    "Bank payout submitted",
    "pending",
    null,
    "40000000",
  ),
  rampRow(3, "paid", "Paid", "success", null, "250000000"),
  rampRow(
    4,
    "redeem_reverted",
    "Transaction reverted - nothing was redeemed",
    "neutral",
    null,
    "10000000",
  ),
  rampRow(
    5,
    "expired",
    "Expired - no redemption found",
    "neutral",
    "No redemption with this transaction's reference was found on Hydration before its deadline, and the transaction can no longer be used. If you approved HOLLAR for it, that approval stays in place unused; only a redeem you sign yourself can spend it.",
    "15000000",
  ),
  rampRow(
    6,
    "unpayable",
    "Needs attention",
    "attention",
    "The vault could not pay the payout address; the amount is held for it.",
    "30000000",
  ),
]

export const FIXTURE_RAMPS_LIST_RESPONSE = {
  ...FIXTURE_RAMPS,
  ramps: FIXTURE_RAMP_LIST,
}
