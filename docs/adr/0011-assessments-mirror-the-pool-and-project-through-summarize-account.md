# Action assessments mirror the pool's validation and project through `summarizeAccount`

v1 decides what a user may do with rules written inline in each modal, and they
disagree with each other. Regular borrow skips the frozen, paused, e-mode and
isolation checks that Hollar borrow runs; supply never checks paused or
inactive; siloed borrowing is checked nowhere. The health-factor blocks sit at
`< 1`, `≤ 1` and `< 1.01` depending on the action. Each action also projects its
"after" health factor with its own hand-written formula, and those disagree too —
supply ignores the e-mode liquidation threshold that withdraw uses.

`money-market-v2` replaces all of it with one pure **assessment** per action in
`core`'s `actions` module, beside the builders. Two choices shape every
assessment:

**Blockers mirror the pool's own validation** — Aave v3's `ValidationLogic` for
that action — not v1's lists. The question a blocker answers is "would this
revert, or leave the account liquidatable", so the contract is the source of
truth. v1 contributes only notices and UX. The health-factor blocker is the
contract's: projected HF below 1 with debt outstanding, the same for every
action. Rules the contract enforces but no reserve currently triggers, such as
siloed borrowing, are included, because they are data-driven and switch on
without a code change.

**Projection re-runs `summarizeAccount`** on the positions the action would
leave behind — a scaled balance adjusted by the amount at the current index, a
collateral flag flipped, an e-mode category replaced — rather than porting a
formula per action. The projected account is computed by exactly the code that
computes the current one, so e-mode, isolation and the no-debt sentinel cannot
drift between them.

## Considered options

- **Port v1's rule lists and fix the catalogued bugs.** Smaller now, but every
  list stays a hand-maintained copy that drifts the next time an action is
  added — which is how borrow and Hollar borrow diverged.
- **Port v1's per-action projection formulas, corrected.** More code to test,
  and a second implementation of account maths beside `summarizeAccount` that
  can disagree with it.

## Consequences

**v2 will block things v1 allows.** Borrowing a frozen or paused reserve,
supplying a paused one, enabling collateral that breaks isolation mode, and
disabling e-mode into a sub-1 health factor are all blocked in v2 and were only
caught by the contract in v1. These are not porting bugs.

**Projection costs a full account summary per evaluation.** An assessment is
re-evaluated on every keystroke and every tick, and each one re-summarizes every
position — acceptable at the ~30 reserves a market holds today.

**Contract checks v2 cannot see stay with the app.** Oracle-side validation and
anything else not present in the read payloads surfaces only as a revert,
mapped by the app (ADR-0007).
