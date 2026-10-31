# Bank deposit history handoff

The Portfolio Deposits table supports bank records alongside on-chain journeys.
Bank deposit modals open this page instead of rendering a second history list.
USD/EUR rows reuse shared Amount, Icon, PortfolioDepositStatus, TableRowAction
and modal components on desktop/mobile.

## Current source: unconfigured

`apps/main/src/api/bankDeposits.ts` owns the query and history record contract.
It returns `source: "unconfigured"` and an empty deposit list. No samples are
injected into the Portfolio page, with or without a connected wallet. The old
preview adapter and preview notice have been removed. The query key changed to
avoid reusing cached sample records from the earlier preview.

Only the existing on-chain history is populated until the bank API is wired.
The empty state appears when there are no real records. Bank row rendering,
filters and Details remain in place for the future integration.

## API integration boundary

Replace the query function in `bankDepositHistoryQuery(address)` with the app's
authenticated backend request and return `source: "provider"`. Replace the
unconfigured query key segment, gate requests on a valid wallet/session, and
choose refetch/invalidation rules for pending records. Keep provider credentials
server-side. Fetch all history pages or expose explicit pagination.

Normalize provider status into the portfolio status union, retaining the original
provider status/reference and real epoch timestamps. Use trusted backend wallet
bindings for ownership; a query-string address is not bank API authorization.
Supply `recipientAddress` to show the verified destination account.

The amount/symbol represent incoming USD/EUR. Do not infer an exchange rate or
HOLLAR credit amount. A provider must supply real output amounts and assets
separately before the UI can display credited proceeds.

`PortfolioBankDeposits.utils.ts` handles filters/search;
`PortfolioBankDepositDetail.tsx` handles Details. Bank records use `kind: "bank"`
and never expose on-chain Claim actions. On-chain journeys retain existing
claims and explorer links.

Bank setup, instructions and tracking modals still use their existing preview
flows; this history cleanup does not connect onboarding or payment submission
to a provider. Those flows are separate from the Portfolio history source.
