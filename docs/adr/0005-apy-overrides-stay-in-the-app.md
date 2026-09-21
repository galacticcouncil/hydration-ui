# Reported APY is the interest-rate model's, not the app's displayed APY

In v1, after the whole Aave pipeline computes `supplyAPY` and
`variableBorrowAPY`, `poolSelectors.ts:200` runs an app-supplied
`externalApyData` map over the result and overwrites those fields. For some
reserves the yield Hydration shows does not come from Aave's interest-rate model
at all.

`money-market-v2` does not do this. Its `derive` module reports what the
interest-rate model says, and composing external yield on top is the app's job.

This keeps the ported math a pure function of chain state, testable against
Aave's own fixtures with no Hydration-specific escape hatch threaded through its
interface — which matters because the port's correctness is the whole risk of
this rewrite.

The consequence is real and worth stating: **v2's APY for an overridden reserve
will not match what the Hydration UI displays.** Anyone comparing the two,
including whoever builds the `/money-market` debug route, must expect that and
not treat it as a porting bug. Modelling APY provenance as a first-class concept
inside v2 was considered and rejected as more than this rewrite needs; it
remains the honest fix if the divergence becomes confusing.
