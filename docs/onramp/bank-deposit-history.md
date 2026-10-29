# Bank deposit history handoff

Bank deposits now appear in the normal Portfolio Deposits table (including its
embedded Overview section). The bank deposit modals link to this page rather
than rendering a second history list. USD/EUR rows use shared Amount, Icon,
PortfolioDepositStatus, TableRowAction and modal components on desktop/mobile.

## Current source: preview

`apps/main/src/api/bankDeposits.ts` owns the query and history record contract.
Its `bankDeposits.preview.ts` adapter maps the same `exampleDeposits` used by the
bank flow. The response explicitly identifies its source as `preview`; the page
and Details dialog label that data as samples. No preview rows enter account
balances, signing, claims, XCScan stores or bank APIs. Samples are available even
without a wallet so the UI can be reviewed. There is no special URL flag.

The displayed amounts are the original incoming USD/EUR amounts. No exchange
rate or HOLLAR credit amount is inferred. HOLLAR is the intended destination
asset, not proof of settlement. A provider record must supply any real output
amount and asset separately before the UI can display credited proceeds.

## API integration boundary

Replace the query function in `bankDepositHistoryQuery(address)` with the
app's authenticated backend request and return `source: "provider"`. Replace
the preview query key segment, gate requests on a valid wallet/session, and
choose refetch/invalidation rules for pending records. Never send provider API
keys from the browser. Fetch all history pages or expose explicit pagination.

Normalize provider status into the portfolio status union, retain the original
provider status/reference, and supply real epoch timestamps. Use trusted backend
wallet bindings for ownership; do not treat a query-string address as bank API
authorization. The placeholder destination wallet label in the table must be
replaced with the provider's verified recipient when integrating live records.

`PortfolioBankDeposits.utils.ts` handles filters/search; `PortfolioBankDepositDetail.tsx`
handles bank Details. Bank records are discriminated with `kind: "bank"` and do
not expose on-chain Claim actions. On-chain journeys retain their existing
claims and explorer links. The bank detail notice disappears only when the
adapter explicitly reports a provider source.

The bank setup, instructions and tracking modals remain preview flows. Moving
history to the Portfolio page does not make onboarding or payment submission
live, nor does the preview status selector reconcile bank or chain balances.
