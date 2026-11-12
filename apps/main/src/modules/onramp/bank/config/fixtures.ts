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
 * server/lib/identity/walletSession.mjs; example in API doc 4,
 * POST /v1/auth/challenge): 11 lines joined by "\n".
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
    "Sign in to the Hydration ramp. Signing this message does not move funds, approve any transaction or bind a wallet.",
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
 * server/lib/identity/walletBinding.mjs, version 2; example in API doc 4,
 * POST /v1/customers/me/bind/challenge).
 */
export const renderFixtureBindMessage = (args: {
  address: string
  nonce: string
  issuedAt: string
  expiresAt: string
}) =>
  [
    "Hydration Ramp wallet binding (v2)",
    `URI: ${FIXTURE_APP_ORIGIN}`,
    "",
    "Purpose: bind this wallet to your ramp account for payouts and refunds.",
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
