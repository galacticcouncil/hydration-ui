# money-market-v2 is carved into chain, derive and actions

v1 has no seam between transport, math and UI: `poolSlice.ts` instantiates
contract clients, `poolSelectors.ts` runs the Aave formatters, and 90 files in
`apps/main` reach into five separate entrypoints. None of the math can be
exercised without a provider.

v2 is carved so the pure part is pure:

- **`chain`** — transport, decode and validation. The only module that touches a
  network, and the only place zod runs, because it is the only place untrusted
  data enters.
- **`derive`** — the ported Aave math, split by subject into `reserves`,
  `account` and `incentives`. No transport, no clock.
- **`actions`** — tx building.
- **`markets`** — market descriptors, data only.

Three facts make the pure side genuinely pure. Time is an explicit parameter on
every derivation, never a clock read — interest accrues continuously, so a
reserve is only meaningful *at* an instant, and the caller says which.
Transport and market descriptor arrive per call (ADR in #6). And the core holds
no state at all: v1's zustand store carries transaction, modal and preference
state, all of which is UI state that v2 has no reason to know about.

**On splitting `derive` three ways.** A single `derive` module would be deeper —
two functions hiding all 46 ported functions, against three interfaces to learn.
The split was chosen deliberately so the incentive port has its own home, but it
buys less than it looks: `account` depends on both `reserves` and `incentives`,
so the three are not independently useful and the seams between them are
internal, not places anything varies. If the incentive work lands without
needing that separation, collapsing `derive` back into one module is the
simplification to reach for.
