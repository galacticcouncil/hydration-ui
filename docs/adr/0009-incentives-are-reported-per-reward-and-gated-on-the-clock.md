# Incentive APR is reported per reward, and gated on the actual clock

Two things about how `money-market-v2` reports incentives depart from the
blueprint, and both will make its numbers differ from v1's.

## The expiry check uses the real timestamp

Aave's `rewardEmissionActive` is
`reward.emissionEndTimestamp > reward.incentivesLastUpdateTimestamp` — it
compares the emission's end date against the *controller's last update*, never
against the current time. When it returns false the APR is hard-coded to `'0'`;
when true, an APR is computed.

That misreports live data on Hydration today. Reserve `0x…02b2` carries BNC and
HDX rewards with **non-zero** `emissionPerSecond` and an end timestamp of
2025-07-30. If the controller's last update for that asset predates the end
date, upstream reports a live APR for an emission that stopped more than a year
ago.

v2 treats an emission as active when `at < emissionEndTimestamp`, using the
timestamp that ADR-0004 already threads through every derivation. Rewards that
are expired or zeroed simply do not appear — the rewards list is empty in all
three of the cases the live data shows: never configured (the GIGA pool), rate
dropped to zero, and past its end date.

**Consequence:** v2 will report no reward where v1 shows a phantom APR. When the
two disagree on an incentive APR, this is the first thing to check, and a v2
zero is more likely to be right than a v1 number.

A second consequence of collapsing all three absences to an empty list: nothing
distinguishes "this reserve never had rewards" from "its programme ended". If
the debug route or a future UI needs to say "ended", that distinction has to be
reintroduced.

## No composed net APY

A reserve summary carries its base APY and its list of per-reward incentive
APRs. It does **not** carry a combined net figure.

This follows from ADR-0005: the app overrides base APY for some reserves, so a
net figure composed inside v2 would be built on a number the app is about to
replace, and would be silently wrong exactly where the override applies.
Composition belongs to whoever knows the final base APY — the app.
